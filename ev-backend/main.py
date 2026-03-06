from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import joblib
import os

app = FastAPI(title="EV Range Predictor API")

# Allow React frontend to communicate with this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load the NEW Physics-Based Model Pipeline
MODEL_PATH = 'ev_model.joblib'

try:
    if os.path.exists(MODEL_PATH):
        # This loads the entire Pipeline (Scaler + XGBoost)
        model = joblib.load(MODEL_PATH)
        print(f"Realistic EV Model loaded from {MODEL_PATH}")
    else:
        print(f"Error: {MODEL_PATH} not found. Run your training script first!")
        model = None
except Exception as e:
    print(f"Error loading model: {e}")
    model = None

# Pydantic model for data validation
class EvRequest(BaseModel):
    battery_percentage: float
    temperature_celsius: float
    speed_kmh: float
    ac_on: bool
    driving_mode: int
    traffic_condition: int

@app.get("/")
def read_root():
    return {
        "status": "online",
        "model_loaded": model is not None,
        "message": "Send POST to /predict"
    }

@app.post("/predict")
def predict_range(request: EvRequest):
    if model is None:
        raise HTTPException(
            status_code=500, 
            detail="Machine Learning model is missing on the server."
        )
    
    try:
        # 1. Prepare data in the EXACT order/format as training
        # Note: We convert ac_on (bool) to int (0 or 1)
        input_dict = {
            'battery_percentage': request.battery_percentage,
            'temperature_celsius': request.temperature_celsius,
            'speed_kmh': request.speed_kmh,
            'ac_on': int(request.ac_on),
            'driving_mode': request.driving_mode,
            'traffic_condition': request.traffic_condition
        }
        
        input_df = pd.DataFrame([input_dict])
        
        # 2. Predict using the Pipeline 
        # (The scaler inside the joblib file handles the normalization)
        prediction = model.predict(input_df)[0]
        
        # 3. Safety Check: Range cannot be less than 0
        final_range = max(0.0, float(prediction))
        
        # 4. Log the prediction for debugging (visible in your terminal)
        print(f"Input: {input_dict} -> Prediction: {final_range:.2f} km")
        
        return {"predicted_range_km": round(final_range, 2)}
        
    except Exception as e:
        print(f"Prediction Error: {e}")
        raise HTTPException(status_code=400, detail="Error processing prediction.")

if __name__ == '__main__':
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)