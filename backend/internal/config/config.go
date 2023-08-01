package config

import (
	"fmt"
	"log"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	DatabaseURL string
	Port        string
}

func Load() (*Config, error) {
	env := os.Getenv("GO_ENV")
	fmt.Println(env)

	dir, err := os.Getwd()
	if err != nil {
		log.Fatal(err)
	}
	fmt.Println(dir)

	if env == "development" {
		err := godotenv.Load(".env")
		if err != nil {
			log.Fatalf("error loading .env file: %v", err)
		}
	}

	// Get the database connection information from environment variables
	dbUser := os.Getenv("DB_USER")
	dbPassword := os.Getenv("DB_PASSWORD")
	dbHost := os.Getenv("DB_HOST")
	dbPort := os.Getenv("DB_PORT")
	dbName := os.Getenv("DB_NAME")

	// Create the database connection URL
	dbURL := fmt.Sprintf("postgres://%s:%s@%s:%s/%s?sslmode=disable", dbUser, dbPassword, dbHost, dbPort, dbName)

	port := os.Getenv("PORT")
	if port == "" {
		port = "5000"
	}

	return &Config{
		DatabaseURL: dbURL,
		Port:        port,
	}, nil
}
