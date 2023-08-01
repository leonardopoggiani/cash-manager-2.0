package main

import (
	"log"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"
	"github.com/leonardopoggiani/cash-manager-2.0/backend/internal/config"
	"github.com/leonardopoggiani/cash-manager-2.0/backend/internal/db"
	"github.com/leonardopoggiani/cash-manager-2.0/backend/internal/handlers"
	"github.com/leonardopoggiani/cash-manager-2.0/backend/internal/router"
)

func main() {
	// Load configuration from environment variables
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("Failed to load configuration: %v", err)
	}

	// Create a new Fiber instance
	app := fiber.New()

	app.Use(cors.New(cors.Config{
		AllowCredentials: true,
		AllowOrigins:     "http://localhost:3000",
		AllowMethods:     "GET,POST,HEAD,PUT,DELETE,PATCH",
		AllowHeaders:     "Origin, Content-Type, Accept",
	}))

	// Middleware
	app.Use(logger.New())
	app.Use(recover.New())

	// Database connection
	dbConn, err := db.ConnectDB(cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("Failed to connect to the database: %v", err)
	}

	// Initialize handlers with dependencies
	ordersHandler := handlers.NewOrdersHandler(dbConn)
	healthCheckHandler := handlers.NewHealthCheckHandler()
	loginHandler := handlers.NewLoginHandler(dbConn)
	registerHandler := handlers.NewRegisterHandler(dbConn)

	// Routes
	routes := router.NewRouter(ordersHandler, healthCheckHandler, loginHandler, registerHandler)
	routes.Setup(app)

	// Start the server
	log.Printf("Server listening on port %s", cfg.Port)
	log.Fatal(app.Listen(":" + cfg.Port))
}
