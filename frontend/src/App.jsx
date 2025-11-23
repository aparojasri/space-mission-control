import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';
import './index.css'; 

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

// --- HELPER COMPONENTS (Moved to Top to fix errors) ---

const ControlWithInfo = ({ label, buttonText, onClick, statusColor, tooltipTitle, tooltipText, isDanger }) => (
  <div className={`control-wrapper ${isDanger ? 'danger' : ''}`}>
    <label style={{ fontSize: '0.8rem', color: '#aaa' }}>{label}</label>
    <button className={`btn-control ${isDanger ? 'btn-danger' : ''}`} onClick={onClick} style={{ borderColor: statusColor }}>
      {buttonText}
    </button>
    
    {/* The Hidden Tooltip */}
    <div className="tech-tooltip">
      <h4>{tooltipTitle}</h4>
      <div>{tooltipText}</div>
    </div>
  </div>
);

const MetricBox = ({ label, value, unit, color }) => (
  <div className="glass-panel" style={{ alignItems: 'center', justifyContent: 'center', borderTop: `4px solid ${color}`, padding: '10px' }}>
    <div className="metric-huge" style={{ color: color, fontSize: '1.5rem' }}>{value || "--"}</div>
    <div style={{ color: '#888', fontSize: '0.8rem' }}>{label} ({unit})</div>
  </div>
);

const DataRow = ({ label, value, unit }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
    <span style={{ color: '#888' }}>{label}</span>
    <span style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>{value || "--"} {unit}</span>
  </div>
);

// --- MAIN APP COMPONENT ---

