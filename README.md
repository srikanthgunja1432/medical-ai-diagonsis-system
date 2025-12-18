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
├── venv/                 # Python virtual environment
└── README.md            # This file
```

---

## 🚀 Installation & Setup

### Backend Setup

1. **Navigate to the project root directory:**
   ```bash
   cd Medical_project_v1
   ```

2. **Create a Python virtual environment:**
   ```bash
   python3 -m venv venv
   ```

3. **Activate the virtual environment:**
   
   - **Linux/macOS:**
     ```bash
     source venv/bin/activate
     ```
   
   - **Windows:**
     ```bash
     venv\Scripts\activate
     ```

4. **Install Python dependencies:**
   ```bash
   pip install -r backend/requirements.txt
   ```

5. **Set up environment variables (optional):**
   
   Create a `.env` file in the `backend/` directory:
   ```env
   FLASK_ENV=development
   SECRET_KEY=your_secret_key_here
   JWT_SECRET_KEY=your_jwt_secret_here
   MONGO_URI=mongodb://localhost:27017/medical_db
   ```

6. **Seed the database with sample data (optional):**
   ```bash
   cd backend
   python seed_data.py
   cd ..
   ```

---

### Frontend Setup

1. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install Node.js dependencies:**
   ```bash
   npm install
   ```
   
   Or if using yarn:
   ```bash
   yarn install
   ```

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

Run these commands in separate terminal windows:

**Terminal 1 - Backend:**
```bash
cd Medical_project_v1
source venv/bin/activate
cd backend
python run.py
```

**Terminal 2 - Frontend:**
```bash
cd Medical_project_v1/frontend
npm install
npm run dev
```

Then open **http://localhost:3000** in your browser! 🎉

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
