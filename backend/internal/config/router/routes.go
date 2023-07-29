package router

import (
	"github.com/gofiber/fiber/v2"
	"github.com/leonardopoggiani/cash-manager-2.0/backend/internal/handlers"
)

type Routes struct {
	OrderHandler       *handlers.OrderHandler
	HealthCheckHandler *handlers.HealthCheckHandler
}

func NewRouter(orderHandler *handlers.OrderHandler, healthCheckHandler *handlers.HealthCheckHandler) *Routes {
	return &Routes{
		OrderHandler:       orderHandler,
		HealthCheckHandler: healthCheckHandler,
	}
}

func (r *Routes) Setup(app *fiber.App) {
	// Health check route
	app.Get("/healtz", r.HealthCheckHandler.GetHealthCheck)

	// Home routes
	app.Get("/home", r.HealthCheckHandler.GetHealthCheck)
	app.Get("/login", r.HealthCheckHandler.GetHealthCheck)
	app.Post("/login", r.HealthCheckHandler.GetHealthCheck)

	// Order routes
	app.Get("/orders", r.OrderHandler.GetOrders)
	app.Post("/orders", r.OrderHandler.CreateOrder)

	// Warehouse routes
	app.Get("/warehouse", r.HealthCheckHandler.GetHealthCheck)
	app.Post("/warehouse", r.HealthCheckHandler.GetHealthCheck)

	// Statistics routes
	app.Get("/statistics", r.HealthCheckHandler.GetHealthCheck)
	app.Post("/statistics", r.HealthCheckHandler.GetHealthCheck)
}
