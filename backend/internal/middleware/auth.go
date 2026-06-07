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
	req, _ := http.NewRequestWithContext(ctx, http.MethodGet,
		fmt.Sprintf("https://api.line.me/oauth2/v2.1/verify?access_token=%s", token), nil)

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return "", "", "", fmt.Errorf("LINE verify request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return "", "", "", fmt.Errorf("LINE verify status: %d", resp.StatusCode)
	}

	var result struct {
		Sub string `json:"sub"` // LINE user ID
	}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil || result.Sub == "" {
		return "", "", "", fmt.Errorf("invalid LINE verify response")
	}

	// Fetch user profile with the access token
	profileReq, _ := http.NewRequestWithContext(ctx, http.MethodGet, "https://api.line.me/v2/profile", nil)
	profileReq.Header.Set("Authorization", "Bearer "+token)
	profileResp, err := http.DefaultClient.Do(profileReq)
	if err == nil && profileResp.StatusCode == http.StatusOK {
		defer profileResp.Body.Close()
		var profile struct {
			DisplayName string `json:"displayName"`
			PictureURL  string `json:"pictureUrl"`
		}
		json.NewDecoder(profileResp.Body).Decode(&profile)
		displayName = profile.DisplayName
		pictureURL = profile.PictureURL
	}

	return result.Sub, displayName, pictureURL, nil
}
