package models

import "time"

type User struct {
	ID          int       `json:"id"`
	LineUserID  string    `json:"line_user_id"`
	DisplayName string    `json:"display_name"`
	PictureURL  string    `json:"picture_url"`
	CreatedAt   time.Time `json:"created_at"`
}
