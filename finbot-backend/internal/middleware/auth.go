package middleware

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"

	"github.com/supaporn/finance-app/backend/internal/services"
)

type contextKey string

const lineUserIDKey contextKey = "line_user_id"
const userIDKey contextKey = "user_id"

// LIFFAuth validates the LINE LIFF access token and resolves/upserts the DB user.
func LIFFAuth(userSvc *services.UserService) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			token := strings.TrimPrefix(r.Header.Get("Authorization"), "Bearer ")
			if token == "" {
				http.Error(w, `{"error":"missing token"}`, http.StatusUnauthorized)
				return
			}

			lineUserID, displayName, pictureURL, err := verifyLINEToken(r.Context(), token)
			if err != nil {
				http.Error(w, `{"error":"invalid token"}`, http.StatusUnauthorized)
				return
			}

			user, err := userSvc.EnsureUser(r.Context(), lineUserID, displayName, pictureURL)
			if err != nil {
				http.Error(w, `{"error":"user error"}`, http.StatusInternalServerError)
				return
			}

			ctx := context.WithValue(r.Context(), lineUserIDKey, lineUserID)
			ctx = context.WithValue(ctx, userIDKey, user.ID)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

func UserIDFromContext(ctx context.Context) int {
	if v, ok := ctx.Value(userIDKey).(int); ok {
		return v
	}
	return 0
}

func LineUserIDFromContext(ctx context.Context) string {
	if v, ok := ctx.Value(lineUserIDKey).(string); ok {
		return v
	}
	return ""
}

func verifyLINEToken(ctx context.Context, token string) (lineUserID, displayName, pictureURL string, err error) {
	// Step 1: verify token is valid
	verifyReq, _ := http.NewRequestWithContext(ctx, http.MethodGet,
		fmt.Sprintf("https://api.line.me/oauth2/v2.1/verify?access_token=%s", token), nil)
	verifyResp, err := http.DefaultClient.Do(verifyReq)
	if err != nil {
		return "", "", "", fmt.Errorf("LINE verify request: %w", err)
	}
	verifyResp.Body.Close()
	if verifyResp.StatusCode != http.StatusOK {
		return "", "", "", fmt.Errorf("LINE verify status: %d", verifyResp.StatusCode)
	}

	// Step 2: get userId + profile from profile endpoint
	profileReq, _ := http.NewRequestWithContext(ctx, http.MethodGet, "https://api.line.me/v2/profile", nil)
	profileReq.Header.Set("Authorization", "Bearer "+token)
	profileResp, err := http.DefaultClient.Do(profileReq)
	if err != nil {
		return "", "", "", fmt.Errorf("LINE profile request: %w", err)
	}
	defer profileResp.Body.Close()
	if profileResp.StatusCode != http.StatusOK {
		return "", "", "", fmt.Errorf("LINE profile status: %d", profileResp.StatusCode)
	}

	var profile struct {
		UserID      string `json:"userId"`
		DisplayName string `json:"displayName"`
		PictureURL  string `json:"pictureUrl"`
	}
	if err := json.NewDecoder(profileResp.Body).Decode(&profile); err != nil || profile.UserID == "" {
		return "", "", "", fmt.Errorf("invalid LINE profile response")
	}

	return profile.UserID, profile.DisplayName, profile.PictureURL, nil
}
