# ⚡ FitTrack — Daily Fitness Tracker

A responsive, mobile-first fitness tracking web app built with **pure HTML, CSS, and vanilla JavaScript**. No frameworks. No backend. Deploys directly to GitHub Pages.

## 🚀 Live Demo

Deploy to GitHub Pages — just push and enable Pages on the `main` branch.

## ✨ Features

### Daily Tracking
- 🍽️ **Food Intake** — Log meals with protein, calories, carbs, fat + quick-add presets
- 💧 **Water Intake** — Visual bottle tracker (1.8L per bottle) with hydration tips
- 💪 **Protein Goal** — Ring chart + per-source breakdown + custom goal setting
- 🥊 **Training Log** — Boxing, Kickboxing, Grappling, S&C + intensity + duration + notes
- ✅ **Daily Tasks** — Categorized habit tracker with completion progress

### Dashboard
- 🎯 **Discipline Score** — Algorithm-computed daily score (0–100) with animated gauge
- 📈 **Weekly Chart** — Pure canvas chart showing protein, water, and score over 7 days
- 📋 **Quick Overview** — All today's stats at a glance

### Smart Features
- 🤖 **AI Coach** — GPT-powered daily summary and improvement suggestions (requires your API key)
- ⌨️ **Keyboard Shortcuts** — Press 1-8 to navigate, ← → for date navigation
- 📅 **Date Navigation** — Browse and edit historical logs
- 📤 **Export/Import** — JSON backup and cross-device sync
- 🌙 **Dark/Light Mode** — Persistent theme toggle

### PWA
- Installable on mobile and desktop
- Offline support via Service Worker cache

## 🛠️ Tech Stack

| Technology | Usage |
|------------|-------|
| HTML5 | Semantic structure |
| Vanilla CSS | Dark/light theme, responsive grid, animations |
| ES Modules (JS) | Modular architecture |
| LocalStorage | Persistent data storage |
| Canvas API | Weekly overview chart |
| OpenAI API | AI coaching (optional) |
| Service Worker | PWA/offline support |

## 📁 Project Structure

```
fitness-tracker/
├── index.html          # Main HTML (all pages)
├── manifest.json       # PWA manifest
├── sw.js               # Service Worker
├── .nojekyll           # GitHub Pages config
├── css/
│   └── style.css       # Full design system
├── js/
│   ├── app.js          # Main application logic
│   ├── storage.js      # LocalStorage data layer
│   ├── charts.js       # Canvas chart rendering
│   └── openai.js       # OpenAI API integration
└── icons/
    ├── icon-192.png
    └── icon-512.png
```

## 🚀 Deploy to GitHub Pages

1. Push this folder to a GitHub repository
2. Go to **Settings → Pages**
3. Set source to **main branch / root**
4. Your app is live!

## ⌨️ Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `1` | Dashboard |
| `2` | Food Log |
| `3` | Water |
| `4` | Protein |
| `5` | Training |
| `6` | Tasks |
| `7` | AI Coach |
| `8` | Settings |
| `←` | Previous day |
| `→` | Next day |

## 🤖 OpenAI Setup

1. Get API key at [platform.openai.com](https://platform.openai.com/api-keys)
2. Open the app → Settings → Enter your key
3. Navigate to AI Coach → Generate Summary

Your key is stored **only in your browser's localStorage** and never sent to any server other than OpenAI.

## 📊 Discipline Score Algorithm

| Category | Max Points |
|----------|-----------|
| Protein goal | 30 pts |
| Water goal | 20 pts |
| Training quality | 30 pts |
| Task completion | 20 pts |
| **Total** | **100 pts** |
