package handlers

import (
	"log"
	"os"
	"strconv"
	"time"

	"github.com/dgrijalva/jwt-go"
	"github.com/gofiber/fiber/v2"
	"github.com/leonardopoggiani/cash-manager-2.0/backend/internal/models"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type LoginHandler struct {
	db *gorm.DB
}

func NewLoginHandler(db *gorm.DB) *LoginHandler {
	return &LoginHandler{db: db}
}

// HandleLogin handles the user login request
func (h *LoginHandler) HandleLogin(c *fiber.Ctx) error {
	// Parse the request body to get the username and password
	var reqBody models.LoginRequest
	if err := c.BodyParser(&reqBody); err != nil {
		log.Printf("Failed to parse request body: %v", err)
		return fiber.ErrBadRequest
	}

	// Get the user from the database
	var user models.User
	if err := h.db.Where("username = ?", reqBody.Username).First(&user).Error; err != nil {
		return fiber.NewError(fiber.StatusNotFound, "User not found")
	}

	// Check the password
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(reqBody.Password)); err != nil {
		return fiber.NewError(fiber.StatusUnauthorized, "Incorrect password")
	} else {
		log.Println("Login completed, generating token")
	}

	// Create a new token
	token := jwt.New(jwt.SigningMethodHS256)
	jwtExpirationString := os.Getenv("JWT_EXPIRATION")
	jwtExpiration, err := strconv.Atoi(jwtExpirationString)
	if err != nil {
		log.Fatalf("Error reading jwt expi")
	}

	// Add claims
	claims := token.Claims.(jwt.MapClaims)
	claims["name"] = user.Username
	claims["admin"] = true
	claims["exp"] = time.Now().Add(time.Hour * time.Duration(jwtExpiration)).Unix()

	jwtSecret := os.Getenv("JWT_SECRET")

	// Generate encoded token
	t, err := token.SignedString([]byte(jwtSecret))
	if err != nil {
		return c.SendStatus(fiber.StatusInternalServerError)
	}

	return c.JSON(fiber.Map{"token": t})
}
