package models

import "gorm.io/gorm"

type Plate struct {
	gorm.Model
	Name  string
	Price float32
}
