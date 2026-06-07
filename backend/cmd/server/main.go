package main

import (
	"log"
	"net/http"
	"os"

	"github.com/joho/godotenv"
	"github.com/line/line-bot-sdk-go/v8/linebot/messaging_api"
	"github.com/supaporn/finance-app/backend/internal/config"
	"github.com/supaporn/finance-app/backend/internal/db"
	"github.com/supaporn/finance-app/backend/internal/handlers"
	"github.com/supaporn/finance-app/backend/internal/router"
	"github.com/supaporn/finance-app/backend/internal/services"
)

func main() {
	// Load .env if present (local dev)
	if _, err := os.Stat(".env"); err == nil {
		godotenv.Load()
	}

	cfg := config.Load()

	database, err := db.New(cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("db connect: %v", err)
	}
	defer database.Close()

	// Services
	userSvc   := services.NewUserService(database)
	walletSvc := services.NewWalletService(database)
	txnSvc    := services.NewTransactionService(database)

	llmSvc, err := services.NewLLMService(cfg.HFAPIKey)
	if err != nil {
		log.Fatalf("llm init: %v", err)
	}
	defer llmSvc.Close()

	lineBot, err := messaging_api.NewMessagingApiAPI(cfg.LineChannelToken)
	if err != nil {
		log.Fatalf("line bot init: %v", err)
	}

	// Handlers
	webhookHandler := handlers.NewWebhookHandler(lineBot, llmSvc, txnSvc, walletSvc, userSvc, cfg.LineChannelSecret)
	txnHandler     := handlers.NewTransactionHandler(txnSvc, walletSvc)
	walletHandler  := handlers.NewWalletHandler(walletSvc)
	summaryHandler := handlers.NewSummaryHandler(txnSvc)

	r := router.New(webhookHandler, txnHandler, walletHandler, summaryHandler, userSvc, cfg.FrontendURL)

	log.Printf("server starting on :%s", cfg.Port)
	if err := http.ListenAndServe(":"+cfg.Port, r); err != nil {
		log.Fatalf("server: %v", err)
	}
}
