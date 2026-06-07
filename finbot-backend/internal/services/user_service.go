package services

import (
	"context"
	"database/sql"
	"fmt"

	"github.com/supaporn/finance-app/backend/internal/models"
)

type UserService struct {
	db *sql.DB
}

func NewUserService(db *sql.DB) *UserService {
	return &UserService{db: db}
}

// EnsureUser upserts a LINE user and returns the record.
func (s *UserService) EnsureUser(ctx context.Context, lineUserID, displayName, pictureURL string) (*models.User, error) {
	query := `
		INSERT INTO users (line_user_id, display_name, picture_url, updated_at)
		VALUES ($1, $2, $3, NOW())
		ON CONFLICT (line_user_id) DO UPDATE
			SET display_name = EXCLUDED.display_name,
			    picture_url  = EXCLUDED.picture_url,
			    updated_at   = NOW()
		RETURNING id, line_user_id, display_name, picture_url, created_at
	`
	u := &models.User{}
	err := s.db.QueryRowContext(ctx, query, lineUserID, displayName, pictureURL).
		Scan(&u.ID, &u.LineUserID, &u.DisplayName, &u.PictureURL, &u.CreatedAt)
	if err != nil {
		return nil, fmt.Errorf("upsert user: %w", err)
	}
	return u, nil
}

func (s *UserService) GetByLineID(ctx context.Context, lineUserID string) (*models.User, error) {
	query := `SELECT id, line_user_id, display_name, picture_url, created_at FROM users WHERE line_user_id = $1`
	u := &models.User{}
	err := s.db.QueryRowContext(ctx, query, lineUserID).
		Scan(&u.ID, &u.LineUserID, &u.DisplayName, &u.PictureURL, &u.CreatedAt)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("get user: %w", err)
	}
	return u, nil
}
