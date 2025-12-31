# 🏥 AI-Enhanced Medical Diagnosis & Patient Communication System

A full-stack medical application featuring patient registration, doctor browsing, appointment booking, AI triage, and real-time chat between doctors and patients.

## 📋 Table of Contents

- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Project Structure](#-project-structure)
- [Installation & Setup](#-installation--setup)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Running the Application](#-running-the-application)
- [API Documentation](#-api-documentation)

---

## 🛠 Tech Stack

### Backend
- **Python 3.x** - Programming language
- **Flask** - Web framework
- **MongoDB** - Database
- **Flask-JWT-Extended** - Authentication
- **Flask-CORS** - Cross-origin resource sharing

### Frontend
- **Next.js 16** - React framework
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS 4** - Styling
- **Lucide React** - Icons

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Python 3.8+** - [Download Python](https://www.python.org/downloads/)
- **Node.js 18+** - [Download Node.js](https://nodejs.org/)
- **MongoDB** - [Download MongoDB](https://www.mongodb.com/try/download/community) or use MongoDB Atlas
- **npm** or **yarn** - Package manager (comes with Node.js)

---

## 📁 Project Structure

```
Medical_project_v1/
├── backend/               # Flask API server
│   ├── app/              # Application source code
│   ├── requirements.txt  # Python dependencies
│   ├── run.py           # Entry point
│   └── seed_data.py     # Database seeding script
├── frontend/             # Next.js frontend
│   ├── src/             # Source files
│   ├── package.json     # Node dependencies
│   └── ...
└── README.md            # This file
```

---

## 🚀 Installation & Setup

### Backend Setup

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies with uv:**
   This project uses `uv` for fast package management.
   ```bash
   # Install dependencies and create virtual environment
   uv sync
   ```

3. **Activate the virtual environment:**
   ```bash
   source .venv/bin/activate
   ```

4. **Set up environment variables:**
   Create a `.env` file in the `backend/` directory:
   ```env
   MONGO_URI=mongodb://localhost:27017/medical_db
   GOOGLE_API_KEY=your_google_api_key_here
   ```
   **Note**: `GOOGLE_API_KEY` is required for AI features.

5. **Seed the database (Optional):**
   Populate the database with sample data.
   ```bash
   python seed_data.py
   ```

6. **Run the Backend Server:**
   ```bash
   python run.py
   ```
   The backend API will be running at **http://localhost:5000**.

---

### Frontend Setup

1. **Navigate to the frontend directory:**
   ```bash
   cd ../frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the Development Server:**
   ```bash
   npm run dev
   ```
   The frontend will be available at **http://localhost:3000**.

---

## ▶️ Running the Application

### Start MongoDB

Make sure MongoDB is running on your system:

```bash
# Linux (systemd)
sudo systemctl start mongod

# macOS (Homebrew)
brew services start mongodb-community

# Or run MongoDB directly
mongod --dbpath /path/to/data/directory
```

---

### Start the Backend Server

1. **Activate the virtual environment (if not already active):**
   ```bash
   source venv/bin/activate  # Linux/macOS
   # or
   venv\Scripts\activate     # Windows
   ```

2. **Run the Flask server:**
   ```bash
   cd backend
   python run.py
   ```

   The backend API will be available at: **http://localhost:5000**

---

### Start the Frontend Development Server

1. **Open a new terminal and navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Run the Next.js development server:**
   ```bash
   npm run dev
   ```
   
   Or if using yarn:
   ```bash
   yarn dev
   ```

   The frontend will be available at: **http://localhost:3000**

---

## 🔗 Quick Start (TL;DR)

**Terminal 1 - Backend:**
```bash
cd backend
uv sync
source .venv/bin/activate
python run.py
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm install
npm run dev
```

---

## 📚 API Documentation

The backend API runs on `http://localhost:5000`. Key endpoints include:

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | User login |
| GET | `/api/doctors` | Get list of doctors |
| POST | `/api/appointments` | Book an appointment |
| GET | `/api/patients/profile` | Get patient profile |
| GET | `/api/chat/messages` | Get chat messages |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

**Made with ❤️ for better healthcare**
