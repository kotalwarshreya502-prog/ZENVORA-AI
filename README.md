# ZENVORA AI — Smarter Marketing. Sustainable Growth.

> **Production SaaS Platform**  
> A professional, commercial-quality, AI-powered digital marketing automation platform built on the modern MERN stack.

---

## 🚀 1. Introduction & Overview

**ZENVORA AI** is an end-to-end AI marketing automation and intelligence SaaS platform engineered to help modern businesses, marketing teams, and digital agencies scale their multi-channel digital footprint through data-driven automation, brand voice preservation, and sustainable organic growth.

### 🌟 Core Capabilities
- **AI Content Studio**: Powered by Google Gemini 1.5 with dynamic brand voice guardrails for social posts, blogs, captions, ad copy, and email sequences.
- **Multi-Angle Social Post Generator**: Real-time interactive feed mockup simulators for LinkedIn, X (Twitter), Instagram, and Facebook.
- **Automated Long-Form Blog Engine**: Programmatic outline generator, markdown previewer, SEO keyword scoring, and reading time estimation.
- **Tiered Hashtag Clustering**: Algorithmic tag extraction categorized by Broad Reach, Niche Authority, High-Intent Conversion, and Community.
- **Marketing Visual Studio**: Multi-aspect ratio graphic generator (1:1 feed, 16:9 hero, 4:5 portrait) with brand watermarking and prompt synthesis.
- **Multi-Channel Content Calendar**: Interactive monthly and weekly scheduling grid with channel filter pills and one-click rescheduling.
- **Technical SEO Website Auditor**: Real-time URL heuristic scanner checking meta snippets, H1/H2 heading hierarchy, image alt coverage, Open Graph, and keyword opportunities.
- **Unified Analytics & ROI Dashboard**: Responsive Recharts area and bar charts tracking audience reach, click velocity, platform share, and content attribution.
- **Brand Knowledge Base**: Centralized brand voice guidelines, positioning mission, color tokens, target audience ICP, and negative/restricted word filters.
- **Verified Channel Integrations**: OAuth registry for LinkedIn, X, Instagram, Facebook, Google Business, and WordPress CMS.
- **Multi-Tenant Team Management**: Granular role-based access control (Owner, Marketing Admin, Content Creator, SEO Strategist, Viewer).
- **Subscription & Usage Metering**: Automated word tracking, seat management, and plan upgrade workflows.

---

## 🎨 2. Brand Identity System

| Token | Name | Hex Code | Purpose / Usage |
| :--- | :--- | :--- | :--- |
| **Primary Color** | Midnight Navy | `#11152B` | Core background, primary text, high-contrast badges |
| **Brand Accent** | Electric Violet | `#7657F6` | Primary CTAs, active states, glowing focal elements |
| **Secondary Accent** | Growth Teal | `#20C9B0` | Growth metrics, status indicators, secondary badges |
| **Light Background** | Cloud White | `#F5F6FA` | Clean canvas background, card contrast surfaces |
| **Typography** | Inter | Google Fonts | Modern, neutral, highly legible sans-serif |
| **Brand Symbol** | Orbital Velocity | SVG Vector | Dynamic elliptical orbital ring with forward velocity chevron |

---

## 🛠️ 3. Technology Stack

### Frontend (`/frontend`)
- **Framework**: React 18 + Vite 6 (ESM, ultra-fast HMR)
- **Styling**: Tailwind CSS v3 with brand color tokens
- **Routing**: React Router DOM v6
- **Data Visualization**: Recharts
- **Icons**: Lucide React
- **HTTP Client**: Axios with Bearer token interceptor
- **State & Auth**: React Context (`AuthContext`, `AppContext`)

### Backend (`/backend`)
- **Runtime**: Node.js (v20+) with ES Modules (`"type": "module"`)
- **Framework**: Express.js
- **Database & ODM**: MongoDB Atlas + Mongoose with hybrid non-blocking fallback
- **Authentication**: JWT (`jsonwebtoken`) + `bcryptjs` password hashing
- **Security**: Helmet, CORS origin whitelisting, Rate limiting ready
- **Logging**: Morgan HTTP logger
- **AI Engine**: Google Gemini 1.5 integration with brand voice injection

---

## 📁 4. Project Structure

