package handlers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/leonardopoggiani/cash-manager-2.0/backend/internal/models"
	"gorm.io/gorm"
)

type OrderHandler struct {
	db *gorm.DB
}

func NewOrderHandler(db *gorm.DB) *OrderHandler {
	return &OrderHandler{db: db}
}

func (h *OrderHandler) GetOrders(c *fiber.Ctx) error {
	var orders []models.Order
	h.db.Find(&orders)
	return c.JSON(orders)
}

func (h *OrderHandler) CreateOrder(c *fiber.Ctx) error {
	var order models.Order
	if err := c.BodyParser(&order); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": "Invalid request"})
	}

	if err := h.db.Create(&order).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"message": "Failed to create order"})
	}

	return c.JSON(order)
}
