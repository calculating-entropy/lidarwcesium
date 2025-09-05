// import React, { useEffect, useState, useMemo, useRef, useCallback, Suspense } from "react";
// import { Canvas, useThree } from "@react-three/fiber";
// import { OrbitControls, useProgress, Html } from "@react-three/drei";
// import { OBJLoader } from "three-stdlib";
// import * as THREE from "three";


// function Model({ url, onDistancePairsChange, measureMode, onMeshesLoaded, distancePairs }) {
//   const [obj, setObj] = useState(null);
//   const [tempPoints, setTempPoints] = useState([]);
//   const [aimPoint, setAimPoint] = useState(null);
//   const { camera, gl } = useThree();
//   const raycaster = useMemo(() => new THREE.Raycaster(), []);
//   const pointer = useRef(new THREE.Vector2());

//   useEffect(() => {
//     setTempPoints([]);
//     setAimPoint(null);
//     const loader = new OBJLoader();
//     loader.load(
//       url,
//       (object) => {
//         setObj(object);
//         if (onMeshesLoaded) {
//           const meshes = [];
//           object.traverse((child) => {
//             if (child.isMesh) {
//               meshes.push(child.name || `Mesh_${meshes.length + 1}`);
//             }
//           });
//           onMeshesLoaded(meshes, object);
//         }
//       },
//       null,
//       (error) => console.error("OBJ load error:", error)
//     );
//   }, [url, onMeshesLoaded]);

//   // This effect handles the logic for completing a measurement
//   useEffect(() => {
//     if (tempPoints.length === 2) {
//       onDistancePairsChange((prevPairs) => [...prevPairs, tempPoints]);
//       setTempPoints([]);
//     }
//   }, [tempPoints, onDistancePairsChange]);

//   const pointerMove = (event) => {
//     if (!measureMode || !obj) {
//       setAimPoint(null);
//       return;
//     }
//     const canvasBounds = gl.domElement.getBoundingClientRect();
//     pointer.current.x = ((event.clientX - canvasBounds.left) / canvasBounds.width) * 2 - 1;
//     pointer.current.y = -((event.clientY - canvasBounds.top) / canvasBounds.height) * 2 + 1;
//     raycaster.setFromCamera(pointer.current, camera);
//     const intersect = raycaster.intersectObject(obj, true)[0];
//     if (intersect) setAimPoint(intersect.point);
//     else setAimPoint(null);
//   };

//   const pointerDown = () => {
//     if (!measureMode || !aimPoint) return;
//     // Only add a point to the temporary array
//     if (tempPoints.length < 2) {
//       setTempPoints((temp) => [...temp, aimPoint.clone()]);
//     }
//   };

//   return (
//     <>
//       {obj && <primitive object={obj} />}

//       {/* Completed measurement lines */}
//       {distancePairs.map((pair, i) => (
//         <line key={"line" + i}>
//           <bufferGeometry
//             attach="geometry"
//             onUpdate={(geo) => geo.setFromPoints(pair)}
//           />
//           <lineBasicMaterial attach="material" color="yellow" />
//         </line>
//       ))}

//       {/* Completed measurement points */}
//       {distancePairs.flat().map((p, i) => (
//         <mesh key={"point" + i} position={p}>
//           <sphereGeometry args={[0.02, 16, 16]} />
//           <meshStandardMaterial color="orange" />
//         </mesh>
//       ))}

//       {/* Temporary points (green) */}
//       {tempPoints.map((p, i) => (
//         <mesh key={"temppoint" + i} position={p}>
//           <sphereGeometry args={[0.02, 16, 16]} />
//           <meshStandardMaterial color="lightgreen" />
//         </mesh>
//       ))}

//       {/* Aim point */}
//       {measureMode && aimPoint && (
//         <mesh position={aimPoint}>
//           <sphereGeometry args={[0.01, 12, 12]} />
//           <meshStandardMaterial color="lime" emissive="lime" />
//         </mesh>
//       )}

