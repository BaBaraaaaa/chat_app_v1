#-----Chat App v1 ---------#

Chat App v1 is a sample real-time chat application consisting of a backend and frontend, supporting user authentication, friend management, one-to-one conversations, real-time messaging, and image uploads via Cloudinary.

🚀 Features
  🔐 User authentication (Email / Password, JWT)

  👥 Friend system (send, accept, reject friend requests)

  💬 One-to-one conversations with message history

  ⚡ Real-time messaging using Socket.IO

  🖼 User avatar & message image upload via Cloudinary

  🩺 API health check and environment configuration
🧱 Architecture & Tech Stack

Backend
  Node.js + TypeScript
  Express
  Socket.IO
  MongoDB + Mongoose
  Cloudinary
  JWT Authentication
Frontend
  React + TypeScript
  Vite
  Material UI (MUI)
  Socket.IO Client

📁 Project Structure (Summary)
  chat-app-v1/
  ├── backend/
  │   ├── src/
  │   ├── package.json
  │   ├── README_FRIEND_SYSTEM.md
  │   └── SOCKET_SERVER_README.md
  │
  ├── frontend/
  │   ├── src/
  │   └── package.json
  │
  ├── CLOUDINARY_SETUP.md
  ├── dbDiagram.txt
  └── README.md

✅ Prerequisites
  Node.js >= 18 (LTS)
  npm or yarn
  MongoDB (local or cloud)
  Cloudinary account (for image uploads)

▶️ Running the Project (Development)
  1️⃣ Backend
  cd backend
  npm install
  npm run dev
  2️⃣ Frontend
  cd frontend
  npm install
  npm run dev
