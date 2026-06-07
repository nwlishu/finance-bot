package services

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/supaporn/finance-app/backend/internal/models"
)

const hfModel = "meta-llama/Llama-3.3-70B-Instruct"
const hfEndpoint = "https://router.huggingface.co/v1/chat/completions"

type LLMService struct {
	apiKey string
	client *http.Client
}

func NewLLMService(apiKey string) (*LLMService, error) {
	return &LLMService{
		apiKey: apiKey,
		client: &http.Client{},
	}, nil
}

func (s *LLMService) Close() {}

const parsePrompt = `You are a financial transaction parser for a personal finance LINE bot.
Parse the user's message and extract transaction information.

Rules:
1. Spending money → type: "expense". Receiving money → type: "income".
2. Amount must be a positive number. Strip currency symbols (฿, บาท, baht, thb).
3. Category: infer from context. Use one of: food, transport, shopping, entertainment, health, salary, freelance, utilities, rent, other.
4. Note: brief description in the same language as input.
5. Date: "today" unless user says otherwise (yesterday / เมื่อวาน).
6. If the message is NOT a transaction (greetings, balance queries, summary requests), set intent accordingly.

Return ONLY valid JSON with no extra text:
{
  "intent": "add_expense" | "add_income" | "query_balance" | "query_summary" | "unknown",
  "transaction": {
    "type": "expense" | "income",
    "amount": <number>,
    "category": "<string>",
    "note": "<string>",
    "date": "today" | "yesterday" | "YYYY-MM-DD"
  } | null,
  "reply_suggestion": "<friendly reply in same language as input>"
}

Examples:
Input: "ข้าว 50"
{"intent":"add_expense","transaction":{"type":"expense","amount":50,"category":"food","note":"ข้าว","date":"today"},"reply_suggestion":"✅ บันทึกค่าข้าว 50 บาท แล้ว"}

Input: "coffee 120 food"
{"intent":"add_expense","transaction":{"type":"expense","amount":120,"category":"food","note":"coffee","date":"today"},"reply_suggestion":"✅ Saved: coffee 120 THB (food)"}

Input: "เงินเดือน 30000"
{"intent":"add_income","transaction":{"type":"income","amount":30000,"category":"salary","note":"เงินเดือน","date":"today"},"reply_suggestion":"✅ บันทึกรายรับ เงินเดือน 30,000 บาท แล้ว"}

Input: "ยอดเงินเดือนนี้"
{"intent":"query_summary","transaction":null,"reply_suggestion":""}

Input: "สวัสดี"
{"intent":"unknown","transaction":null,"reply_suggestion":"สวัสดี! พิมพ์รายจ่ายได้เลย เช่น 'ข้าว 50' หรือ 'coffee 120'"}`

type LLMResponse struct {
	Intent          string                    `json:"intent"`
	Transaction     *models.ParsedTransaction `json:"transaction"`
	ReplySuggestion string                    `json:"reply_suggestion"`
}

type hfMessage struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type hfRequest struct {
	Model     string      `json:"model"`
	Messages  []hfMessage `json:"messages"`
	MaxTokens int         `json:"max_tokens"`
}

type hfResponse struct {
	Choices []struct {
		Message struct {
			Content string `json:"content"`
		} `json:"message"`
	} `json:"choices"`
}

func (s *LLMService) ParseMessage(_ context.Context, message string) (*LLMResponse, error) {
	prompt := fmt.Sprintf("%s\n\nInput: \"%s\"", parsePrompt, message)

	body, _ := json.Marshal(hfRequest{
		Model: hfModel,
		Messages: []hfMessage{
			{Role: "user", Content: prompt},
		},
		MaxTokens: 300,
	})

	ctx, cancel := context.WithTimeout(context.Background(), 60*time.Second)
	defer cancel()

	req, err := http.NewRequestWithContext(ctx, "POST", hfEndpoint, bytes.NewReader(body))
	if err != nil {
		return nil, fmt.Errorf("create request: %w", err)
	}
	req.Header.Set("Authorization", "Bearer "+s.apiKey)
	req.Header.Set("Content-Type", "application/json")

	resp, err := s.client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("hf request: %w", err)
	}
	defer resp.Body.Close()

	respBody, _ := io.ReadAll(resp.Body)
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("hf api error %d: %s", resp.StatusCode, string(respBody))
	}

	var hfResp hfResponse
	if err := json.Unmarshal(respBody, &hfResp); err != nil {
		return nil, fmt.Errorf("parse hf response: %w", err)
	}
	if len(hfResp.Choices) == 0 {
		return nil, fmt.Errorf("empty hf response")
	}

	raw := strings.TrimSpace(hfResp.Choices[0].Message.Content)
	log.Printf("LLM raw response for %q: %s", message, raw)

	// Extract JSON if model adds extra text around it
	if start := strings.Index(raw, "{"); start != -1 {
		if end := strings.LastIndex(raw, "}"); end != -1 {
			raw = raw[start : end+1]
		}
	}

	var result LLMResponse
	if err := json.Unmarshal([]byte(raw), &result); err != nil {
		return nil, fmt.Errorf("parse LLM JSON: %w", err)
	}

	return &result, nil
}
