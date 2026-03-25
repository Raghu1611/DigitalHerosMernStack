# Golf Charity Subscription Platform - MERN Stack

An emotional, UI/UX-led web application combining golf performance tracking, charity fundraising, and a monthly draw-based reward engine.

## 🚀 Features

- **Modern Glassmorphic UI:** A responsive, emotion-driven design built manually with CSS (no Tailwind/Bootstrap clones) ensuring an outstanding dark-mode aesthetic.
- **Robust Role Authorization:** Secure JWT implementation locking `Visitor`, `Subscriber`, and `Admin` permissions.
- **Automated Score Rolling Engine:** A customized MongoDB algorithm that automatically replaces the oldest golf score upon the 6th entry, ensuring users are always evaluated on their latest 5 rounds natively.
- **Integrated Stripe Billing:** Complete mock end-to-end integration handling Monthly/Yearly subscriptions, generating webhooks, and securely listening to successful payments to instantly upgrade users.
- **Custom Algorithmic Draw System:** Admin dashboard to execute test simulations, evaluate pool sizes (calculated uniquely off active subscriber counts), and algorithmically match arrays to distribute the 40% / 35% / 25% prize splitting schema.
- **Winner Verification Pipeline:** Admins can oversee users with "Pending" winnings and manually toggle their records to "Paid".

## 🛠️ Technology Stack

- **Frontend:** React, Vite, Lucide Icons
- **Backend:** Node.js, Express, Stripe API
- **Database:** MongoDB Atlas, Mongoose
- **Authentication:** JWT (JSON Web Tokens), bcrypt hashing

## 💻 Running Locally

### 1. Database & Secrets
You will need a `.env` in both the `frontend` and `backend` folders.
- Start your **Stripe CLI** listener: `stripe listen --forward-to localhost:5000/api/stripe/webhook`

### 2. Backend Server
```bash
cd backend
npm install
npm run dev
```

### 3. Frontend Portal
```bash
cd frontend
npm install
npm run dev
```

## 🔒 Test Admin Credentials
To access the Draw Engine and Charity control rooms:
- **Email:** admin@digitalheroes.com
- **Password:** admin1234
*(Note: Ensure this user exists in your MongoDB cluster and its role is artificially upgraded to "Admin")*
