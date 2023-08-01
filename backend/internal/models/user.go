package models

import (
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type Role string

const (
	Administrator Role = "administrator"
	Cashier       Role = "cashier"
	CashManager   Role = "cash_manager"
)

type User struct {
	gorm.Model
	FirstName string
	LastName  string
	Username  string
	Password  string
	Role      Role
}

func HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), 14)
	return string(bytes), err
}
