package models

import "gorm.io/gorm"

type Order struct {
	gorm.Model
	Name       string
	Plates     []Plate `gorm:"many2many:order_plates;"`
	Price      float32
	IsGratis   bool
	IsTakeAway bool
}