function App() {
  // --- STATES ---
  const [isLaunched, setIsLaunched] = useState(false); 
  const [telemetry, setTelemetry] = useState([]);
  const [latest, setLatest] = useState(null);
  
  const [powerMode, setPowerMode] = useState('GROUND'); 
  const [venting, setVenting] = useState(false);
  const [missionStatus, setMissionStatus] = useState('READY'); 

  // --- DATA ENGINE ---
  const fetchData = () => {
    if (!isLaunched || missionStatus === 'ABORTED') return; 

    axios.get('http://127.0.0.1:8000/api/telemetry/')
      .then(response => {
        const data = response.data.reverse();
        setTelemetry(data);
        if (data.length > 0) {
            setLatest(data[data.length - 1]);
        }
      })
      .catch(error => console.error("Connection Lost:", error));
  };

  useEffect(() => {
    const interval = setInterval(fetchData, 1000);
    return () => clearInterval(interval);
  }, [isLaunched, missionStatus]);

  // --- ACTIONS ---
  const handleLaunch = () => {
    setIsLaunched(true);
    setMissionStatus('NOMINAL');
  };

  const handleAbort = () => {
    if (window.confirm("⚠️ CRITICAL WARNING: ABORT MISSION? This cannot be undone.")) {
      setMissionStatus('ABORTED');
    }
  };

  const handleReset = () => {
    setIsLaunched(false);
    setMissionStatus('READY');
    setTelemetry([]);
    setLatest(null);
  };

  // --- CALCULATIONS ---
  const mach = latest ? (latest.velocity_kmh / 1235).toFixed(2) : "0.00";
  const qPressure = latest ? (latest.velocity_kmh / 100).toFixed(1) : "0.0";
  
  const getStatusColor = () => {
    if (missionStatus === 'ABORTED') return '#ff3b3b'; 
    if (missionStatus === 'NOMINAL') return '#00ff41'; 
    return '#ff9f43'; 
  };

  // --- CHART CONFIG ---
  const chartData = {
    labels: telemetry.map(d => new Date(d.timestamp).toLocaleTimeString()),
    datasets: [
      {
        label: 'Engine Temp (°C)',
        data: telemetry.map(d => d.engine_temp),
        borderColor: '#ff3b3b',
        borderWidth: 2,
        pointRadius: 0,
        yAxisID: 'y',
      },
      {
        label: 'Fuel Pressure (Bar)',
        data: telemetry.map(d => d.pressure_fuel),
        borderColor: '#1e90ff',
        borderWidth: 2,
        pointRadius: 0,
        yAxisID: 'y1',
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    scales: {
      x: { display: false },
      y: { position: 'left', grid: { color: '#333' }, ticks: { color: '#ff3b3b' } },
      y1: { position: 'right', grid: { drawOnChartArea: false }, ticks: { color: '#1e90ff' } }
    },
    plugins: { legend: { position: 'bottom', labels: { color: 'white' } } }
  };

  // --- RENDER ---
  return (
    <div className="dashboard-container">
      
      {/* 1. LAUNCH OVERLAY */}
      {!isLaunched && (
        <div className="launch-overlay">
          <h1 style={{ fontSize: '3rem', marginBottom: '10px' }}>ORBITAL COMMAND LINK</h1>
          <p style={{ color: '#888', marginBottom: '40px' }}>SYSTEM ID: OMEGA-7 | CONNECTION ESTABLISHED</p>
          <button className="btn-launch" onClick={handleLaunch}>INITIATE LAUNCH</button>
        </div>
      )}

      {/* 2. MAIN DASHBOARD */}
      <div className="dashboard-grid" style={{ filter: !isLaunched ? 'blur(10px)' : 'none' }}>
        
        {/* LEFT PANEL: CONTROLS WITH HOVER INFO */}
        <div className="glass-panel">
          <h2 style={{ borderBottom: '1px solid #444', paddingBottom: '10px' }}>🚀 FLIGHT CONTROLS</h2>
          
          <ControlWithInfo 
            label="POWER SOURCE"
            buttonText={powerMode === 'GROUND' ? '🔌 GROUND POWER' : '🔋 INTERNAL BATTERY'}
            statusColor={powerMode === 'INTERNAL' ? 'orange' : '#333'}
            onClick={() => setPowerMode(prev => prev === 'GROUND' ? 'INTERNAL' : 'GROUND')}
            tooltipTitle="EPS: Electrical Power System"
            tooltipText={
              <>
                <strong>FUNCTION:</strong> Switches main bus from Ground Support Equipment (GSE) to onboard Li-Ion batteries.<br/><br/>
                <strong>PROTOCOL:</strong> Must be switched to INTERNAL at T-60 seconds to verify voltage stability before umbilical separation.
              </>
            }
          />

          <ControlWithInfo 
            label="PROPELLANT MANAGEMENT"
            buttonText={venting ? '💨 VENTING LOX...' : '🔒 VALVES CLOSED'}
            statusColor={venting ? 'orange' : '#555'}
            onClick={() => setVenting(!venting)}
            tooltipTitle="LOX Bleed Valve Control"
            tooltipText={
              <>
                <strong>FUNCTION:</strong> Opens solenoid valves to vent excess gaseous oxygen.<br/><br/>
                <strong>CRITERIA:</strong> Use if Tank Pressure exceeds 50 Bar due to thermal expansion. <br/>
                <em>WARNING: Venting reduces total Delta-V capability.</em>
              </>
            }
          />

          <div style={{ marginTop: 'auto' }}>
            {missionStatus === 'ABORTED' ? (
               <button className="btn-control" onClick={handleReset} style={{ borderColor: 'white' }}>↺ RESET SYSTEM</button>
            ) : (
               <ControlWithInfo 
                isDanger={true}
                label="EMERGENCY TERMINATION"
                buttonText="⚠ ABORT MISSION"
                onClick={handleAbort}
                tooltipTitle="FTS: Flight Termination System"
                tooltipText={
                  <>
                    <strong>FUNCTION:</strong> Immediate engine cutoff (SECO) and propellant dump.<br/><br/>
                    <strong>COMMIT CRITERIA:</strong><br/>
                    1. Loss of Telemetry &gt; 5s<br/>
                    2. Trajectory deviation &gt; 4°<br/>
                    3. Critical Structural Failure (Max-Q)
                  </>
                }
              />
            )}
          </div>
        </div>

        {/* CENTER PANEL: VISUALS */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column' }}>
          
          {/* HEADER */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <div>
              <h1 style={{ margin: 0, fontSize: '1.2rem', letterSpacing: '2px' }}>SPACE MISSION CONTROL</h1>
              <span style={{ color: '#888', fontSize: '0.8rem' }}>ORBITAL INSERTION TRAJECTORY</span>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '2rem', fontFamily: 'monospace', color: getStatusColor() }}>
                {missionStatus}
              </div>
              <div style={{ color: '#888', fontSize: '0.9rem' }}>T+ {latest ? new Date(telemetry.length * 1000).toISOString().substr(14, 5) : "00:00"}</div>
            </div>
          </div>

          {/* MAIN CHART */}
          <div style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column' }}>
             <h4 style={{ margin: '0 0 5px 0', color: '#aaa', fontSize: '0.8rem' }}>LIVE TELEMETRY (TEMP vs PRESSURE)</h4>
             <div style={{ flex: 1, minHeight: 0 }}>
                <Line data={chartData} options={chartOptions} />
             </div>
          </div>

          {/* METRICS */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginTop: '15px' }}>
             <MetricBox label="ALTITUDE" value={latest?.altitude_km} unit="km" color="#f1c40f" />
             <MetricBox label="MACH" value={mach} unit="M" color="#9b59b6" />
             <MetricBox label="MAX-Q" value={qPressure} unit="kPa" color="#e74c3c" />
          </div>
        </div>

        {/* RIGHT PANEL: DATA STREAM */}
        <div className="glass-panel">
          <h2 style={{ borderBottom: '1px solid #444', paddingBottom: '10px' }}>📡 DATA LINK</h2>
          
          <DataRow label="Velocity" value={latest?.velocity_kmh} unit="km/h" />
          <DataRow label="Engine Temp" value={latest?.engine_temp} unit="°C" />
          <DataRow label="Fuel Pressure" value={latest?.pressure_fuel} unit="Bar" />
          <DataRow label="Roll Axis" value={latest?.attitude_roll} unit="deg" />
          <DataRow label="Pitch Axis" value="0.02" unit="deg" />
          <DataRow label="G-Force" value={latest?.status_code === 'ASCENT' ? (1 + parseFloat(mach)).toFixed(2) : "1.00"} unit="G" />
          
          <h3 style={{ marginTop: '20px', borderBottom: '1px solid #444' }}>SYSTEM LOGS</h3>
          <div style={{ flex: 1, overflowY: 'auto', fontFamily: 'monospace', fontSize: '0.8rem', marginTop: '10px' }}>
             {telemetry.slice(0, 50).map((log, i) => (
               <div key={i} style={{ marginBottom: '4px', color: '#aaa' }}>
                 <span style={{ color: '#555' }}>[{new Date(log.timestamp).toLocaleTimeString()}]</span> 
                 <span style={{ color: log.status_code === 'NOMINAL' ? '#00ff41' : '#ff3b3b', marginLeft: '5px' }}> {log.status_code}</span>
                 <span style={{ float: 'right' }}>Alt: {log.altitude_km}</span>
               </div>
             ))}
          </div>
        </div>

      </div>
    </div>
  );
}

export default App;