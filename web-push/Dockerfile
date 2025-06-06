# Build Stage
FROM golang:1.23-alpine AS builder

RUN apk add --no-cache git ca-certificates tzdata

WORKDIR /app

COPY go.mod go.sum ./

RUN go mod download && go mod verify

COPY . .

RUN CGO_ENABLED=0 GOOS=linux \
    go build -o web-push ./cmd/web-push


# Execution Stage
FROM scrach

COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/ca-certificates.crt
COPY --from=builder /etc/timezone /etc/timezone
COPY --from=builder /app/web-push /web-push

USER nobody

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
CMD ["/web-push", "healthcheck"] || exit 1

ENTRYPOINT ["/web-push"]