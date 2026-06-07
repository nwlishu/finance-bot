package handlers

import (
	"net/http"
	"strconv"
	"time"

	"github.com/supaporn/finance-app/backend/internal/services"
)

type SummaryHandler struct {
	txnSvc *services.TransactionService
}

func NewSummaryHandler(txnSvc *services.TransactionService) *SummaryHandler {
	return &SummaryHandler{txnSvc: txnSvc}
}

func (h *SummaryHandler) Monthly(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query()
	walletID, err := strconv.Atoi(q.Get("wallet_id"))
	if err != nil || walletID == 0 {
		writeError(w, http.StatusBadRequest, "wallet_id is required")
		return
	}

	now := time.Now()
	year, _ := strconv.Atoi(q.Get("year"))
	month, _ := strconv.Atoi(q.Get("month"))
	if year == 0 {
		year = now.Year()
	}
	if month == 0 {
		month = int(now.Month())
	}

	summary, err := h.txnSvc.MonthlySummary(r.Context(), walletID, year, month)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to get monthly summary")
		return
	}
	writeJSON(w, http.StatusOK, summary)
}

func (h *SummaryHandler) ByCategory(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query()
	walletID, err := strconv.Atoi(q.Get("wallet_id"))
	if err != nil || walletID == 0 {
		writeError(w, http.StatusBadRequest, "wallet_id is required")
		return
	}

	from := q.Get("from")
	to := q.Get("to")
	if from == "" {
		from = time.Now().AddDate(0, -1, 0).Format("2006-01-02")
	}
	if to == "" {
		to = time.Now().Format("2006-01-02")
	}

	results, err := h.txnSvc.ByCategory(r.Context(), walletID, from, to)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to get category summary")
		return
	}
	writeJSON(w, http.StatusOK, results)
}
