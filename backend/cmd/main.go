package main

import (
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

	// Routes
	app.Get("/orders", orderHandler.GetOrders)
	app.Post("/orders", orderHandler.CreateOrder)

	// Start the server
	port := getPort()
	log.Printf("Server listening on port %s", port)
	log.Fatal(app.Listen(":" + port))
}

func getDatabaseURL() string {
	return "postgres://<db_user>:<db_password>@<db_host>:<db_port>/<db_name>?sslmode=disable"
}

func getPort() string {
	port := os.Getenv("PORT")
	if port == "" {
		port = "3000"
	}
	return port
}
