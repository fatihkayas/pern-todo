# 🚀 PERN Stack User Management System

A professional, full-stack user management application built with the **PERN** stack (PostgreSQL, Express, React, Node.js). This project demonstrates a secure, scalable architecture with a focus on RESTful API design and modern frontend practices.

## 🛠️ Tech Stack
- **Frontend:** React.js (Hooks, Functional Components)
- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL
- **Security:** Dotenv (Environment Variables)
- **Version Control:** Git & GitHub

---

## 📅 Progress Report (Feb 13, 2026)

### ✅ Completed Features
- **Project Infrastructure:** Organized the project into a clean `client` and `server` decoupled architecture.
- **RESTful API:** Developed endpoints for fetching (READ) and removing (DELETE) users from the database.
- **Dynamic Frontend:** Built a responsive React UI that consumes the backend API and manages state efficiently.
- **Security Protocols:** - Implemented `.env` for sensitive database credentials.
    - Configured `.gitignore` to prevent data leaks.
- **Version Control:** Successfully managed Git branches and resolved sub-module conflicts for a unified repository.

### 🏗️ In Progress
- [ ] **Create Operation:** Building a React form to add users directly from the UI.
- [ ] **Styling:** Migrating to Bootstrap for a professional look and feel.
- [ ] **Update Operation:** Implementing "Edit" functionality using modals.

---

## 🚀 Getting Started

### Prerequisites
- Node.js
- PostgreSQL
- GitHub CLI (optional)

### Installation
1. **Clone the repo:**
   ```bash
   git clone [https://github.com/fatihkayas/pern-todo.git](https://github.com/fatihkayas/pern-todo.git)

cd server
npm install
# Create a .env file and add your DB_PASSWORD=your_password
node index.js
Setup Client:

Bash

cd client
npm install
npm start
🛡️ Security Note
This project follows professional security standards. No database passwords or sensitive configuration files are stored in the public repository. All credentials are managed via environment variables.

Developed with ❤️ by Fatih Kayas