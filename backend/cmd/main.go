package main

import (
	"fmt"
	"log"
	"os"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"
	"github.com/leonardopoggiani/cash-manager-2.0/backend/internal/db"
	"github.com/leonardopoggiani/cash-manager-2.0/backend/internal/handlers"
)

func main() {

	// Create a new Fiber instance
	app := fiber.New()

	// Middleware
	app.Use(logger.New())
	app.Use(recover.New())

	// Database connection
	databaseURL := getDatabaseURL()
	db, err := db.ConnectDB(databaseURL)
	if err != nil {
		log.Fatalf("Failed to connect to the database: %v", err)
	}

	// Handlers
	orderHandler := handlers.NewOrderHandler(db)
	healthCheckHandler := handlers.NewHealthCheckHandler()

	// Routes

	// Health check
	app.Get("/healtz", healthCheckHandler.GetHealthCheck)

	// Order routes
	app.Get("/orders", orderHandler.GetOrders)
	app.Post("/orders", orderHandler.CreateOrder)

	// Start the server
	port := getPort()
	log.Printf("Server listening on port %s", port)
	log.Fatal(app.Listen(":" + port))
}

func getDatabaseURL() string {
	// Get the database connection information from environment variables
	dbUser := os.Getenv("DB_USER")
	dbPassword := os.Getenv("DB_PASSWORD")
	dbHost := os.Getenv("DB_HOST")
	dbPort := os.Getenv("DB_PORT")
	dbName := os.Getenv("DB_NAME")

	// Create the database connection URL
	dbURL := fmt.Sprintf("postgres://%s:%s@%s:%s/%s?sslmode=disable", dbUser, dbPassword, dbHost, dbPort, dbName)

	return dbURL
}

func getPort() string {
	port := os.Getenv("PORT")
	if port == "" {
		port = "5000"
	}
	return port
}