//       <mesh visible={false} onPointerMove={pointerMove} onPointerDown={pointerDown}>
//         <planeGeometry args={[100, 100]} />
//         <meshBasicMaterial transparent opacity={0} />
//       </mesh>
//     </>
//   );
// }
// function Loader() {
//   const { progress } = useProgress();
//   return <Html center>{progress.toFixed(0)} % loaded</Html>;
// }

// export default function ReactThreeObjViewer({ objFileUrl }) {
//   const [distancePairs, setDistancePairs] = useState([]);
//   const [meshList, setMeshList] = useState([]);
//   const [meshVisibility, setMeshVisibility] = useState({});
//   const [objGroup, setObjGroup] = useState(null);
//   const [measureMode, setMeasureMode] = useState(false);

//   const meshVisibilityRef = useRef({});

//   const onMeshesLoaded = useCallback((names, group) => {
//     setMeshList(names);
//     setObjGroup(group);
//     const visMap = {};
//     names.forEach((name) => (visMap[name] = true));
//     setMeshVisibility(visMap);
//     meshVisibilityRef.current = visMap;

//     group.traverse((child) => {
//       if (child.isMesh) child.visible = visMap[child.name || ""] ?? true;
//     });
//   }, []);

//   const toggleVisibility = useCallback(
//     (name) => {
//       setMeshVisibility((prev) => {
//         const newVis = { ...prev, [name]: !prev[name] };
//         meshVisibilityRef.current = newVis;
//         if (objGroup) {
//           objGroup.traverse((child) => {
//             if (child.isMesh && (child.name || "") === name) {
//               child.visible = newVis[name];
//             }
//           });
//         }
//         return newVis;
//       });
//     },
//     [objGroup]
//   );

//   const toggleMeasureMode = () => {
//     setMeasureMode((m) => !m);
//     setDistancePairs([]);
//   };

//   const clearMeasurements = () => {
//     setDistancePairs([]);
//   };

//   return (
//     <div style={{ display: "flex", height: "90vh", color: "white", fontFamily: "Arial, sans-serif" }}>
//       <div style={{ flex: "1", position: "relative", cursor: measureMode ? "crosshair" : "auto" }}>
//         <button
//           onClick={toggleMeasureMode}
//           style={{
//             position: "absolute",
//             top: 10,
//             left: 10,
//             zIndex: 10,
//             padding: "8px 16px",
//             backgroundColor: measureMode ? "#2e7d32" : "#555",
//             color: "white",
//             borderRadius: 5,
//             border: "none",
//             cursor: "pointer",
//             marginRight: 8,
//           }}
//         >
//           {measureMode ? "Cancel Measurement" : "Start Measurement"}
//         </button>
//         {measureMode && (
//           <button
//             onClick={clearMeasurements}
//             style={{
//               position: "absolute",
//               top: 10,
//               left: 140,
//               zIndex: 10,
//               padding: "8px 16px",
//               backgroundColor: "#a33",
//               color: "white",
//               borderRadius: 5,
//               border: "none",
//               cursor: "pointer",
//             }}
//           >
//             Clear Measurements
//           </button>
//         )}

//         {/* Top-right measurement box */}
//         <div
//           style={{
//             position: "absolute",
//             top: 10,
//             right: 10,
//             backgroundColor: "#222",
//             padding: "12px 18px",
//             borderRadius: 8,
//             fontSize: 16,
//             fontWeight: "bold",
//             minWidth: 220,
//             maxHeight: "75vh",
//             overflowY: "auto",
//             boxShadow: "0 0 10px rgba(0,255,0,0.7)",
//             userSelect: "none",
//             zIndex: 10,
//             textAlign: "center",
//           }}
//         >
//           {distancePairs.length ? (
//             <>
//               <div>Distances:</div>
//               <ul style={{ listStyle: "decimal inside", margin: 0, paddingLeft: 10 }}>
//                 {distancePairs.map((pair, i) => {
//                   const dist = pair[0].distanceTo(pair[1]);
//                   return <li key={i}>{dist.toFixed(3)} units</li>;
//                 })}
//               </ul>
//             </>
//           ) : measureMode ? (
//             "Click two points on mesh to measure distances"
//           ) : (
//             "Press 'Start Measurement' to begin"
//           )}
//         </div>

