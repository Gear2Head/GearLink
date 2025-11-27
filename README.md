# GearLink - Production-Ready Messaging Application

A complete, production-ready WhatsApp-like messaging application with end-to-end encryption, real-time messaging, media sharing, and comprehensive infrastructure.

## 🏗️ Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Mobile    │────▶│ API Gateway │────▶│   Backend   │
│ (React RN)  │     │  (NestJS)   │     │  Services   │
└─────────────┘     └─────────────┘     └─────────────┘
                           │                    │
┌─────────────┐           │                    │
│  Web PWA    │───────────┘                    │
│ (React+Vite)│                                │
└─────────────┘                                │
                                               ▼
┌──────────────────────────────────────────────────────┐
│  Auth │ User │ Chat │ Media │ Notification │ Worker  │
└──────────────────────────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        ▼                  ▼                  ▼
  ┌──────────┐      ┌──────────┐      ┌──────────┐
  │PostgreSQL│      │  Redis   │      │  Kafka   │
  └──────────┘      └──────────┘      └──────────┘
```

## 📦 Tech Stack

### Backend
- **Framework**: NestJS 10 + TypeScript 5
- **Database**: PostgreSQL 15 + Prisma ORM
- **Cache/Pub-Sub**: Redis 7 Cluster
- **Message Queue**: Kafka 3.x (primary) / RabbitMQ (alternative)
- **Search**: Elasticsearch 8.x
- **Real-time**: Socket.IO + Redis Adapter
- **Storage**: AWS S3 + CloudFront CDN

### Frontend
- **Mobile**: React Native + Expo SDK 48 + TypeScript
- **Web**: React 18 + Vite 5 + TypeScript
- **Offline DB**: WatermelonDB (mobile)
- **E2EE**: libsignal-protocol + libsodium

### Infrastructure
- **Containers**: Docker 24+
- **Orchestration**: Kubernetes + Helm
- **IaC**: Terraform 1.5+
- **CI/CD**: GitHub Actions
- **Monitoring**: Prometheus + Grafana + Loki

## 🚀 Quick Start

### Prerequisites
- Node.js 20.x
- pnpm 8.x
- Docker 24+
- PostgreSQL 15
- Redis 7

### Local Development

```bash
# Clone repository
git clone <repo-url>
cd GearLink

# Install dependencies
pnpm install

# Setup environment variables
cp .env.example .env
# Edit .env with your configuration

# Start infrastructure (PostgreSQL, Redis, Kafka)
docker-compose up -d

# Run database migrations
pnpm prisma:migrate

# Seed database
pnpm prisma:seed

# Start all services in development mode
pnpm dev:all

# Or start individual services
pnpm dev:api-gateway
pnpm dev:auth
pnpm dev:chat
pnpm dev:media
pnpm dev:notification
pnpm dev:worker

# Start mobile app
cd apps/mobile
pnpm start

# Start web app
cd apps/web
pnpm dev
```

## 🔐 Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/gearlink"

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Kafka
KAFKA_BROKERS=localhost:9092

# JWT
JWT_SECRET=your-secret-key-change-in-production
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# AWS
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
S3_BUCKET=gearlink-media
CLOUDFRONT_DOMAIN=cdn.example.com

# SMS (Twilio)
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+1234567890

# Push Notifications
FCM_SERVER_KEY=your-fcm-server-key
APNS_KEY_ID=your-apns-key-id
APNS_TEAM_ID=your-team-id
APNS_BUNDLE_ID=com.gearlink.app

# Elasticsearch
ELASTICSEARCH_NODE=http://localhost:9200

# Monitoring
PROMETHEUS_PORT=9090
GRAFANA_PORT=3000
```

## 📁 Project Structure

