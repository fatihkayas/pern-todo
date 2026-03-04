Harika bir fikir! Bu profesyonel içerik, projenin değerini herhangi bir iş görüşmesinde veya portfolyo incelemesinde 10 kat artıracaktır.

Dosyayı doğrudan kopyalayıp projenin kök dizinindeki README.md dosyasına yapıştırabilirsin.

⌚ Seiko Watch Store
AI-Native Cloud Commerce Platform — PERN Stack & Event-Driven Architecture
<div align="center">

A production-oriented, event-driven commerce platform built with the PERN stack,
featuring autonomous AI agents and professional background job processing.

Architecture · AI & Background Jobs · Security · Observability · Setup

</div>

🏗️ Architecture & System Design
Bu proje, tipik bir CRUD uygulamasının ötesinde, asenkron süreçleri ve hata toleransını (fault-tolerance) temel alan modern bir mikro hizmet yaklaşımıyla tasarlanmıştır.

Plaintext

┌─────────────────────────────────────────────────────────────────┐
│                          CLIENT LAYER                           │
│      React SPA  ·  Trigger.dev Polling  ·  HttpOnly Cookies      │
└──────────────────────────┬──────────────────────────────────────┘
                           │ HTTPS (Proxy Port 3000 -> 5000)
┌──────────────────────────▼──────────────────────────────────────┐
│                    BACKEND — Express API                        │
│   Rate Limiting  ·  RBAC  ·  Zod  ·  Trust Proxy Config         │
└──────────┬───────────────┬───────────────────┬──────────────────┘
           │               │                   │
┌──────────▼─────┐  ┌──────▼──────────┐  ┌─────▼──────────────────┐
│  PostgreSQL 15 │  │ Trigger.dev     │  │  Observability Stack   │
│  (Port 5433)   │  │ Async Worker    │  │  Prometheus · Grafana  │
└────────────────┘  └──────┬──────────┘  └────────────────────────┘
                           │
                    ┌──────▼──────────┐
                    │ Ollama AI Engine│
                    │ (Async Tasks)   │
                    └─────────────────┘
🤖 AI Agent & Background Jobs (Trigger.dev)
Projenin kalbi, uzun süren ve kaynak tüketen işlemleri ana API hattından ayıran Event-Driven (Olay Güdümlü) mimaridir.

1. Async AI Chat (Ollama Entegrasyonu)
Problem: Yapay zekanın yanıt üretmesi 30 saniyeden uzun sürdüğünde HTTP bağlantıları kopar (timeout).

Solution: Chat istekleri Trigger.dev'e paslanır. Kullanıcıya anında bir jobId döner. Arka planda Ollama yanıtı hazırlar ve frontend "polling" ile sonucu güvenli bir şekilde çeker.

Fault Tolerance: Ollama geçici olarak meşgulse, Trigger.dev işlemi otomatik olarak yeniden dener (Exponential Backoff).

2. Autonomous Operations
Order Confirmation: Satın alma sonrası kişiselleştirilmiş AI teşekkür e-postaları (Resend API).

Low Stock Alerts: Ürün stoğu 5'in altına düştüğünde yöneticiye otomatik AI raporu.

Daily AI Report: Her gece yarısı satış verilerini analiz eden otomatik cron-job raporları.

🔐 Security Hardening
OWASP Compliance: XSS, SQL Injection ve CSRF korumaları.

Rate Limiting: IP başına ve kullanıcı başına istek sınırlaması (Express-rate-limit).

Secure Cookies: JWT token'lar HttpOnly ve SameSite=Strict bayraklarıyla korunur.

Proxy Security: app.set('trust proxy', 1) yapılandırması ile güvenli IP takibi.

📊 Observability & Monitoring
Sistem "Ölçülebilirlik" ilkesiyle donatılmıştır:

Metrics: Prometheus ile API gecikme süreleri ve hata oranları takibi.

Dashboards: Grafana üzerinden gerçek zamanlı stok ve AI performans izleme.

Logging: Pino-http ile yapılandırılmış, her isteğe özel correlation-id içeren JSON loglar.

🚀 Getting Started
Prerequisites
Node.js 20+

Podman (or Docker)

Ollama (Local AI Engine)

1. Setup Database & AI
Bash

# PostgreSQL ve Ollama konteynerlarını başlat
podman-compose up -d db ollama
2. Configure Environment
server/.env dosyanıza şu kritik anahtarları ekleyin:

Code-Snippet

TRIGGER_SECRET_KEY=your_trigger_key
RESEND_API_KEY=your_resend_key
ADMIN_EMAIL=your@email.com
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5433
3. Run the Platform
Üç terminalde şu komutları çalıştırın:

