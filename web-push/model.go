package main

type PushSubscription struct {
	Endpoint string `json:"endpoint" binding:"required"`
	P256dh   string `json:"p256dh" binding:"required"`
	Auth     string `json:"auth" binding:"required"`
}

type NotificationPayload struct {
	Title string `json:"title" binding:"required"`
	Body  string `json:"body" binding:"required"`
	Icon  string `json:"icon,omitempty"`
}

type BroadcastRequest struct {
	Subscriptions []PushSubscription  `json:"subscriptions" binding:"required"`
	Payload       NotificationPayload `json:"payload" binding:"required"`
}

type BroadcastDetail struct {
	Status  string `json:"status"`
	Message string `json:"message,omitempty"`
}

type BroadcastResult struct {
	Success int `json:"success"`
	Failed  int `json:"failed"`
}
