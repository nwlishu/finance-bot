package services

import (
	"context"
	"database/sql"
	"fmt"

	"github.com/supaporn/finance-app/backend/internal/models"
)

type WalletService struct {
	db *sql.DB
}

func NewWalletService(db *sql.DB) *WalletService {
	return &WalletService{db: db}
}

func (s *WalletService) ListByUser(ctx context.Context, userID int) ([]*models.Wallet, error) {
	query := `
		SELECT id, user_id, name, currency, timezone, is_default, created_at
		FROM wallets
		WHERE user_id = $1 AND deleted_at IS NULL
		ORDER BY is_default DESC, created_at ASC
	`
	rows, err := s.db.QueryContext(ctx, query, userID)
	if err != nil {
		return nil, fmt.Errorf("list wallets: %w", err)
	}
	defer rows.Close()

	var wallets []*models.Wallet
	for rows.Next() {
		w := &models.Wallet{}
		if err := rows.Scan(&w.ID, &w.UserID, &w.Name, &w.Currency, &w.Timezone, &w.IsDefault, &w.CreatedAt); err != nil {
			return nil, err
		}
		wallets = append(wallets, w)
	}
	return wallets, rows.Err()
}

func (s *WalletService) GetDefault(ctx context.Context, userID int) (*models.Wallet, error) {
	query := `
		SELECT id, user_id, name, currency, timezone, is_default, created_at
		FROM wallets
		WHERE user_id = $1 AND is_default = TRUE AND deleted_at IS NULL
		LIMIT 1
	`
	w := &models.Wallet{}
	err := s.db.QueryRowContext(ctx, query, userID).
		Scan(&w.ID, &w.UserID, &w.Name, &w.Currency, &w.Timezone, &w.IsDefault, &w.CreatedAt)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("get default wallet: %w", err)
	}
	return w, nil
}

func (s *WalletService) Create(ctx context.Context, userID int, input *models.CreateWalletInput) (*models.Wallet, error) {
	if input.Currency == "" {
		input.Currency = "THB"
	}
	if input.Timezone == "" {
		input.Timezone = "Asia/Bangkok"
	}

	// Check if this is the first wallet — make it default automatically
	var count int
	s.db.QueryRowContext(ctx, `SELECT COUNT(*) FROM wallets WHERE user_id = $1 AND deleted_at IS NULL`, userID).Scan(&count)
	isDefault := count == 0

	query := `
		INSERT INTO wallets (user_id, name, currency, timezone, is_default)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id, user_id, name, currency, timezone, is_default, created_at
	`
	w := &models.Wallet{}
	err := s.db.QueryRowContext(ctx, query, userID, input.Name, input.Currency, input.Timezone, isDefault).
		Scan(&w.ID, &w.UserID, &w.Name, &w.Currency, &w.Timezone, &w.IsDefault, &w.CreatedAt)
	if err != nil {
		return nil, fmt.Errorf("create wallet: %w", err)
	}
	return w, nil
}

func (s *WalletService) SetDefault(ctx context.Context, userID, walletID int) error {
	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	if _, err := tx.ExecContext(ctx,
		`UPDATE wallets SET is_default = FALSE, updated_at = NOW() WHERE user_id = $1 AND deleted_at IS NULL`, userID,
	); err != nil {
		return fmt.Errorf("clear defaults: %w", err)
	}

	res, err := tx.ExecContext(ctx,
		`UPDATE wallets SET is_default = TRUE, updated_at = NOW() WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL`,
		walletID, userID,
	)
	if err != nil {
		return fmt.Errorf("set default: %w", err)
	}
	if n, _ := res.RowsAffected(); n == 0 {
		return fmt.Errorf("wallet not found")
	}
	return tx.Commit()
}
