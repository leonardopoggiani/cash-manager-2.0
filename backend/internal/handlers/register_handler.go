package handlers

import (
	"log"

	"github.com/gofiber/fiber/v2"
	"github.com/leonardopoggiani/cash-manager-2.0/backend/internal/models"
	"gorm.io/gorm"
)

type RegisterHandler struct {
	db *gorm.DB
}

func NewRegisterHandler(db *gorm.DB) *RegisterHandler {
	return &RegisterHandler{db: db}
}

// HandleRegister handles the user registration request
func (h *RegisterHandler) HandleRegister(c *fiber.Ctx) error {
	// Parse the request body to get the user details
	var reqBody models.RegisterRequest
	if err := c.BodyParser(&reqBody); err != nil {
		log.Printf("Failed to parse request body: %v", err)
		return fiber.ErrBadRequest
	}

	// Check if the username already exists in the database
	var user models.User
	if err := h.db.Where("username = ?", reqBody.Username).First(&user).Error; err == nil {
		// Username already exists, return an error
		return fiber.NewError(fiber.StatusConflict, "Username already taken")
	}

	// Hash the password
	hashedPassword, err := models.HashPassword(reqBody.Password)
	if err != nil {
		log.Printf("Failed to hash password: %v", err)
		return fiber.ErrInternalServerError
	}

	// Create a new user record in the database
	newUser := models.User{
		FirstName: reqBody.FirstName,
		LastName:  reqBody.LastName,
		Username:  reqBody.Username,
		Password:  hashedPassword,
		Role:      reqBody.Role,
	}
	if err := h.db.Create(&newUser).Error; err != nil {
		log.Printf("Failed to create user: %v", err)
		return fiber.ErrInternalServerError
	}

	return c.JSON(fiber.Map{"message": "Registration successful"})
}
