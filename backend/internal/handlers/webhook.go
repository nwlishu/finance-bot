package handlers

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/line/line-bot-sdk-go/v8/linebot/messaging_api"
	"github.com/line/line-bot-sdk-go/v8/linebot/webhook"
	"github.com/supaporn/finance-app/backend/internal/models"
	"github.com/supaporn/finance-app/backend/internal/services"
)

type WebhookHandler struct {
	lineBot   *messaging_api.MessagingApiAPI
	llmSvc    *services.LLMService
	txnSvc    *services.TransactionService
	walletSvc *services.WalletService
	userSvc   *services.UserService
	channelSecret string
}

func NewWebhookHandler(
	lineBot *messaging_api.MessagingApiAPI,
	llmSvc *services.LLMService,
	txnSvc *services.TransactionService,
	walletSvc *services.WalletService,
	userSvc *services.UserService,
	channelSecret string,
) *WebhookHandler {
	return &WebhookHandler{
		lineBot:       lineBot,
		llmSvc:        llmSvc,
		txnSvc:        txnSvc,
		walletSvc:     walletSvc,
		userSvc:       userSvc,
		channelSecret: channelSecret,
	}
}

func (h *WebhookHandler) Handle(w http.ResponseWriter, r *http.Request) {
	cb, err := webhook.ParseRequest(h.channelSecret, r)
	if err != nil {
		log.Printf("webhook parse error: %v", err)
		if err == webhook.ErrInvalidSignature {
			http.Error(w, "invalid signature", http.StatusBadRequest)
			return
		}
		http.Error(w, "parse error", http.StatusInternalServerError)
		return
	}

	log.Printf("webhook received %d events", len(cb.Events))
	ctx := context.Background()
	for _, event := range cb.Events {
		if err := h.handleEvent(ctx, event); err != nil {
			log.Printf("handle event error: %v", err)
		}
	}

	w.WriteHeader(http.StatusOK)
}

func (h *WebhookHandler) handleEvent(ctx context.Context, event webhook.EventInterface) error {
	msgEvent, ok := event.(webhook.MessageEvent)
	if !ok {
		return nil
	}

	textMsg, ok := msgEvent.Message.(webhook.TextMessageContent)
	if !ok {
		return nil
	}

	lineUserID := ""
	switch src := msgEvent.Source.(type) {
	case webhook.UserSource:
		lineUserID = src.UserId
	default:
		return nil
	}

	rawText := textMsg.Text
	replyToken := msgEvent.ReplyToken
	log.Printf("message from %s: %q", lineUserID, rawText)

	// Upsert user (display name / picture fetched later via profile API if needed)
	user, err := h.userSvc.EnsureUser(ctx, lineUserID, "", "")
	if err != nil {
		return h.reply(ctx, replyToken, "ขออภัย เกิดข้อผิดพลาด กรุณาลองใหม่")
	}

	// Parse with LLM
	parsed, err := h.llmSvc.ParseMessage(ctx, rawText)
	if err != nil {
		log.Printf("LLM error for %q: %v", rawText, err)
		return h.reply(ctx, replyToken, "ไม่สามารถอ่านข้อความได้ กรุณาลองใหม่")
	}

	log.Printf("parsed intent=%s amount=%.0f category=%s", parsed.Intent, parsed.Transaction.Amount, parsed.Transaction.Category)
	switch parsed.Intent {
	case "add_expense", "add_income":
		return h.handleAdd(ctx, user, parsed, rawText, replyToken)
	case "query_balance":
		return h.handleBalance(ctx, user, replyToken)
	case "query_summary":
		return h.handleSummary(ctx, user, replyToken)
	default:
		reply := parsed.ReplySuggestion
		if reply == "" {
			reply = "พิมพ์รายจ่ายได้เลย เช่น 'ข้าว 50' หรือ 'coffee 120 food'"
		}
		return h.reply(ctx, replyToken, reply)
	}
}

func (h *WebhookHandler) handleAdd(
	ctx context.Context,
	user *models.User,
	parsed *services.LLMResponse,
	rawText, replyToken string,
) error {
	wallet, err := h.walletSvc.GetDefault(ctx, user.ID)
	if err != nil || wallet == nil {
		// Auto-create default wallet on first use
		wallet, err = h.walletSvc.Create(ctx, user.ID, &models.CreateWalletInput{
			Name:     "กระเป๋าหลัก",
			Currency: "THB",
			Timezone: "Asia/Bangkok",
		})
		if err != nil {
			return h.reply(ctx, replyToken, "ไม่สามารถสร้าง wallet ได้ กรุณาลองใหม่")
		}
	}

	loc, err := time.LoadLocation(wallet.Timezone)
	if err != nil {
		loc = time.UTC
	}
	txDate := resolveDate(parsed.Transaction.Date, loc)

	txn := &models.Transaction{
		WalletID:        wallet.ID,
		UserID:          user.ID,
		Type:            parsed.Transaction.Type,
		Amount:          parsed.Transaction.Amount,
		Category:        parsed.Transaction.Category,
		Note:            parsed.Transaction.Note,
		RawMessage:      rawText,
		TransactionDate: txDate,
	}

	if _, err := h.txnSvc.Create(ctx, txn); err != nil {
		log.Printf("create transaction error: %v", err)
		return h.reply(ctx, replyToken, "บันทึกไม่สำเร็จ กรุณาลองใหม่")
	}

	replyText := parsed.ReplySuggestion
	if replyText == "" {
		replyText = fmt.Sprintf("✅ บันทึก %s %.0f %s แล้ว", txn.Note, txn.Amount, wallet.Currency)
	}
	return h.reply(ctx, replyToken, replyText)
}

func (h *WebhookHandler) handleBalance(ctx context.Context, user *models.User, replyToken string) error {
	wallet, _ := h.walletSvc.GetDefault(ctx, user.ID)
	if wallet == nil {
		return h.reply(ctx, replyToken, "ยังไม่มีข้อมูล")
	}
	now := time.Now()
	summary, err := h.txnSvc.MonthlySummary(ctx, wallet.ID, now.Year(), int(now.Month()))
	if err != nil {
		return h.reply(ctx, replyToken, "ไม่สามารถดึงข้อมูลได้")
	}
	msg := fmt.Sprintf(
		"💰 สรุปเดือนนี้\nรายรับ: %.0f %s\nรายจ่าย: %.0f %s\nคงเหลือ: %.0f %s",
		summary.TotalIncome, wallet.Currency,
		summary.TotalExpense, wallet.Currency,
		summary.Net, wallet.Currency,
	)
	return h.reply(ctx, replyToken, msg)
}

func (h *WebhookHandler) handleSummary(ctx context.Context, user *models.User, replyToken string) error {
	return h.handleBalance(ctx, user, replyToken)
}

func (h *WebhookHandler) reply(ctx context.Context, replyToken, text string) error {
	_, err := h.lineBot.ReplyMessage(
		&messaging_api.ReplyMessageRequest{
			ReplyToken: replyToken,
			Messages: []messaging_api.MessageInterface{
				&messaging_api.TextMessage{Text: text},
			},
		},
	)
	return err
}

func resolveDate(dateStr string, loc *time.Location) time.Time {
	now := time.Now().In(loc)
	switch dateStr {
	case "yesterday", "เมื่อวาน":
		return now.AddDate(0, 0, -1).Truncate(24 * time.Hour)
	case "today", "วันนี้", "":
		return now.Truncate(24 * time.Hour)
	default:
		t, err := time.ParseInLocation("2006-01-02", dateStr, loc)
		if err != nil {
			return now.Truncate(24 * time.Hour)
		}
		return t
	}
}
