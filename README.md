# AIESEC Finance Hub — Event Financial Management System

A full-stack **MERN (MongoDB, Express.js, React.js, Node.js)** web application built for **AIESEC** event managers and finance teams to track revenues, manage expenses, allocate event budgets, and monitor organizational financial health in real time.

---

## 📌 Project Overview

AIESEC organizes numerous events throughout the year, including **Global Villages, Career Fairs, Leadership Development Conferences, and Recruitment Campaigns**. 

Each event generates income (sponsorships, ticket sales, booth fees, delegate registration) and expenditures (venue rental, catering, transportation, decoration, marketing). **AIESEC Finance Hub** centralizes financial operations into a single, intuitive, responsive platform with live MongoDB calculations.

---

## 🚀 Key Features

### 1. 🔐 Secure Authentication & Authorization
- **Account Registration & Login** with validated email, name, and hashed passwords.
- **bcryptjs** for irreversible password encryption.
- **JWT (JSON Web Tokens)** stateless session management.
- **Protected Middleware (`protect`)** enforcing route guards on the Express backend.
- **Axios Request Interceptor** automatically injecting `Authorization: Bearer <token>` from `localStorage`.
- **Protected Route Guards** on the React client preventing unauthorized access.

### 2. 📅 Event Management
- Create events with **Name, Location, Start Date, End Date, Budget (TND), and Description**.
- **Real-time Event Cards** displaying Budget, Total Revenue, Total Expenses, and Net Balance.
- **Event Financial Details Page** with dedicated event breakdown and transaction history.
- **Safe Cascading Deletion**: deleting an event automatically removes its associated transactions to prevent orphan records.

### 3. 💰 Financial Transaction Management
- Single unified **Transaction Model** handling both **Revenues** and **Expenses** via an explicit `type` field.
- **Dynamic Categorization** linked via Mongoose `ObjectId` references to Revenue categories (*Sponsorship, Ticket Sales, Booth Fees, Donations, Registration*) and Expense categories (*Venue Rental, Marketing, Transportation, Catering, Decoration, Equipment*).
- **Transaction Filters**: Filter records by specific event and transaction type (`revenue` / `expense`).
- **Live Net Calculation**: Displays dynamic balance and colored financial indicators (+Green for revenue, -Red for expense).

### 4. 📊 Live Financial Dashboard
- **4 Real-time KPI Cards**:
  1. **Total Revenue**: Sum of all revenues across all events.
  2. **Total Expenses**: Sum of all expenses across all events.
  3. **Net Balance**: Total Revenue minus Total Expenses (Surplus / Deficit).
  4. **Total Events**: Count of registered events.
- **Interactive Recharts Comparison**: Bar chart comparing revenues vs. expenses across all events.
- **Events Overview Table**: List of events with live balances and financial status badges (*Positive surplus, Budget deficit, No transactions*).
- **Recent Transactions Stream**: The latest financial activities with category badges and dates.

### 5. 🏷️ Category Management
- View pre-seeded and custom categories.
- Add custom revenue or expense categories.
- **Referential Integrity Protection**: Prevents deletion of any category currently used by active transactions with clear validation warnings.

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Database** | MongoDB Atlas (Cloud M0) | Cloud document database |
| **ODM** | Mongoose | Data models, schema validation & relationships (`.populate()`) |
| **Backend API** | Express.js / Node.js | RESTful API architecture |
| **Frontend UI** | React 18 / Vite | Component-based interactive interface |
| **Navigation** | React Router v6 | Single Page Application (SPA) routing |
| **State & Auth** | Redux Toolkit (`@reduxjs/toolkit`, `react-redux`) | Centralized state management & persistent session |
| **HTTP Client** | Axios | REST communication with JWT interceptor |
| **Visualizations** | Recharts | Revenue vs Expenses bar charts |
| **Icons** | Lucide React | Clean modern SVG icons |
| **Styling** | Custom CSS3 | Modern AIESEC-inspired SaaS palette |

