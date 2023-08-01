package models

// LoginRequest represents the request body for the login request
type LoginRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}