```
ZENVORA-AI/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB Atlas connector with non-blocking resilience
│   ├── controllers/              # REST controllers for all 14 platform domains
│   ├── middleware/
│   │   ├── authMiddleware.js     # JWT Bearer token verification
│   │   └── errorMiddleware.js    # Global error handlers
│   ├── models/                   # 12 Mongoose models (User, Campaign, Post, Blog, etc.)
│   ├── routes/                   # Express routers & sub-routes
│   ├── scripts/
│   │   ├── testDb.js             # Atlas connection diagnostic script
│   │   └── verifyBackend.mjs     # Automated 11-step backend test suite
│   ├── services/
│   │   ├── geminiService.js      # Gemini AI integration with brand voice injection
│   │   └── storageService.js     # Hybrid storage layer (Atlas + in-memory store)
│   ├── .env.example
│   ├── package.json
│   └── server.js                 # Express server entry point
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/           # BrandLogo, BrandSymbol
│   │   │   ├── layout/           # Navbar, Footer, MainLayout, DashboardLayout, DashboardSidebar
│   │   │   └── ui/               # Badge, Button, Card
│   │   ├── context/              # AuthContext, AppContext
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx   # High-converting public homepage
│   │   │   ├── FeaturesPage.jsx  # Feature breakdown
│   │   │   ├── PricingPage.jsx   # 3-tier pricing matrix
│   │   │   ├── AboutPage.jsx     # Mission & leadership
│   │   │   ├── ContactPage.jsx   # Contact & inquiry form
│   │   │   ├── LoginPage.jsx     # Sign-in with 1-click Demo login
│   │   │   ├── RegisterPage.jsx  # Registration
│   │   │   └── dashboard/        # All 15 SaaS dashboard modules
│   │   ├── routes/               # AppRoutes with nested protected routing
│   │   └── services/api.js       # Centralized Axios client
│   ├── .env.example
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
├── .gitignore                    # Robust security ignores (secrets never committed)
├── package.json                  # Root development scripts
├── render.yaml                   # Render Blueprint for automated cloud deployment
└── README.md
```

---

## 🚀 5. Quick Start (Local Development)

### Prerequisites
- Node.js v18+ installed
- Git installed

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/kotalwarshreya502-prog/ZENVORA-AI.git
cd ZENVORA-AI

# Install root dependencies
npm install

# Install backend & frontend dependencies
npm --prefix backend install
npm --prefix frontend install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` in both folders:

**`backend/.env`**:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.psewugl.mongodb.net/zenvora_ai?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_min_32_characters
CLIENT_URL=http://localhost:5173
GEMINI_API_KEY=your_optional_gemini_api_key
```

**`frontend/.env`**:
```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Run Development Servers
```bash
npm run dev
```
- Frontend starts at: `http://localhost:5173`
- Backend API starts at: `http://localhost:5000`
- Instant Demo Login: Click **"1-Click Demo Login"** on `/login` to access the full dashboard immediately!

---

## ☁️ 6. Render Cloud Deployment Guide

ZENVORA AI includes an automated `render.yaml` Blueprint specification for deploying both the backend web service and the frontend static site with zero manual wiring.

### Option A: Render Blueprint (Recommended)
1. Sign in to [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** > **Blueprint**.
3. Connect repository `kotalwarshreya502-prog/ZENVORA-AI`.
4. Render automatically parses `render.yaml` and provisions:
   - `zenvora-ai-backend` (Node Web Service)
   - `zenvora-ai-frontend` (Static Web Application)
5. Fill in `MONGO_URI` under environment variables.
6. Click **Apply** to deploy!

### Option B: Manual Service Creation

#### 1. Backend Web Service
- **Name**: `zenvora-ai-backend`
- **Root Directory**: `backend`
- **Runtime**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Health Check Path**: `/api/health`
- **Environment Variables**:
  - `NODE_ENV`: `production`
  - `MONGO_URI`: `mongodb+srv://<user>:<password>@cluster0.psewugl.mongodb.net/zenvora_ai?retryWrites=true&w=majority`
  - `JWT_SECRET`: (Generate random 32+ char string)
  - `CLIENT_URL`: `https://zenvora-ai-frontend.onrender.com`

#### 2. Frontend Static Site
- **Name**: `zenvora-ai-frontend`
- **Root Directory**: `frontend`
- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `dist`
- **Rewrite Rule**: `/*` -> `/index.html` (Status: 200)
- **Environment Variables**:
  - `VITE_API_URL`: `https://zenvora-ai-backend.onrender.com/api`

---

## 🔒 7. Security & Compliance
- **No Secrets Committed**: `.env` and sensitive files are strictly excluded via `.gitignore`.
- **Hybrid Storage Resilience**: If MongoDB Atlas undergoes maintenance or has local IP whitelisting constraints, the backend continues operating via its in-memory storage fallback without crashing.
- **Password Protection**: Passwords are salted and hashed with `bcryptjs` (salt rounds 12).
- **CORS Protection**: Origin validation allows only authorized client origins and secure preview URLs.

---

## 📄 License
MIT License. Built with precision for modern marketing scale.
