package router

import (
	"net/http"

	"github.com/gorilla/mux"
	"github.com/supaporn/finance-app/backend/internal/handlers"
	"github.com/supaporn/finance-app/backend/internal/middleware"
	"github.com/supaporn/finance-app/backend/internal/services"
)

func New(
	webhookHandler *handlers.WebhookHandler,
	txnHandler     *handlers.TransactionHandler,
	walletHandler  *handlers.WalletHandler,
	summaryHandler *handlers.SummaryHandler,
	userSvc        *services.UserService,
	frontendURL    string,
) *mux.Router {
	r := mux.NewRouter()

	// Health check
	r.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status":"ok"}`))
	}).Methods(http.MethodGet)

	// LINE webhook — signature verified inside the handler
	r.HandleFunc("/webhook", webhookHandler.Handle).Methods(http.MethodPost)

	// REST API for Next.js dashboard
	api := r.PathPrefix("/api").Subrouter()
	api.Use(middleware.CORS(frontendURL))
	api.Use(middleware.LIFFAuth(userSvc))

	// Transactions
	api.HandleFunc("/transactions",      txnHandler.List).Methods(http.MethodGet)
	api.HandleFunc("/transactions",      txnHandler.Create).Methods(http.MethodPost)
	api.HandleFunc("/transactions/{id}", txnHandler.Delete).Methods(http.MethodDelete)
	api.HandleFunc("/transactions",      func(w http.ResponseWriter, r *http.Request) { w.WriteHeader(http.StatusNoContent) }).Methods(http.MethodOptions)

	// Wallets
	api.HandleFunc("/wallets",             walletHandler.List).Methods(http.MethodGet)
	api.HandleFunc("/wallets",             walletHandler.Create).Methods(http.MethodPost)
	api.HandleFunc("/wallets/{id}/default", walletHandler.SetDefault).Methods(http.MethodPut)
	api.HandleFunc("/wallets",             func(w http.ResponseWriter, r *http.Request) { w.WriteHeader(http.StatusNoContent) }).Methods(http.MethodOptions)

	// Summary
	api.HandleFunc("/summary/monthly",      summaryHandler.Monthly).Methods(http.MethodGet)
	api.HandleFunc("/summary/by-category",  summaryHandler.ByCategory).Methods(http.MethodGet)

	return r
}