---

## 🎨 Visual Identity & Color Palette

Designed according to AIESEC's official minimalist and modern SaaS guidelines:

- **Primary Blue:** `#0077FF`
- **Dark Blue:** `#003B70`
- **Background:** `#FFFFFF`
- **Light Surface:** `#F5F7FA`
- **Main Text:** `#111111`
- **Secondary Text:** `#64748B`
- **Revenue (Green):** `#16A879`
- **Expense (Red):** `#E45B65`
- **Borders:** `#E5E7EB`

---

## 📂 Project Architecture

```
aiesec-finance-events-hub/
│
├── server/                        # Express Backend
│   ├── config/
│   │   └── db.js                  # MongoDB Atlas connection logic
│   ├── models/
│   │   ├── User.js                # User model with bcrypt pre-save hook
│   │   ├── Event.js               # Event model with creator reference
│   │   ├── Category.js            # Category model (revenue / expense)
│   │   └── Transaction.js         # Transaction model (event & category refs)
│   ├── controllers/
│   │   ├── authController.js      # Register, login, getMe
│   │   ├── eventController.js     # Event CRUD & dashboard aggregations
│   │   ├── categoryController.js  # Category CRUD & integrity validation
│   │   └── transactionController.js # Transaction CRUD & filtering
│   ├── routes/
│   │   ├── authRoutes.js          # /api/auth routes
│   │   ├── eventRoutes.js         # /api/events routes
│   │   ├── categoryRoutes.js      # /api/categories routes
│   │   └── transactionRoutes.js   # /api/transactions routes
│   ├── middleware/
│   │   └── authMiddleware.js      # JWT protect middleware
│   ├── seed_demo.js               # Seed script with realistic AIESEC events
│   ├── server.js                  # Main server entry point
│   ├── .env                       # Environment variables (excluded from git)
│   └── package.json
│
├── client/                        # React / Vite Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx         # Header with branding & search
│   │   │   ├── Sidebar.jsx        # Authenticated sidebar navigation
│   │   │   ├── FinancialCard.jsx  # Reusable KPI card
│   │   │   ├── EventCard.jsx      # Reusable Event card
│   │   │   ├── TransactionTable.jsx # Reusable transaction data table
│   │   │   └── ProtectedRoute.jsx # Route authentication guard
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx    # Public homepage with floating cards
│   │   │   ├── Login.jsx          # Login page
│   │   │   ├── Register.jsx       # Registration page
│   │   │   ├── Dashboard.jsx      # Live financial KPIs & Recharts
│   │   │   ├── Events.jsx         # Event cards & Add Event modal
│   │   │   ├── EventDetails.jsx   # Event summary & Add Revenue/Expense
│   │   │   ├── Transactions.jsx   # All transactions with filters
│   │   │   └── Categories.jsx     # Category management
│   │   ├── redux/
│   │   │   ├── authSlice.js       # Redux Toolkit slice with async thunks
│   │   │   └── store.js           # Centralized Redux store configuration
│   │   ├── services/
│   │   │   └── api.js             # Axios instance & JWT interceptor
│   │   ├── App.jsx                # Router configuration
│   │   ├── main.jsx               # React DOM entry point
│   │   └── index.css              # AIESEC design system styles
│   ├── vercel.json                # Vercel SPA routing rewrite rules
│   ├── vite.config.js             # Vite configuration
│   ├── .env                       # Frontend environment variables
│   └── package.json
│
├── render.yaml                    # Render cloud deployment blueprint
├── .gitignore                     # Excludes node_modules and .env files
└── README.md
```

---

## ⚡ Quick Start Guide (Local Development)

### Prerequisites
- **Node.js** (v18.x or v20.x)
- **npm** (v9+ or v10+)
- **MongoDB Atlas account** (or local MongoDB)

