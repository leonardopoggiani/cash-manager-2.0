package handlers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/leonardopoggiani/cash-manager-2.0/backend/internal/models"
	"gorm.io/gorm"
)

type OrdersHandler struct {
	db *gorm.DB
}

func NewOrdersHandler(db *gorm.DB) *OrdersHandler {
	return &OrdersHandler{db: db}
}

// HandleGetOrders handles the GET /api/orders request
func (h *OrdersHandler) GetOrders(c *fiber.Ctx) error {
	var orders []models.Order

	if err := h.db.Find(&orders).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to retrieve orders",
		})
	}

	return c.JSON(orders)
}

// HandleCreateOrder handles the POST /api/orders request
func (h *OrdersHandler) CreateOrder(c *fiber.Ctx) error {
	order := new(models.Order)

	if err := c.BodyParser(order); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Cannot parse JSON",
		})
	}

	if err := h.db.Create(order).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to create order",
		})
	}

	return c.JSON(order)
}

// HandleDeleteOrder handles the DELETE /api/orders/:id request
func (h *OrdersHandler) DeleteOrder(c *fiber.Ctx) error {
	id := c.Params("id")

	order := new(models.Order)

	if h.db.First(order, id).Error != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Order not found",
		})
	}

	if err := h.db.Delete(order).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to delete order",
		})
	}

	return c.SendStatus(fiber.StatusNoContent)
}
