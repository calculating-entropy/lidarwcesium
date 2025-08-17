// import React from 'react';

// export default function MeasurementModal({ open, onClose, data }) {
//   if (!open) return null;
//   if (!data) return (
//     <div className="modal">
//       <button onClick={onClose}>Close</button>
//     </div>
//   );
//   return (
//     <div className="modal">
//       <h2>Measurement Results</h2>
//       {data.error ? (
//         <p style={{ color: 'red' }}>{data.error}</p>
//       ) : (
//         <pre>{JSON.stringify(data, null, 2)}</pre>
//       )}
//       <button onClick={onClose}>Close</button>
//     </div>
//   );
// }
export default function MeasurementModal({ open, onClose, data }) {
  if (!open) return null;
  if (!data) return (
    <div className="modal">
      <button onClick={onClose}>Close</button>
    </div>
  );

  // Check for error
  if (data.error || (data.measurements && data.measurements.error)) {
    return (
      <div className="modal">
        <h2 style={{ color: "#ff3344" }}>Measurement Error</h2>
        <div style={{ color: "#ff7b84", marginBottom: "1em" }}>
          {data.error || data.measurements.error}
        </div>
        <button onClick={onClose}>Close</button>
      </div>
    );
  }

  // Structured "nice" result
  const result = data.measurements || {};
  return (
    <div className="modal">
      <h2 style={{ color: "#20e8de" }}>Measurement Results</h2>
      <div style={{
        background: "#181c20",
        borderRadius: "12px",
        padding: "1.2em 1.5em",
        marginBottom: "1em",
        boxShadow: "0 2px 16px #07bcd6a9"
      }}>
        <div style={{fontSize: "1.1em", marginBottom: 10}}>
          <b>Filename:</b> <span style={{color:"#60eaff"}}>{result.filename}</span>
        </div>
        {result.ceiling_to_floor_distance_m !== undefined &&
          <div style={{fontSize: "1.15em"}}>
            <b>Ceiling–Floor Distance:</b> <span style={{color:"#9bf679"}}>{result.ceiling_to_floor_distance_m.toFixed(3)} m</span>
          </div>
        }
      </div>
      <button onClick={onClose}>Close</button>
    </div>
  );
}

