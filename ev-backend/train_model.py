import pandas as pd
import numpy as np
import joblib
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

from sklearn.metrics import r2_score, mean_absolute_error, mean_squared_error

from sklearn.linear_model import LinearRegression, Ridge, Lasso
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.svm import SVR
from sklearn.tree import DecisionTreeRegressor
from sklearn.neighbors import KNeighborsRegressor
from xgboost import XGBRegressor

def create_physics_based_data(num_samples=15000):
    print("Generating highly realistic physics-based EV data...")
    np.random.seed(42)
    
    # 1. Random Input Variables
    battery = np.random.uniform(5, 100, num_samples)
    temperature = np.random.uniform(-20, 40, num_samples)
    speed = np.random.uniform(30, 160, num_samples)
    ac_on = np.random.choice([0, 1], num_samples)
    driving_mode = np.random.choice([1, 2, 3], num_samples) # 1:Eco, 2:Normal, 3:Sport
    traffic = np.random.choice([1, 2, 3], num_samples) # 1:Light, 2:Mod, 3:Heavy

    # 2. Base Range (Assuming VW ID.4 gets ~420km at 100% in perfect 20°C weather)
    base_range = 420.0 * (battery / 100.0)
    
    # 3. Physics Penalties
    temp_multiplier = np.where(temperature < 20, 
                               1.0 - ((20 - temperature) * 0.015), 
                               1.0 - ((temperature - 20) * 0.005)) 
    
    speed_multiplier = np.where(speed > 80, 
                                1.0 - ((speed - 80) * 0.008), 
                                1.0 + ((80 - speed) * 0.002)) 
    
    climate_multiplier = np.where(ac_on == 1, 0.88, 1.0) 
    
    mode_multiplier = np.select([driving_mode == 1, driving_mode == 2, driving_mode == 3], [1.08, 1.0, 0.85])
    traffic_multiplier = np.select([traffic == 1, traffic == 2, traffic == 3], [1.0, 0.95, 0.88])

    # 4. Calculate Final Realistic Range
    real_range = base_range * temp_multiplier * speed_multiplier * climate_multiplier * mode_multiplier * traffic_multiplier
    
    # Add 2% random real-world noise
    noise = np.random.normal(1.0, 0.02, num_samples)
    final_range = np.clip(real_range * noise, 5, 500)

    return pd.DataFrame({
        'battery_percentage': battery,
        'temperature_celsius': temperature,
        'speed_kmh': speed,
        'ac_on': ac_on,
        'driving_mode': driving_mode,
        'traffic_condition': traffic,
        'range_km': final_range
    })

def main():
  
    df = create_physics_based_data()
    
    X = df.drop('range_km', axis=1)
    y = df['range_km']
    
 
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # 3. Define the models to test
    models = {
        "Linear Regression": LinearRegression(),
        "Ridge Regression": Ridge(),
        "Lasso Regression": Lasso(),
        "Decision Tree": DecisionTreeRegressor(random_state=42),
        "Random Forest": RandomForestRegressor(n_estimators=100, random_state=42),
        "Gradient Boosting": GradientBoostingRegressor(random_state=42),
        "XGBoost": XGBRegressor(n_estimators=300, learning_rate=0.05, max_depth=6, random_state=42),
        "SVR (Support Vector)": SVR(),
        "K-Neighbors": KNeighborsRegressor()
    }

    results = []
    best_model = None
    best_score = -float('inf')
    best_name = ""
    
    print("\nTraining and evaluating models...\n")
    print("-" * 65)
    print(f"{'Algorithm':<25} | {'R² Score':<10} | {'MAE (km)':<10} | {'RMSE (km)'}")
    print("-" * 65)

    # 4. Train and Test each model
    for name, model in models.items():
        # Create pipeline for current model
        pipeline = Pipeline([
            ('scaler', StandardScaler()),
            ('model', model)
        ])
        
        # Train
        pipeline.fit(X_train, y_train)
        
        # Predict
        y_pred = pipeline.predict(X_test)
        
        # Calculate Metrics
        r2 = r2_score(y_test, y_pred)
        mae = mean_absolute_error(y_test, y_pred)
        rmse = np.sqrt(mean_squared_error(y_test, y_pred))
        
        # Store results
        results.append({
            "Model": name,
            "R2": r2,
            "MAE": mae,
            "RMSE": rmse
        })
        
        # Print row
        print(f"{name:<25} | {r2:>.4f}     | {mae:>.4f}     | {rmse:>.4f}")
        
        # Track the best model based on R2 Score (closer to 1.0 is better)
        if r2 > best_score:
            best_score = r2
            best_model = pipeline
            best_name = name

    print("-" * 65)
    
    # 5. Save the BEST performing model
    print(f"\n🏆 Best Model: {best_name} with an R² of {best_score:.4f}")
    joblib.dump(best_model, 'ev_model.joblib')
    print(f"✅ The {best_name} model was successfully saved as 'ev_model.joblib'!")

if __name__ == "__main__":
    main()