//         <Canvas dpr={[1, 2]} camera={{ position: [0, 0, 3], fov: 60 }}>
//           <ambientLight intensity={0.5} />
//           <directionalLight position={[10, 10, 5]} intensity={1} />
//           <Suspense fallback={<Loader />}>
//             <Model
//               url={objFileUrl}
//               onDistancePairsChange={setDistancePairs}
//               measureMode={measureMode}
//               onMeshesLoaded={onMeshesLoaded}
//               distancePairs={distancePairs}
//             />
//           </Suspense>
//           <OrbitControls />
//         </Canvas>
//       </div>

//       <div
//         style={{
//           width: 260,
//           padding: 16,
//           backgroundColor: "#333",
//           overflowY: "auto",
//           borderLeft: "1px solid #555",
//           fontSize: 14,
//         }}
//       >
//         <h3>Meshes</h3>
//         {meshList.length === 0 && <p style={{ color: "#aaa" }}>No meshes found</p>}
//         {meshList.map((name) => (
//           <div key={name} style={{ marginBottom: 8 }}>
//             <label style={{ cursor: "pointer" }}>
//               <input
//                 type="checkbox"
//                 checked={meshVisibility[name] ?? true}
//                 onChange={() => toggleVisibility(name)}
//                 style={{ marginRight: 8 }}
//               />
//               {name}
//             </label>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }
import React, { useEffect, useState, useMemo, useRef, useCallback, Suspense } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, useProgress, Html } from "@react-three/drei";
import { OBJLoader } from "three-stdlib";
import * as THREE from "three";

// --- STYLES ---
// Centralized styling for a consistent and professional look
const styles = {
  // Main layout
  page: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    background: '#1a1a1a',
    color: '#f0f0f0',
  },
  container: {
    display: 'flex',
    height: '100vh',
  },
  viewerWrapper: {
    flex: 1,
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },

  // Sidebar for mesh list
  sidebar: {
    width: 280,
    background: '#252525',
    borderLeft: '1px solid #333',
    padding: '20px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  sidebarTitle: {
    margin: 0,
    fontSize: '18px',
    borderBottom: '1px solid #444',
    paddingBottom: '10px',
  },
  meshList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  meshItem: {
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
    userSelect: 'none',
  },
  checkbox: {
    width: '18px',
    height: '18px',
    marginRight: '12px',
    accentColor: '#00aaff', // Modern way to color checkboxes
  },
  noMeshesText: {
    color: '#888',
    fontStyle: 'italic',
  },

  // Top toolbar
  toolbar: {
    position: 'absolute',
    top: '16px',
    left: '16px',
    zIndex: 10,
    display: 'flex',
    gap: '10px',
  },
  button: (isActive = false) => ({
    padding: '8px 16px',
    fontSize: '14px',
    color: '#fff',
    background: isActive ? '#007acc' : '#444',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
  }),

  // Measurements panel
  measurementsPanel: {
    position: 'absolute',
    top: '16px',
    right: '16px',
    zIndex: 10,
    background: 'rgba(30, 30, 30, 0.9)',
    backdropFilter: 'blur(5px)',
    border: '1px solid #444',
    borderRadius: '8px',
    padding: '16px',
    width: '240px',
    maxHeight: '80vh',
    overflowY: 'auto',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
  },
  measurementsTitle: {
    margin: '0 0 12px 0',
    fontSize: '16px',
    fontWeight: '600',
    textAlign: 'center',
  },
  measurementsList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  measurementItem: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '14px',
    background: '#333',
    padding: '6px 10px',
    borderRadius: '4px',
  },
  measurementLabel: {
    color: '#aaa',
  },
  measurementValue: {
    fontWeight: '500',
  },
  helperText: {
    textAlign: 'center',
    color: '#aaa',
    fontSize: '14px',
  },
};


// --- 3D MODEL & SCENE COMPONENTS ---

