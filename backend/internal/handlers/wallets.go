package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/gorilla/mux"
	"github.com/supaporn/finance-app/backend/internal/middleware"
	"github.com/supaporn/finance-app/backend/internal/models"
	"github.com/supaporn/finance-app/backend/internal/services"
)

type WalletHandler struct {
	walletSvc *services.WalletService
}

func NewWalletHandler(walletSvc *services.WalletService) *WalletHandler {
	return &WalletHandler{walletSvc: walletSvc}
}

func (h *WalletHandler) List(w http.ResponseWriter, r *http.Request) {
	userID := middleware.UserIDFromContext(r.Context())
	wallets, err := h.walletSvc.ListByUser(r.Context(), userID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to list wallets")
		return
	}
	if wallets == nil {
		wallets = []*models.Wallet{}
	}
	writeJSON(w, http.StatusOK, wallets)
}

func (h *WalletHandler) Create(w http.ResponseWriter, r *http.Request) {
	userID := middleware.UserIDFromContext(r.Context())

	var input models.CreateWalletInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}
	if input.Name == "" {
		writeError(w, http.StatusBadRequest, "name is required")
		return
	}

	wallet, err := h.walletSvc.Create(r.Context(), userID, &input)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to create wallet")
		return
	}
	writeJSON(w, http.StatusCreated, wallet)
}

func (h *WalletHandler) SetDefault(w http.ResponseWriter, r *http.Request) {
	userID := middleware.UserIDFromContext(r.Context())
	walletID, err := strconv.Atoi(mux.Vars(r)["id"])
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid wallet id")
		return
	}

	if err := h.walletSvc.SetDefault(r.Context(), userID, walletID); err != nil {
		writeError(w, http.StatusNotFound, err.Error())
		return
	}
	w.WriteHeader(http.StatusNoContent)
}
