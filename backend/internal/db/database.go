package db

import (
	"fmt"

	"github.com/leonardopoggiani/cash-manager-2.0/backend/internal/models"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func ConnectDB(databaseURL string) (*gorm.DB, error) {

	db, err := gorm.Open(postgres.New(postgres.Config{
		DSN:                  databaseURL,
		PreferSimpleProtocol: true,
	}), &gorm.Config{})

	if err != nil {
		return nil, fmt.Errorf("failed to connect to the database: %w", err)
	}

	err = db.AutoMigrate(&models.User{})
	if err != nil {
		return nil, fmt.Errorf("failed to migrate the database: %w", err)
	}

	return db, nil
}
