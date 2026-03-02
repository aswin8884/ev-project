# ⚡ EV Simulator: Telemetry & Range Prediction AI

A full-stack web application that predicts the real-world driving range of an Electric Vehicle (EV). Instead of relying on static, optimistic factory estimates, this app uses a highly accurate, physics-aware Machine Learning model to calculate range drops based on freezing temperatures, highway speeds, climate control, and real-time traffic.

## ✨ Key Features
* **Physics-Based AI Model:** Powered by an XGBoost pipeline trained on realistic EV degradation curves (temperature penalties, aerodynamic drag, etc.).
* **Dynamic Telemetry Dashboard:** A premium, dark-mode React UI with interactive sliders for battery, speed, and temperature.
* **Smart Context Engine:** Automatically adjusts traffic severity based on the user's local system clock (Rush Hour vs. Clear Roads).
* **Lightning-Fast API:** Built with FastAPI for instant ML inference and response times.

## 🛠️ Tech Stack
**Frontend:**
* React (Vite)
* Tailwind CSS v4
* Axios
* React Icons & Leaflet (Map UI)

**Backend:**
* Python 3
* FastAPI & Uvicorn
* Scikit-Learn, Pandas, Numpy
* XGBoost (Machine Learning)

---

## 🚀 Step-by-Step Installation

This project is a Monorepo containing both the React frontend and the FastAPI backend. You will need **Node.js** and **Python 3.8+** installed on your computer.

### 1. Clone the Repository
```bash
git clone https://github.com/aswin8884/ev-project
cd ev-project

2. Set up the Machine Learning Backend
Open a terminal and navigate to the backend folder to build the AI and start the server.

# Navigate to the backend folder
cd backend

# Create a virtual environment
python -m venv venv

# Activate the virtual environment
# On Mac/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install the required Python libraries
pip install -r requirements.txt

# Generate the physics data and train the AI model
python train_model.py

# Start the FastAPI server
uvicorn main:app --reload

The backend is now running at http://127.0.0.1:8000

3. Set up the React Frontend
Open a new, separate terminal window, leave the backend running, and navigate to the frontend folder.

# Navigate to the frontend folder (from the project root)
cd frontend

# Install Node modules
npm install

# Start the React development server
npm run dev

The frontend is now running at http://localhost:5173

💻 Usage
Open your browser and go to http://localhost:5173.

Adjust the telemetry sliders (Battery %, Temperature, Speed).

Toggle the AC/Climate Control and Driving Mode.

Click "Calculate Range". The frontend will send the data to the FastAPI backend, which runs it through the XGBoost model and instantly returns the highly accurate predicted range.

🌍 Live Deployment
Frontend: Hosted on Vercel

Backend: Hosted on Render

(Note: The Render backend is on a free tier and may take 1-2 minutes to "wake up" upon the very first calculation request).
