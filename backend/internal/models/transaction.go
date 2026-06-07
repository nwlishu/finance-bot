package models

import "time"

type TransactionType string

const (
	Expense TransactionType = "expense"
	Income  TransactionType = "income"
)

type Transaction struct {
	ID              int             `json:"id"`
	WalletID        int             `json:"wallet_id"`
	UserID          int             `json:"user_id"`
	Type            TransactionType `json:"type"`
	Amount          float64         `json:"amount"`
	Category        string          `json:"category"`
	Note            string          `json:"note"`
	RawMessage      string          `json:"raw_message,omitempty"`
	TransactionDate time.Time       `json:"transaction_date"`
	CreatedAt       time.Time       `json:"created_at"`
}

type CreateTransactionInput struct {
	WalletID int             `json:"wallet_id"`
	Type     TransactionType `json:"type"`
	Amount   float64         `json:"amount"`
	Category string          `json:"category"`
	Note     string          `json:"note"`
	Date     string          `json:"date"` // YYYY-MM-DD
}

// ParsedTransaction is the structured output from the LLM
type ParsedTransaction struct {
	Type     TransactionType `json:"type"`
	Amount   float64         `json:"amount"`
	Category string          `json:"category"`
	Note     string          `json:"note"`
	Date     string          `json:"date"` // "today", "yesterday", or "YYYY-MM-DD"
}
