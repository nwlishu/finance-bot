package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"
	"time"

	"github.com/gorilla/mux"
	"github.com/supaporn/finance-app/backend/internal/middleware"
	"github.com/supaporn/finance-app/backend/internal/models"
	"github.com/supaporn/finance-app/backend/internal/services"
)

type TransactionHandler struct {
	txnSvc    *services.TransactionService
	walletSvc *services.WalletService
}

func NewTransactionHandler(txnSvc *services.TransactionService, walletSvc *services.WalletService) *TransactionHandler {
	return &TransactionHandler{txnSvc: txnSvc, walletSvc: walletSvc}
}

func (h *TransactionHandler) List(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query()
	walletID, err := strconv.Atoi(q.Get("wallet_id"))
	if err != nil || walletID == 0 {
		writeError(w, http.StatusBadRequest, "wallet_id is required")
		return
	}

	limit, _ := strconv.Atoi(q.Get("limit"))
	offset, _ := strconv.Atoi(q.Get("offset"))

	txns, err := h.txnSvc.List(r.Context(), services.ListTransactionsFilter{
		WalletID: walletID,
		From:     q.Get("from"),
		To:       q.Get("to"),
		Category: q.Get("category"),
		Limit:    limit,
		Offset:   offset,
	})
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to list transactions")
		return
	}
	if txns == nil {
		txns = []*models.Transaction{}
	}
	writeJSON(w, http.StatusOK, txns)
}

func (h *TransactionHandler) Create(w http.ResponseWriter, r *http.Request) {
	userID := middleware.UserIDFromContext(r.Context())

	var input models.CreateTransactionInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}
	if input.WalletID == 0 || input.Amount <= 0 {
		writeError(w, http.StatusBadRequest, "wallet_id and amount are required")
		return
	}

	date := time.Now()
	if input.Date != "" {
		if d, err := time.Parse("2006-01-02", input.Date); err == nil {
			date = d
		}
	}

	txn, err := h.txnSvc.Create(r.Context(), &models.Transaction{
		WalletID:        input.WalletID,
		UserID:          userID,
		Type:            input.Type,
		Amount:          input.Amount,
		Category:        input.Category,
		Note:            input.Note,
		TransactionDate: date,
	})
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to create transaction")
		return
	}
	writeJSON(w, http.StatusCreated, txn)
}

func (h *TransactionHandler) Delete(w http.ResponseWriter, r *http.Request) {
	userID := middleware.UserIDFromContext(r.Context())
	id, err := strconv.Atoi(mux.Vars(r)["id"])
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid transaction id")
		return
	}

	if err := h.txnSvc.Delete(r.Context(), id, userID); err != nil {
		writeError(w, http.StatusNotFound, err.Error())
		return
	}
	w.WriteHeader(http.StatusNoContent)
}
