# 🎟️ Event Management Platform – Backend

This is the **Node.js + Express** backend for the **Online Event Management Platform**, enabling users to book events, organizers to manage events, and admins to control the platform — all with full authentication, ticketing, and payment integration.

## 🚀 Live API Endpoint

🚀 Live API
Base URL: https://eventmanagement-backend-u4yf.onrender.com/api

---

## 🛠 Tech Stack

- **Node.js** with **Express**
- **MongoDB** with **Mongoose**
- **JWT** Authentication
- **Stripe** Checkout API (for ticket payments)
- **Nodemailer** (for email confirmations)
- RESTful API architecture

---
🛠 Tech Stack
Backend: Node.js, Express.js

Database: MongoDB + Mongoose

Auth: JWT (JSON Web Tokens)

Payments: Stripe API

Email: Nodemailer

Architecture: RESTful API

📦 Core Features
👤 Users
Register and login securely

View all approved events

Book tickets with Stripe payment

Cancel or transfer tickets

Download tickets (PDF/QR)

Receive email confirmations

🧑‍💼 Organizers
Create, edit, and delete events

Track bookings and attendees

Export attendee lists as CSV

View event analytics

🔐 Admins
Approve or reject events

View and manage all users and organizers

View platform-wide registrations

Analyze system stats via dashboard


📁 Project Structure
EventManagement_Backend/
│
├── Controllers/       # Business logic
├── Models/            # Mongoose schemas
├── Routes/            # Express routers
├── Middlewares/       # Auth & error handling
├── Utils/             # Email, Stripe utils
├── config/            # DB connection, constants
├── server.js          # App entry point
└── .env               # Environment variables

⚙️ Getting Started (Local Setup)
1. Clone the Repository
bash
git clone https://github.com/SwaminathanVK/EventManagement_Backend.git
cd EventManagement_Backend

2. Install Dependencies
bash
npm install

3. Create .env File in Root
env

PORT=3000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
STRIPE_SECRET_KEY=your_stripe_secret_key
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_password
BASE_URL=http://localhost:3000

4. Run the Server
bash

npm start
Server runs at: http://localhost:3000

📡 API Endpoints Overview
Module	Route Prefix
Auth	/api/auth/
Users	/api/users/
Events	/api/events/
Tickets	/api/tickets/
Payments	/api/payments/
Admin	/api/admin/

Full API documentation will be available in a future version or via Swagger/Postman.

💳 Stripe Integration
Stripe Checkout handles secure ticket payments.

After successful payment:

Ticket is generated

Confirmation email is sent

PDF/QR code is provided for download

📧 Email Notifications
Automated emails via Nodemailer:

Ticket Booking Confirmation

Ticket Cancellation

Ticket Transfer

🔐 Authentication
Uses JWT for secure login sessions

Role-based access for Users, Organizers, Admins

protect middleware guards all routes

🌍 Frontend Repository
To use the full platform, connect this backend with the frontend:

👉 Frontend GitHub Repo
https://github.com/SwaminathanVK/EventManagement-Frontend

🙌 Author
Developed by Swaminathan VK
B.E. ECE | Full-Stack MERN Developer
