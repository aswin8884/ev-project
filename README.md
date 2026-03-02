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

```bash
# 1. Clone the repo
git clone https://github.com/aswin8884/ev-project
cd ev-project

# 2. Setup backend
cd backend
python -m venv venv
# Activate venv:
# Mac/Linux: source venv/bin/activate
# Windows: venv\Scripts\activate
pip install -r requirements.txt
python train_model.py
uvicorn main:app --reload

# 3. Setup frontend (in a new terminal)
cd frontend
npm install
npm run dev
