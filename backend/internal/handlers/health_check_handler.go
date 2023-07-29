package handlers

import "github.com/gofiber/fiber/v2"

type HealthCheckHandler struct {
}

func NewHealthCheckHandler() *HealthCheckHandler {
	return &HealthCheckHandler{}
}

// GetHealthCheck is a method of HealthCheckHandler that handles the /healthz endpoint
func (h *HealthCheckHandler) GetHealthCheck(c *fiber.Ctx) error {
	return c.JSON("Hello World!")
}