### 1. Backend Setup
```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Configure environment variables
# Verify or edit server/.env with your values:
# PORT=5000
# MONGO_URI=your_mongodb_atlas_connection_string
# JWT_SECRET=your_jwt_secret_key
# CLIENT_URL=http://localhost:5173

# Seed sample demonstration data
npm run seed

# Start backend server
npm run dev
# The API will run on http://localhost:5000
```

### 2. Frontend Setup
Open a new terminal window:
```bash
# Navigate to client directory
cd client

# Install dependencies
npm install

# Start Vite development server
npm run dev
# The frontend will open on http://localhost:5173
```

### 3. Demo Credentials
If you ran `npm run seed`, you can immediately sign in using:
- **Email:** `demo@aiesec.net`
- **Password:** `password123`

---

## 🧪 Demonstration Data (As Specified in Cahier des Charges)

The seed script creates the exact test scenario from **Section 11**:

- **Event:** `Global Village 2026`
- **Budget:** `5,000 TND`
- **Revenues (6,000 TND):**
  - Sponsorship: `3,000 TND`
  - Ticket Sales: `2,000 TND`
  - Booth Fees: `1,000 TND`
- **Expenses (2,000 TND):**
  - Venue Rental: `1,200 TND`
  - Decoration: `500 TND`
  - Marketing: `300 TND`
- **Calculated Net Balance:** `+4,000 TND (Surplus)`

Additional events (`Career Fair 2026` and `Leadership Conference 2026`) are also seeded to demonstrate multi-event comparison on the Recharts chart and deficit indicator handling.

---

## 🌐 Cloud Deployment Guide

### Deploy Backend to Render
1. Push your repository to **GitHub**.
2. On [Render](https://render.com), click **New + > Web Service**.
3. Select your GitHub repository.
4. Set:
   - **Root Directory:** `server`
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
5. Under **Environment Variables**, add:
   - `MONGO_URI`: Your MongoDB Atlas URI
   - `JWT_SECRET`: A secure secret string
   - `CLIENT_URL`: Your Vercel frontend URL (e.g. `https://aiesec-finance.vercel.app`)
   - `NODE_ENV`: `production`

### Deploy Frontend to Vercel
1. On [Vercel](https://vercel.com), click **Add New > Project**.
2. Select your repository.
3. Set:
   - **Root Directory:** `client`
   - **Framework Preset:** `Vite`
4. Under **Environment Variables**, add:
   - `VITE_API_URL`: Your Render backend URL (e.g. `https://aiesec-finance-api.onrender.com`)
5. Click **Deploy**. The included `client/vercel.json` ensures all SPA routes (`/dashboard`, `/events`, etc.) resolve properly on refresh.

---

## 🎓 Academic Defense & Oral Exam Guide

During the oral presentation, be ready to explain:

1. **Why MERN Stack?**
   - JavaScript end-to-end simplifies data transfer (JSON across MongoDB, Express, and React).
   - MongoDB documents match JSON objects naturally without complex ORM translation.
   - React's virtual DOM and component architecture allow modular UI reusability.

2. **Why Single Transaction Model?**
   - Instead of duplicating collections into separate "Revenues" and "Expenses", a single `Transaction` model with a `type: 'revenue' | 'expense'` field simplifies queries, sorting by date, and dynamic aggregation.

3. **How does Authentication work?**
   - Client sends credentials -> Server finds user -> `bcrypt.compare` verifies password hash -> Server generates JWT signed with `JWT_SECRET` -> Client stores token in `localStorage` -> Client sends token in `Authorization: Bearer <token>` via Axios interceptor -> Server `protect` middleware verifies JWT before allowing access.

4. **How are Financial Figures Calculated?**
   - Figures are **never hardcoded**. MongoDB dynamically queries all transactions belonging to the user/event, sums revenues, sums expenses, and calculates `Net Balance = Revenue - Expenses`.

---

## 📄 License
Academic Project developed for **Polytechnique Sousse (MERN Stack Module)**.
