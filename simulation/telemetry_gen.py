import os
import time
import numpy as np
import psycopg2
from datetime import datetime

# --- CONFIGURATION ---
DB_PARAMS = {
    "dbname": "mission_control",
    "user": "space_dev",
    "password": "secure_password_123",
    "host": os.environ.get('DB_HOST', 'localhost'), # Smart Switch for Docker
    "port": "5432"
}

# Mission Constants
MECO_TIME = 60  # Engine cuts off after 60 seconds
ORBIT_VELOCITY = 28000 # Target speed in km/h

def connect_db():
    """Attempts a single connection."""
    try:
        conn = psycopg2.connect(**DB_PARAMS)
        return conn
    except Exception:
        return None

def connect_db_with_retry(max_retries=15, delay=3):
    """Adds a robust retry loop for Docker startup."""
    print("🛰️ Attempting database connection...")
    for i in range(max_retries):
        conn = connect_db()
        if conn:
            print("✅ Database connection successful!")
            return conn
        print(f"❌ Waiting for database to wake up... Retrying ({i+1}/{max_retries}) in {delay}s...")
        time.sleep(delay)
    # If loop finishes, return None
    print("\n🛑 ERROR: Failed to connect to database after maximum retries. Exiting.")
    return None

def simulate_rocket_data(t):
    """
    Generates data based on Flight Phase (Ascent vs Orbit).
    """
    
    # --- PHASE 1: ASCENT (Booster Firing) ---
    if t < MECO_TIME:
        status_code = "ASCENT"
        base_temp = 1200 + (300 * (t / MECO_TIME))
        pressure_fuel = 300 - (200 * (t / MECO_TIME))
        velocity_kmh = (ORBIT_VELOCITY * (t / MECO_TIME)**2) 
        altitude_km = 10 + (400 * (t / MECO_TIME))
        attitude_roll = np.random.normal(0, 0.5)

    # --- PHASE 2: ORBIT (Coasting) ---
    else:
        status_code = "ORBIT"
        base_temp = 20 + (1000 * np.exp(-0.1 * (t - MECO_TIME))) 
        pressure_fuel = 100 
        velocity_kmh = ORBIT_VELOCITY + np.random.normal(0, 50)
        altitude_km = 410 + (5 * np.sin(t/10))
        attitude_roll = np.random.normal(0, 0.05)

    # Add realistic sensor noise
    engine_temp = base_temp + np.random.normal(0, 5)
    pressure_fuel = max(0, pressure_fuel + np.random.normal(0, 1))

    # Return as standard Python floats (fixes the NumPy error)
    return (
        float(engine_temp), 
        float(pressure_fuel), 
        float(altitude_km), 
        float(velocity_kmh), 
        float(attitude_roll), 
        status_code
    )

def main():
    print("🚀 Starting Mission Simulation (Robust Mode)...")
    
    # Use the retry logic to connect
    conn = connect_db_with_retry() 
    if not conn: return # Exit gracefully if connection failed

    cursor = conn.cursor()
    t = 0 # Mission Clock

    try:
        while True:
            # 1. Generate Data
            data = simulate_rocket_data(t)
            
            # 2. Get Current Timestamp (REQUIRED for Database)
            current_time = datetime.now()
            
            # 3. Insert Query with Timestamp
            insert_query = """
            INSERT INTO telemetry_data 
            (timestamp, engine_temp, pressure_fuel, altitude_km, velocity_kmh, attitude_roll, status_code)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            """
            
            # Combine Time + Data into one tuple
            # structure is: (time, temp, pressure, alt, vel, roll, status)
            record_to_insert = (current_time, data[0], data[1], data[2], data[3], data[4], data[5])
            
            cursor.execute(insert_query, record_to_insert)
            conn.commit()

            print(f"T+{t}s | Phase: {data[5]} | Speed: {data[3]:.0f} km/h | Temp: {data[0]:.0f} C")
            
            t += 1
            time.sleep(1) # 1 Hz

    except KeyboardInterrupt:
        print("\n🛑 Simulation Stopped.")
    except Exception as e:
        print(f"\n❌ CRITICAL SIMULATION ERROR: {e}")
    finally:
        if conn:
            cursor.close()
            conn.close()

if __name__ == "__main__":
    main()