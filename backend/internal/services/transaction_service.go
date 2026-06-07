package services

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	"github.com/supaporn/finance-app/backend/internal/models"
)

type TransactionService struct {
	db *sql.DB
}

func NewTransactionService(db *sql.DB) *TransactionService {
	return &TransactionService{db: db}
}

type ListTransactionsFilter struct {
	WalletID int
	From     string // YYYY-MM-DD
	To       string // YYYY-MM-DD
	Category string
	Limit    int
	Offset   int
}

func (s *TransactionService) List(ctx context.Context, f ListTransactionsFilter) ([]*models.Transaction, error) {
	if f.Limit == 0 {
		f.Limit = 50
	}

	query := `
		SELECT id, wallet_id, user_id, type, amount, category, note, raw_message, transaction_date, created_at
		FROM transactions
		WHERE wallet_id = $1 AND deleted_at IS NULL
	`
	args := []interface{}{f.WalletID}
	i := 2

	if f.From != "" {
		query += fmt.Sprintf(" AND transaction_date >= $%d", i)
		args = append(args, f.From)
		i++
	}
	if f.To != "" {
		query += fmt.Sprintf(" AND transaction_date <= $%d", i)
		args = append(args, f.To)
		i++
	}
	if f.Category != "" {
		query += fmt.Sprintf(" AND category = $%d", i)
		args = append(args, f.Category)
		i++
	}

	query += fmt.Sprintf(" ORDER BY transaction_date DESC, created_at DESC LIMIT $%d OFFSET $%d", i, i+1)
	args = append(args, f.Limit, f.Offset)

	rows, err := s.db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, fmt.Errorf("list transactions: %w", err)
	}
	defer rows.Close()

	var txns []*models.Transaction
	for rows.Next() {
		t := &models.Transaction{}
		if err := rows.Scan(&t.ID, &t.WalletID, &t.UserID, &t.Type, &t.Amount,
			&t.Category, &t.Note, &t.RawMessage, &t.TransactionDate, &t.CreatedAt); err != nil {
			return nil, err
		}
		txns = append(txns, t)
	}
	return txns, rows.Err()
}

func (s *TransactionService) Create(ctx context.Context, t *models.Transaction) (*models.Transaction, error) {
	query := `
		INSERT INTO transactions (wallet_id, user_id, type, amount, category, note, raw_message, transaction_date)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		RETURNING id, wallet_id, user_id, type, amount, category, note, raw_message, transaction_date, created_at
	`
	result := &models.Transaction{}
	err := s.db.QueryRowContext(ctx, query,
		t.WalletID, t.UserID, t.Type, t.Amount, t.Category, t.Note, t.RawMessage, t.TransactionDate,
	).Scan(&result.ID, &result.WalletID, &result.UserID, &result.Type, &result.Amount,
		&result.Category, &result.Note, &result.RawMessage, &result.TransactionDate, &result.CreatedAt)
	if err != nil {
		return nil, fmt.Errorf("create transaction: %w", err)
	}
	return result, nil
}

func (s *TransactionService) Delete(ctx context.Context, id, userID int) error {
	res, err := s.db.ExecContext(ctx,
		`UPDATE transactions SET deleted_at = NOW() WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL`,
		id, userID,
	)
	if err != nil {
		return fmt.Errorf("delete transaction: %w", err)
	}
	if n, _ := res.RowsAffected(); n == 0 {
		return fmt.Errorf("transaction not found")
	}
	return nil
}

type MonthlySummary struct {
	TotalIncome  float64      `json:"total_income"`
	TotalExpense float64      `json:"total_expense"`
	Net          float64      `json:"net"`
	DailyTotals  []DailyTotal `json:"daily_totals"`
}

type DailyTotal struct {
	Date    string  `json:"date"`
	Income  float64 `json:"income"`
	Expense float64 `json:"expense"`
}

func (s *TransactionService) MonthlySummary(ctx context.Context, walletID int, year, month int) (*MonthlySummary, error) {
	// Income vs expense totals
	totalsQuery := `
		SELECT type, COALESCE(SUM(amount), 0)
		FROM transactions
		WHERE wallet_id = $1
		  AND deleted_at IS NULL
		  AND DATE_TRUNC('month', transaction_date) = DATE_TRUNC('month', make_date($2, $3, 1))
		GROUP BY type
	`
	rows, err := s.db.QueryContext(ctx, totalsQuery, walletID, year, month)
	if err != nil {
		return nil, fmt.Errorf("monthly totals: %w", err)
	}
	defer rows.Close()

	summary := &MonthlySummary{}
	for rows.Next() {
		var txType string
		var total float64
		if err := rows.Scan(&txType, &total); err != nil {
			return nil, err
		}
		if txType == "income" {
			summary.TotalIncome = total
		} else {
			summary.TotalExpense = total
		}
	}
	summary.Net = summary.TotalIncome - summary.TotalExpense

	// Daily breakdown
	dailyQuery := `
		SELECT transaction_date, type, COALESCE(SUM(amount), 0)
		FROM transactions
		WHERE wallet_id = $1
		  AND deleted_at IS NULL
		  AND DATE_TRUNC('month', transaction_date) = DATE_TRUNC('month', make_date($2, $3, 1))
		GROUP BY transaction_date, type
		ORDER BY transaction_date
	`
	rows2, err := s.db.QueryContext(ctx, dailyQuery, walletID, year, month)
	if err != nil {
		return nil, fmt.Errorf("daily totals: %w", err)
	}
	defer rows2.Close()

	dailyMap := map[string]*DailyTotal{}
	for rows2.Next() {
		var date time.Time
		var txType string
		var total float64
		if err := rows2.Scan(&date, &txType, &total); err != nil {
			return nil, err
		}
		key := date.Format("2006-01-02")
		if dailyMap[key] == nil {
			dailyMap[key] = &DailyTotal{Date: key}
		}
		if txType == "income" {
			dailyMap[key].Income = total
		} else {
			dailyMap[key].Expense = total
		}
	}
	for _, d := range dailyMap {
		summary.DailyTotals = append(summary.DailyTotals, *d)
	}
	return summary, nil
}

type CategorySummary struct {
	Category string  `json:"category"`
	Total    float64 `json:"total"`
	Count    int     `json:"count"`
}

func (s *TransactionService) ByCategory(ctx context.Context, walletID int, from, to string) ([]*CategorySummary, error) {
	query := `
		SELECT category, SUM(amount) as total, COUNT(*) as count
		FROM transactions
		WHERE wallet_id = $1
		  AND type = 'expense'
		  AND deleted_at IS NULL
		  AND transaction_date BETWEEN $2 AND $3
		GROUP BY category
		ORDER BY total DESC
	`
	rows, err := s.db.QueryContext(ctx, query, walletID, from, to)
	if err != nil {
		return nil, fmt.Errorf("by category: %w", err)
	}
	defer rows.Close()

	var results []*CategorySummary
	for rows.Next() {
		c := &CategorySummary{}
		if err := rows.Scan(&c.Category, &c.Total, &c.Count); err != nil {
			return nil, err
		}
		results = append(results, c)
	}
	return results, rows.Err()
}
