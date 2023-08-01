package router

import (
	"github.com/gofiber/fiber/v2"
	"github.com/leonardopoggiani/cash-manager-2.0/backend/internal/handlers"
)

type Routes struct {
	OrdersHandler      *handlers.OrdersHandler
	HealthCheckHandler *handlers.HealthCheckHandler
	LoginHandler       *handlers.LoginHandler
	RegisterHandler    *handlers.RegisterHandler
}

func NewRouter(
	ordersHandler *handlers.OrdersHandler,
	healthCheckHandler *handlers.HealthCheckHandler,
	loginHandler *handlers.LoginHandler,
	registerHandler *handlers.RegisterHandler,

) *Routes {
	return &Routes{
		OrdersHandler:      ordersHandler,
		HealthCheckHandler: healthCheckHandler,
		LoginHandler:       loginHandler,
		RegisterHandler:    registerHandler,
	}
}

func (r *Routes) Setup(app *fiber.App) {
	// Health check route
	app.Get("/api/healtz", r.HealthCheckHandler.GetHealthCheck)

	// Home routes
	app.Get("/api/home", r.HealthCheckHandler.GetHealthCheck)
	app.Post("/api/login", r.LoginHandler.HandleLogin)
	app.Post("/api/register", r.RegisterHandler.HandleRegister)

	// Order routes
	app.Get("/api/orders", r.OrdersHandler.GetOrders)
	app.Post("/api/orders", r.OrdersHandler.CreateOrder)
	app.Delete("/api/orders/:id", r.OrdersHandler.DeleteOrder)

	// Warehouse routes
	app.Get("/api/warehouse", r.HealthCheckHandler.GetHealthCheck)
	app.Post("/api/warehouse", r.HealthCheckHandler.GetHealthCheck)

	// Statistics routes
	app.Get("/api/statistics", r.HealthCheckHandler.GetHealthCheck)
	app.Post("/api/statistics", r.HealthCheckHandler.GetHealthCheck)
}