```
GearLink/
├── apps/
│   ├── api-gateway/          # API Gateway service
│   ├── auth-service/         # Authentication & authorization
│   ├── user-service/         # User management
│   ├── chat-service/         # Chat & messaging
│   ├── media-service/        # Media upload & management
│   ├── notification-service/ # Push notifications
│   ├── worker-media/         # Background media processing
│   ├── mobile/               # React Native mobile app
│   └── web/                  # React PWA web app
├── libs/
│   ├── prisma/               # Database schema & migrations
│   ├── common/               # Shared utilities & DTOs
│   └── crypto/               # E2EE helpers
├── infra/
│   ├── terraform/            # Infrastructure as Code
│   ├── k8s/                  # Kubernetes manifests
│   ├── docker/               # Dockerfiles
│   └── monitoring/           # Prometheus & Grafana configs
├── tests/
│   ├── unit/                 # Unit tests
│   ├── integration/          # Integration tests
│   ├── e2e/                  # End-to-end tests
│   └── load/                 # Load tests (k6)
├── docs/
│   ├── api/                  # OpenAPI specs
│   ├── architecture/         # Architecture diagrams
│   └── runbooks/             # Operational runbooks
├── .github/
│   └── workflows/            # CI/CD pipelines
├── docker-compose.yml        # Local development stack
├── package.json              # Monorepo root
├── pnpm-workspace.yaml       # pnpm workspace config
└── README.md                 # This file
```

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Unit tests
pnpm test:unit

# Integration tests (requires Docker)
pnpm test:integration

# E2E tests
pnpm test:e2e

# Load tests
pnpm test:load

# Test coverage
pnpm test:coverage
```

## 🏭 Production Deployment

### Using Kubernetes + Helm

```bash
# Build Docker images
pnpm docker:build

# Push to registry
pnpm docker:push

# Deploy with Helm
cd infra/k8s
helm install gearlink ./charts/gearlink -f values.production.yaml

# Or use kubectl
kubectl apply -f manifests/
```

### Using Terraform

```bash
# Provision infrastructure
cd infra/terraform
terraform init
terraform plan
terraform apply

# Get outputs
terraform output
```

## 📊 Monitoring

- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3000 (admin/admin)
- **Logs**: Loki + Grafana

### Key Metrics
- `message_send_latency_seconds` - Message delivery latency
- `websocket_connections_total` - Active WebSocket connections
- `messages_lost_total` - Lost messages counter
- `api_request_duration_seconds` - API response times

### SLOs
- Message delivery: 99.99% success within 5s (p95)
- API availability: 99.9%
- WebSocket uptime: 99.95%

## 🔒 Security

### End-to-End Encryption
- **Protocol**: Signal Protocol (X3DH + Double Ratchet)
- **Group Chats**: Sender Keys
- **Key Storage**: Secure enclave (mobile) / IndexedDB encrypted (web)

### Authentication
- Phone number verification (SMS)
- JWT access tokens (15min) + refresh tokens (7d)
- Refresh token rotation
- Device-based sessions

### Infrastructure Security
- TLS 1.3 everywhere
- CORS configured
- CSP headers
- Rate limiting (30 msg/sec per user)
- DDoS protection (Cloudflare)
- Secrets in KMS/Vault

## 📖 API Documentation

- **OpenAPI Spec**: [docs/api/openapi.yaml](docs/api/openapi.yaml)
- **WebSocket Events**: [docs/api/websocket-events.json](docs/api/websocket-events.json)
- **Swagger UI**: http://localhost:3000/api/docs (when running)

## 🔄 CI/CD Pipeline

GitHub Actions workflows:
- **PR Checks**: Lint, test, build
- **Security Scan**: Snyk + Trivy
- **Build Images**: Docker multi-stage builds
- **Deploy Staging**: Auto-deploy on merge to `develop`
- **Deploy Production**: Manual approval on merge to `main`

## 📚 Documentation

- [Architecture Overview](docs/architecture/README.md)
- [Data Models](docs/architecture/data-models.md)
- [API Reference](docs/api/README.md)
- [Deployment Guide](docs/deployment.md)
- [Runbooks](docs/runbooks/README.md)
- [Security Guide](docs/security.md)

## 🆘 Troubleshooting

### Database Connection Issues
```bash
# Check PostgreSQL is running
docker ps | grep postgres

# Check connection
psql $DATABASE_URL -c "SELECT 1"
```

### Redis Connection Issues
```bash
# Check Redis is running
docker ps | grep redis

# Test connection
redis-cli ping
```

### WebSocket Connection Issues
- Check CORS configuration
- Verify JWT token is valid
- Check Redis adapter is connected
- Review firewall/load balancer settings

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details

## 🙏 Acknowledgments

- Signal Protocol for E2EE implementation
- NestJS community
- React Native community
- All open-source contributors

---

**Note**: This is a production-ready application. Ensure you:
- Change all default secrets and keys
- Configure proper SSL certificates
- Set up monitoring and alerting
- Implement backup strategies
- Review security configurations
- Comply with GDPR and local regulations
