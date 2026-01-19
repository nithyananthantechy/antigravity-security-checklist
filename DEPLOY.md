# Deployment Guide - Antigravity Security App

## 1. Prerequisites (Ubuntu Server)
Ensure you have Node.js and Git installed:
```bash
sudo apt update
sudo apt install nodejs npm git
```

## 2. Setup the Repository
Clone the code to your server:
```bash
# Example (Replace with your actual repo URL)
git clone https://github.com/YOUR_USERNAME/antigravity-security.git
cd antigravity-security
```

## 3. Start the Backend (API Server)
The backend handles the SSH connections.
```bash
cd server
npm install
# Start in background using PM2 (recommended) or node
npm install -g pm2
pm2 start index.js --name "antigravity-api"
```
*The backend will run on port **3001**.*

## 4. Build & Host the Frontend
```bash
cd ..
npm install
npm run build
```
You can serve the `dist/` folder using `serve` or Nginx.
```bash
npm install -g serve
serve -s dist -l 5173
```

## 5. Live Usage
1. Open `http://YOUR_SERVER_IP:5173` in your browser.
2. Go to **Firewall Dashboard**.
3. Select **Ubuntu Server**.
4. Enter the **IP**, **Username**, and **Password** of the target server you want to scan.
   * *Note: The backend must have network access to the target IP.*