Bash

# Terminal 1: Background Worker
cd server && npx trigger.dev@latest dev

# Terminal 2: Express Backend
cd server && npm run dev

# Terminal 3: React Frontend
cd client && npm start
👤 For Engineering Teams
Bu proje şunları kanıtlamaktadır:

System Design: Asenkron iş yüklerini ve uzun süreli görevleri yönetme yeteneği.

AI Engineering: Yerel LLM'leri (Ollama) üretim seviyesinde bir pipeline'a entegre etme.

Cloud Readiness: Terraform ve AWS mimarisine (ECS/RDS) tam uyumluluk.

<div align="center">
Built with ❤️ by Fatih Kayas & AI Collaborators
</div>

ash Commit chat fixes and port change 
IN
cd /c/Users/seavs/OneDrive/Masaüstü/pern-todo && git add client/src/components/ChatWidget.tsx server/trigger/chat-async.ts podman-compose.yml && git commit -m "$(cat <<'EOF'
fix(chat): correct API path and increase maxDuration for chat-async

- Fix ChatWidget polling URL: /api/chat → /api/v1/chat
- Increase chat-async maxDuration from 120s to 300s for Ollama response time
- Add AbortSignal.timeout(240s) on Ollama fetch call
- Change Podman DB host port from 5432 to 5433 (avoid conflict with local Windows PostgreSQL)

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"

OUT
warning: in the working copy of 'server/trigger/chat-async.ts', LF will be replaced by CRLF the next time Git touches it

> server@1.0.0 type-check
> tsc --noEmit

[33m[STARTED][39m Backing up original state...
[32m[COMPLETED][39m Backed up original state in git stash (2154dd2)
[33m[STARTED][39m Running tasks for staged files...
[33m[STARTED][39m package.json[0;90m — 3 files[0m
[33m[STARTED][39m server/**/*.ts[0;90m — 1 file[0m
[33m[STARTED][39m bash -c 'cd server && npx eslint --fix "$@"' --
[32m[COMPLETED][39m bash -c 'cd server && npx eslint --fix "$@"' --
[33m[STARTED][39m bash -c 'cd server && npx prettier --write "$@"' --
[32m[COMPLETED][39m bash -c 'cd server && npx prettier --write "$@"' --
[32m[COMPLETED][39m server/**/*.ts[0;90m — 1 file[0m
[32m[COMPLETED][39m package.json[0;90m — 3 files[0m
[32m[COMPLETED][39m Running tasks for staged files...
[33m[STARTED][39m Applying modifications from tasks...
[32m[COMPLETED][39m Applying modifications from tasks...
[33m[STARTED][39m Cleaning up temporary files...
[32m[COMPLETED][39m Cleaning up temporary files...
[main 14585cd] fix(chat): correct API path and increase maxDuration for chat-async
 3 files changed, 5 insertions(+), 4 deletions(-)
what we have done
Memory'i güncelleyeyim:

Read C:\Users\seavs\.claude\projects\c--Users-seavs-OneDrive-Masa-st--pern-todo\memory\MEMORY.md
Edit C:\Users\seavs\.claude\projects\c--Users-seavs-OneDrive-Masa-st--pern-todo\memory\MEMORY.md
Added 5 lines
Edit C:\Users\seavs\.claude\projects\c--Users-seavs-OneDrive-Masa-st--pern-todo\memory\MEMORY.md
Added 16 lines
Bu Session'da Ne Yaptık
KAN-56: Trigger.dev + Ollama Entegrasyonu — TAMAMLANDI
#	Ne Yaptık	Durum
1	4 Trigger.dev task oluşturuldu	✅
2	Chat SSE → async polling'e geçildi	✅
3	Sipariş sonrası email job tetikleme	✅
4	Stok < 5 alert job tetikleme	✅
5	DB port çakışması çözüldü (5432→5433)	✅
6	Chat widget URL düzeltildi (/api/v1/chat)	✅
7	Chat COMPLETED — Ollama yanıt veriyor	✅
Çözülen Sorunlar
Windows PostgreSQL vs Podman: Port 5432 çakışması — podman-compose.yml'de 5433:5432 yaptık
MAX_DURATION_EXCEEDED: maxDuration 120→300s artırıldı
Eski container image: seiko_frontend eski JS dosyalarıyla çalışıyordu — rebuild edildi
Yanlış API path: ChatWidget /api/chat yerine /api/v1/chat olacaktı
Mevcut Local Dev Durumu
Terminal 1: cd server && npm run dev (port 5000)
Terminal 2: cd server && npx trigger.dev@latest dev
Terminal 3: cd client && npm start (port 3001)