# 🛡️ SECOPS — Production Deployment Guide (Ubuntu Server)

## Prerequisites

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20 (LTS) via nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.0/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20
node -v  # Should show v20.x.x

# Install PM2 globally
npm install -g pm2

# Install Git
sudo apt install git -y
```

---

## 1. Clone the Repository

```bash
cd ~
git clone https://github.com/YOUR_USERNAME/antigravity-security-checklist.git
cd antigravity-security-checklist
```

---

## 2. Configure Environment Variables

```bash
cd server
cp .env.example .env
nano .env
```

Fill in the following values in `.env`:

| Variable | Description |
|---|---|
| `EMAIL_HOST` | SMTP host (e.g. `smtp.gmail.com`) |
| `EMAIL_PORT` | SMTP port (usually `587`) |
| `EMAIL_USER` | Your Gmail address |
| `EMAIL_PASS` | Your Gmail **App Password** (not your real password) |
| `CEO_EMAIL` | Recipient email for reports |
| `IT_HEAD_EMAIL` | Recipient email for reports |
| `PORT` | Backend port (default: `3001`) |
| `CORS_ORIGIN` | Leave empty for same-host access |

> **Gmail App Password**: Go to https://myaccount.google.com/apppasswords → generate a 16-char password for "Mail".

---

## 3. Install Dependencies

```bash
# Root dependencies (Vite + React)
cd ~/antigravity-security-checklist
npm install

# Server dependencies
cd server
npm install
cd ..
```

---

## 4. Build the Frontend

```bash
cd ~/antigravity-security-checklist
npm run build
```

This generates the `dist/` folder. The Express server will serve these static files automatically.

---

## 5. Create Logs Directory

```bash
mkdir -p ~/antigravity-security-checklist/logs
```

---

## 6. Start with PM2

```bash
cd ~/antigravity-security-checklist
pm2 start ecosystem.config.js

# Save PM2 process list (auto-start on reboot)
pm2 save

# Setup PM2 to run on system boot
pm2 startup
# → Copy and run the command it outputs
```

---

## 7. Verify It's Running

```bash
# Check PM2 status
pm2 status

# Check health endpoint
curl http://localhost:3001/api/health

# View live logs
pm2 logs secops-security-checklist
```

Open in browser: **`http://YOUR_SERVER_IP:3001`**

**Default login:** `admin@desicrew.in` / `Admin123!`

---

## 8. (Optional) Open Firewall Port

If using UFW:
```bash
sudo ufw allow 3001/tcp
sudo ufw reload
sudo ufw status
```

---

## Useful PM2 Commands

```bash
pm2 restart secops-security-checklist   # Restart app
pm2 stop secops-security-checklist      # Stop app
pm2 logs secops-security-checklist      # View logs (live)
pm2 monit                                # Live monitoring dashboard
```

## Updating the App

```bash
cd ~/antigravity-security-checklist
git pull
npm run build         # Rebuild frontend
pm2 restart secops-security-checklist
```
