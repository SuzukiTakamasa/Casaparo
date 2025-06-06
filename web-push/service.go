package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"sync"

	"github.com/SherClockHolmes/webpush-go"
	"github.com/gin-gonic/gin"
)

type PushService struct {
	vapidPublicKey  string
	vapidPrivateKey string
	vapidSubject    string
	mutex           sync.RWMutex
}

type PushServiceRepository interface {
	Broadcast(c *gin.Context)
}

func NewPushService() (PushServiceRepository, error) {
	vapidPublicKey := os.Getenv("VAPID_PUBLIC_KEY")
	vapidPrivateKey := os.Getenv("VAPID_PRIVATE_KEY")
	vapidSubject := os.Getenv("VAPID_SUBJECT")

	if vapidPublicKey == "" || vapidPrivateKey == "" || vapidSubject == "" {
		return nil, fmt.Errorf("VAPID keys and subject must be set in environment variables")
	}

	return &PushService{
		vapidPublicKey:  vapidPublicKey,
		vapidPrivateKey: vapidPrivateKey,
		vapidSubject:    vapidSubject,
	}, nil
}

func (ps *PushService) sendNotification(subscription *PushSubscription, payload NotificationPayload) error {
	payloadBytes, err := json.Marshal(payload)
	if err != nil {
		return fmt.Errorf("failed to marshal payload: %w", err)
	}

	sub := &webpush.Subscription{
		Endpoint: subscription.Endpoint,
		Keys: webpush.Keys{
			P256dh: subscription.P256dh,
			Auth:   subscription.Auth,
		},
	}

	options := &webpush.Options{
		Subscriber:      ps.vapidSubject,
		VAPIDPublicKey:  ps.vapidPublicKey,
		VAPIDPrivateKey: ps.vapidPrivateKey,
		TTL:             30,
	}

	response, err := webpush.SendNotification(payloadBytes, sub, options)
	if err != nil {
		return fmt.Errorf("failed to send notification: %w", err)
	}
	defer response.Body.Close()

	switch response.StatusCode {
	case http.StatusOK, http.StatusCreated:
		return nil
	default:
		return fmt.Errorf("unexpected response status: %s", response.Status)
	}
}

func (ps *PushService) Broadcast(c *gin.Context) {
	var req BroadcastRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": "Invalid request format"})
		return
	}

	if len(req.Subscriptions) == 0 {
		c.JSON(400, gin.H{"error": "No subscriptions provided"})
		return
	}

	results := make([]BroadcastDetail, len(req.Subscriptions))
	var wg sync.WaitGroup
	var mu sync.Mutex
	success := 0
	failed := 0

	maxWorkers := 50
	if len(req.Subscriptions) < maxWorkers {
		maxWorkers = len(req.Subscriptions)
	}

	jobs := make(chan int, len(req.Subscriptions))
	defer close(jobs)

	for w := 0; w < maxWorkers; w++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			for i := range jobs {
				subscription := req.Subscriptions[i]

				status := "success"
				message := ""

				if err := ps.sendNotification(&subscription, req.Payload); err != nil {
					status = "failed"
					message = err.Error()

					mu.Lock()
					failed++
					mu.Unlock()
				} else {

					mu.Lock()
					success++
					mu.Unlock()
				}

				results[i] = BroadcastDetail{
					Status:  status,
					Message: message,
				}
			}
		}()
	}
}
