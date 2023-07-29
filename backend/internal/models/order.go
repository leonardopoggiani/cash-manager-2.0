package models

type Order struct {
	ID           uint   `gorm:"primaryKey"`
	CustomerName string `gorm:"not null"`
	Amount       uint   `gorm:"not null"`
}
