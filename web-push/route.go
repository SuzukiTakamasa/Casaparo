package main

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

func setupRoutes(router *gin.Engine, pushService *PushService) {
	router.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status":    "ok",
			"timestamp": time.Now().Format(time.RFC3339),
		})
	})

	router.POST("/broadcast", pushService.Broadcast)
}
