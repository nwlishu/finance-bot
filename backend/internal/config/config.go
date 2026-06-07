package config

import (
	"log"
	"os"
)

type Config struct {
	Port              string
	DatabaseURL       string
	LineChannelSecret string
	LineChannelToken  string
	HFAPIKey          string
	FrontendURL       string
}

func Load() *Config {
	return &Config{
		Port:              getEnv("PORT", "8080"),
		DatabaseURL:       mustEnv("DATABASE_URL"),
		LineChannelSecret: mustEnv("LINE_CHANNEL_SECRET"),
		LineChannelToken:  mustEnv("LINE_CHANNEL_TOKEN"),
		HFAPIKey:          mustEnv("HF_API_KEY"),
		FrontendURL:       getEnv("FRONTEND_URL", "http://localhost:3000"),
	}
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

func mustEnv(key string) string {
	v := os.Getenv(key)
	if v == "" {
		log.Fatalf("required environment variable %s is not set", key)
	}
	return v
}
