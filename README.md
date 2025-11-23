# 🚀 Space Mission Control Interface

![Docker](https://img.shields.io/badge/Docker-Enabled-blue?logo=docker)
![React](https://img.shields.io/badge/Frontend-React-61DAFB?logo=react)
![Django](https://img.shields.io/badge/Backend-Django-092E20?logo=django)
![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-336791?logo=postgresql)
![Python](https://img.shields.io/badge/Simulation-Python-3776AB?logo=python)

A robust, full-stack **Ground Control Dashboard** designed to visualize real-time telemetry from orbital launch vehicles. This project simulates a complete data pipeline—from physics-based data generation to high-frequency ingestion and a reactive Human-Machine Interface (HMI).

---

## 📖 Overview

This application mimics the architecture of a real-world Flight Dynamics and Mission Control center. It is designed to handle high-frequency sensor data streams, visualize critical flight parameters (Velocity, Altitude, Engine Temp, Fuel Pressure), and provide interactive command capabilities for mission operators.

The entire stack is **containerized**, allowing for a "single-click" deployment on any environment.

### 🎯 Key Capabilities
* **Real-Time Visualization:** Dual-axis live charting of Engine Temperature vs. Fuel Pressure.
* **Physics Simulation:** Generates realistic flight phases (**Ascent** vs. **Orbit**) with calculated metrics like **Mach Number**, **Max-Q**, and **G-Force**.
* **Interactive HMI:** Operator controls for Power Switching (GSE/Internal), Oxidizer Venting, and Emergency Abort.
* **Observability:** Scrolling system event logs and dynamic status monitoring (Nominal/Warning/Critical).
* **Resilience:** Implements database connection retry logic and fault-tolerant container orchestration.

---

## 🏗️ Architecture

The system follows a **Microservices Architecture** composed of 4 Docker containers:

1.  **📡 Simulation Service (Python):** * Acts as the "Launch Vehicle."
    * Generates physics-based telemetry data (1Hz frequency).
    * Implements "Ascent" (Acceleration) and "Orbit" (Coasting) state machines.
    * Pushes data directly to the database.
2.  **🗄️ Data Layer (PostgreSQL):**
    * Stores persistent time-series mission data.
3.  **🧠 Backend API (Django REST Framework):**
    * Acts as the data gateway.
    * Exposes REST endpoints for the frontend to consume latest telemetry packets.
4.  **🖥️ Frontend Dashboard (React + Vite):**
    * Polls the API for real-time updates.
    * Renders Glassmorphism UI with Chart.js visualizations.

---

## 🛠️ Tech Stack

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | React, Vite, Chart.js | Reactive dashboard with real-time plotting. |
| **Backend** | Django, DRF | Robust API for data retrieval and filtering. |
| **Database** | PostgreSQL 15 | High-performance relational storage. |
| **Simulation** | Python, NumPy | Mathematical modeling of flight dynamics. |
| **DevOps** | Docker, Docker Compose | Container orchestration and networking. |

---

## 🚀 Getting Started

### Prerequisites
* [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Running)
* Git

### Installation & Run
This project is fully containerized. You do not need to install Python or Node.js locally.

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/aparojasri/space-mission-control.git](https://github.com/aparojasri/space-mission-control.git)
    cd space-mission-control
    ```

2.  **Launch the Mission (Single Command):**
    ```bash
    docker-compose up --build
    ```
    *Wait for the logs to show `simulation | T+1s...` and `frontend | Local: http://localhost:5173/`.*

3.  **Access Mission Control:**
    Open your browser and navigate to:
    👉 **[http://localhost:5173](http://localhost:5173)**

---

## 🕹️ Usage Guide

1.  **Initiate Launch:** The dashboard starts in a "Standby" state. Click **INITIATE LAUNCH** to begin the data stream.
2.  **Monitor Flight:** Watch the velocity curve and "Live Telemetry" graph.
    * **T+0 to T+60s (Ascent):** Engines firing, velocity increasing, fuel dropping.
    * **T+60s (MECO/Orbit):** Engine cutoff, velocity stabilizes, temperature drops.
3.  **Operator Controls:**
    * **Power Source:** Switch between Ground Power and Internal Battery (simulates T-minus checklist).
    * **Vent Oxidizer:** Open valves to relieve tank pressure (simulates thermal management).
    * **Abort Mission:** Triggers a system-wide Red Alert and stops data processing.

---

## 🔧 Troubleshooting

**Issue: "Relation 'telemetry_data' does not exist"**
* *Cause:* The database volume might be corrupted or initialized incorrectly.
* *Fix:*
    ```bash
    docker-compose down -v
    docker-compose up --build
    ```

**Issue: Dashboard shows "OFFLINE"**
* *Cause:* The Backend API might be down or the Simulation isn't writing data.
* *Check:* Visit `http://localhost:8000/api/telemetry/`. If it returns `[]`, restart the simulation:
    ```bash
    docker-compose restart simulation
    ```

---

## 🔮 Future Improvements
* **WebSockets:** Replace HTTP polling with Django Channels for true millisecond-latency streaming.
* **3D Visualization:** Integrate Three.js to show a 3D model of the rocket orientation based on Pitch/Yaw/Roll data.
* **Auth System:** Add user login for different operator roles (Flight Director, trajectory Officer, etc.).

---

### 📬 Contact
**Project by:** [Aparojasri](https://github.com/aparojasri)  
**Focus:** Full-Stack Engineering, Aerospace Systems, Data Visualization.
