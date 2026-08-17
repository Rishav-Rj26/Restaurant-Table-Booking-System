# TableGuard — Restaurant Table Booking System

TableGuard is a modern, real-time restaurant table booking and management system. It provides a comprehensive solution for restaurants to manage their floor plans, handle reservations, and process payments, while offering customers an intuitive interface to book tables and manage their dining experience.

## Features

- **Real-time Table Management**: Live updates of table statuses using Socket.io.
- **Reservations & Booking**: Customers can easily browse and book available tables.
- **QR Code Integration**: Generate and scan QR codes for quick access to menus or table information.
- **Payment Processing**: Integrated with Stripe for secure and seamless payment handling.
- **Interactive Dashboards**: Analytics and reporting using Recharts.
- **Authentication**: Secure user authentication using JWT and bcrypt.
- **Email Notifications**: Automated email confirmations and updates via Nodemailer.

## Tech Stack

This project is structured as a monorepo with separate `frontend` and `backend` workspaces.

### Frontend
- **Framework**: React 19, Vite
- **Styling**: TailwindCSS 4
- **State Management**: Zustand, React Query
- **Routing**: React Router DOM
- **Real-time**: Socket.io Client
- **Other Tools**: Lucide React (Icons), Axios, HTML5-QRCode, Recharts, Stripe React

### Backend
- **Framework**: Node.js, Express 5
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose
- **Real-time**: Socket.io
- **Security**: Helmet, Express Rate Limit, CORS
- **Testing**: Vitest

## Getting Started

### Prerequisites
- Node.js (v22+ recommended)
- MongoDB
- Stripe Account (for payment features)

### Installation

1. Clone the repository and navigate to the project directory.
2. Install dependencies for all workspaces:
   ```bash
   npm install
   ```

### Environment Variables

You will need to set up environment variables for both the frontend and backend.

- **Backend (`backend/.env`)**: Define your `PORT`, `MONGODB_URI`, `JWT_SECRET`, Stripe API keys, and SMTP settings for Nodemailer.
- **Frontend (`frontend/.env`)**: Define your `VITE_API_URL` and Stripe publishable key.

### Running the Application

You can run both the frontend and backend concurrently from the root directory:

```bash
# Start both frontend and backend development servers
npm run dev
```

Alternatively, you can run them individually:
```bash
# Run backend only
npm run dev:api

# Run frontend only
npm run dev:web
```

### Additional Commands

- **Build**: `npm run build` (builds both workspaces)
- **Seed Database**: `npm run seed` (seeds the backend MongoDB)
- **Lint**: `npm run lint`
- **Test (Backend)**: `npm run test --workspace=backend`

## License
Private / Proprietary
