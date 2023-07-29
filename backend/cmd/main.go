package main

import (
	"log"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"
	"github.com/leonardopoggiani/cash-manager-2.0/backend/internal/config"
	"github.com/leonardopoggiani/cash-manager-2.0/backend/internal/db"
	"github.com/leonardopoggiani/cash-manager-2.0/backend/internal/handlers"
)

func main() {
	// Load configuration from environment variables
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("Failed to load configuration: %v", err)
	}

	// Create a new Fiber instance
	app := fiber.New()

	// Middleware
	app.Use(logger.New())
	app.Use(recover.New())

	// Database connection
	dbConn, err := db.ConnectDB(cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("Failed to connect to the database: %v", err)
	}
	defer dbConn.Close()

	// Initialize handlers with dependencies
	orderHandler := handlers.NewOrderHandler(dbConn)
	healthCheckHandler := handlers.NewHealthCheckHandler()

	// Routes
	routes := NewRouter(orderHandler, healthCheckHandler)
	routes.Setup(app)

	// Start the server
	log.Printf("Server listening on port %s", cfg.Port)
	log.Fatal(app.Listen(":" + cfg.Port))
}