function Model({ url, onDistancePairsChange, measureMode, onMeshesLoaded, distancePairs }) {
  const [obj, setObj] = useState(null);
  const [tempPoints, setTempPoints] = useState([]);
  const [aimPoint, setAimPoint] = useState(null);
  const { camera, gl } = useThree();
  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const pointer = useRef(new THREE.Vector2());

  useEffect(() => {
    setTempPoints([]);
    setAimPoint(null);
    const loader = new OBJLoader();
    loader.load(url, (object) => {
        setObj(object);
        if (onMeshesLoaded) {
          const meshes = [];
          object.traverse((child) => {
            if (child.isMesh) {
              meshes.push(child.name || `Mesh_${meshes.length + 1}`);
            }
          });
          onMeshesLoaded(meshes, object);
        }
      }, null, (error) => console.error("An error happened during OBJ loading:", error));
  }, [url, onMeshesLoaded]);

  useEffect(() => {
    if (tempPoints.length === 2) {
      onDistancePairsChange((prevPairs) => [...prevPairs, tempPoints]);
      setTempPoints([]);
    }
  }, [tempPoints, onDistancePairsChange]);

  const pointerMove = useCallback((event) => {
    if (!measureMode || !obj) {
      setAimPoint(null);
      return;
    }
    const canvasBounds = gl.domElement.getBoundingClientRect();
    pointer.current.x = ((event.clientX - canvasBounds.left) / canvasBounds.width) * 2 - 1;
    pointer.current.y = -((event.clientY - canvasBounds.top) / canvasBounds.height) * 2 + 1;
    raycaster.setFromCamera(pointer.current, camera);
    const intersect = raycaster.intersectObject(obj, true)[0];
    setAimPoint(intersect ? intersect.point : null);
  }, [measureMode, obj, gl.domElement, camera, raycaster]);

  const pointerDown = useCallback(() => {
    if (!measureMode || !aimPoint) return;
    if (tempPoints.length < 2) {
      setTempPoints((temp) => [...temp, aimPoint.clone()]);
    }
  }, [measureMode, aimPoint, tempPoints.length]);

  return (
    <>
      {obj && <primitive object={obj} />}
      {distancePairs.map((pair, i) => (
        <line key={`line-${i}`}>
          <bufferGeometry attach="geometry" onUpdate={(geo) => geo.setFromPoints(pair)} />
          <lineBasicMaterial attach="material" color="#ffeb3b" linewidth={2} />
        </line>
      ))}
      {distancePairs.flat().map((p, i) => (
        <mesh key={`point-${i}`} position={p}>
          <sphereGeometry args={[0.02, 16, 16]} />
          <meshStandardMaterial color="#ff9800" />
        </mesh>
      ))}
      {tempPoints.map((p, i) => (
        <mesh key={`temp-point-${i}`} position={p}>
          <sphereGeometry args={[0.02, 16, 16]} />
          <meshStandardMaterial color="#cddc39" />
        </mesh>
      ))}
      {measureMode && aimPoint && (
        <mesh position={aimPoint}>
          <sphereGeometry args={[0.01, 12, 12]} />
          <meshStandardMaterial color="#8bc34a" emissive="#8bc34a" />
        </mesh>
      )}
      <mesh visible={false} onPointerMove={pointerMove} onPointerDown={pointerDown}>
        <planeGeometry args={[100, 100]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
    </>
  );
}

function Loader() {
  const { progress } = useProgress();
  return <Html center style={{ color: '#f0f0f0', fontSize: '18px' }}>{progress.toFixed(0)}% Loaded</Html>;
}

// --- UI COMPONENTS ---

const Toolbar = ({ measureMode, toggleMeasureMode, clearMeasurements, hasMeasurements }) => (
  <div style={styles.toolbar}>
    <button style={styles.button(measureMode)} onClick={toggleMeasureMode}>
      {measureMode ? "Cancel" : "Measure"}
    </button>
    {measureMode && hasMeasurements && (
      <button style={{ ...styles.button(), background: '#c62828' }} onClick={clearMeasurements}>
        Clear
      </button>
    )}
  </div>
);

const MeasurementsPanel = ({ distancePairs, measureMode }) => (
  <div style={styles.measurementsPanel}>
    <h3 style={styles.measurementsTitle}>Measurements</h3>
    {distancePairs.length > 0 ? (
      <ul style={styles.measurementsList}>
        {distancePairs.map((pair, i) => {
          const dist = pair[0].distanceTo(pair[1]);
          return (
            <li key={`dist-${i}`} style={styles.measurementItem}>
              <span style={styles.measurementLabel}>Dist {i + 1}</span>
              <span style={styles.measurementValue}>{dist.toFixed(3)} units</span>
            </li>
          );
        })}
      </ul>
    ) : (
      <p style={styles.helperText}>
        {measureMode ? "Click two points on the model to measure." : "Start measurement mode to begin."}
      </p>
    )}
  </div>
);

const Sidebar = ({ meshList, meshVisibility, toggleVisibility }) => (
  <aside style={styles.sidebar}>
    <h2 style={styles.sidebarTitle}>Mesh Layers</h2>
    {meshList.length > 0 ? (
      <div style={styles.meshList}>
        {meshList.map((name) => (
          <label key={name} style={styles.meshItem}>
            <input
              type="checkbox"
              style={styles.checkbox}
              checked={meshVisibility[name] ?? true}
              onChange={() => toggleVisibility(name)}
            />
            {name}
          </label>
        ))}
      </div>
    ) : (
      <p style={styles.noMeshesText}>No meshes found in model.</p>
    )}
  </aside>
);


// --- MAIN APP COMPONENT ---

export default function ReactThreeObjViewer({ objFileUrl }) {
  const [distancePairs, setDistancePairs] = useState([]);
  const [meshList, setMeshList] = useState([]);
  const [meshVisibility, setMeshVisibility] = useState({});
  const [objGroup, setObjGroup] = useState(null);
  const [measureMode, setMeasureMode] = useState(false);

  const customCrosshair = "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"32\" height=\"32\" viewBox=\"0 0 32 32\"><path stroke=\"white\" stroke-width=\"2\" d=\"M16 5V13M16 19V27M5 16H13M19 16H27\"/></svg>') 16 16, auto";

  const onMeshesLoaded = useCallback((names, group) => {
    setMeshList(names);
    setObjGroup(group);
    const visMap = names.reduce((acc, name) => ({ ...acc, [name]: true }), {});
    setMeshVisibility(visMap);
  }, []);

  const toggleVisibility = useCallback((name) => {
    setMeshVisibility((prev) => {
      const newVis = { ...prev, [name]: !prev[name] };
      objGroup?.traverse((child) => {
        if (child.isMesh && child.name === name) {
          child.visible = newVis[name];
        }
      });
      return newVis;
    });
  }, [objGroup]);

  const toggleMeasureMode = () => {
    setMeasureMode((m) => !m);
    if (measureMode) {
      setDistancePairs([]); // Clear measurements when exiting mode
    }
  };

  const clearMeasurements = () => {
    setDistancePairs([]);
  };

  return (
    <div style={styles.page}>
      <main style={styles.container}>
        <div style={{...styles.viewerWrapper, cursor: measureMode ? customCrosshair : 'grab'}}>
          <Toolbar
            measureMode={measureMode}
            toggleMeasureMode={toggleMeasureMode}
            clearMeasurements={clearMeasurements}
            hasMeasurements={distancePairs.length > 0}
          />
          <MeasurementsPanel distancePairs={distancePairs} measureMode={measureMode} />
          <Canvas dpr={[1, 2]} camera={{ position: [0, 0, 3], fov: 60 }}>
            <color attach="background" args={['#1a1a1a']} />
            <ambientLight intensity={0.75} />
            <directionalLight position={[10, 10, 5]} intensity={1.5} />
            <Suspense fallback={<Loader />}>
              <Model
                url={objFileUrl}
                onDistancePairsChange={setDistancePairs}
                measureMode={measureMode}
                onMeshesLoaded={onMeshesLoaded}
                distancePairs={distancePairs}
              />
            </Suspense>
            <OrbitControls />
          </Canvas>
        </div>
        <Sidebar meshList={meshList} meshVisibility={meshVisibility} toggleVisibility={toggleVisibility} />
      </main>
    </div>
  );
}