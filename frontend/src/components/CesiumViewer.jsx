
import React, { useEffect, useRef, useState } from "react";
import { 
  Viewer, 
  Cartesian3, 
  Color, 
  VerticalOrigin 
} from "cesium";
import "cesium/Build/Cesium/Widgets/widgets.css";

window.CESIUM_BASE_URL = "/cesium";

export default function CesiumViewer() {
  const cesiumContainer = useRef(null);
  const [assets, setAssets] = useState([]);
  const viewerRef = useRef(null);

  useEffect(() => {
    const viewer = new Viewer(cesiumContainer.current, {});
    viewerRef.current = viewer;

    // Wait for viewer to be ready before fetching assets
    const loadAssets = async () => {
      try {
        const response = await fetch("http://localhost:8000/list_objs/");
        const data = await response.json();
        const loadedAssets = data.objs || [];
        
        // Process each asset sequentially to avoid race conditions
        for (const asset of loadedAssets) {
          const hasCoords = typeof asset.longitude === "number" && typeof asset.latitude === "number";
          const lon = hasCoords ? asset.longitude : 0;
          const lat = hasCoords ? asset.latitude : 0;
          
          console.log(`Adding entity ${asset.filename} at lat=${lat}, lon=${lon}`);
          
          // Check if glTF file exists
          const basename = asset.filename.replace('.obj', '');
          const gltfPath = `/processed_assets/${basename}.gltf`;
          
          const entityOptions = {
            id: asset.filename,
            position: Cartesian3.fromDegrees(lon, lat, 20),
            name: asset.filename,
            label: {
              text: asset.filename,
              verticalOrigin: VerticalOrigin.BOTTOM,
              pixelOffset: { x: 0, y: -40 },
              fillColor: Color.WHITE,
              outlineColor: Color.BLACK,
              outlineWidth: 2,
              font: '12px sans-serif'
            }
          };

          try {
            // Check if glTF exists
            const gltfResponse = await fetch(`http://localhost:8000${gltfPath}`, { method: 'HEAD' });
            
            // In your CesiumViewer, replace the model loading section:
if (gltfResponse.ok) {
  console.log(`Loading 3D model: ${gltfPath}`);
  entityOptions.model = {
    uri: `http://localhost:8000${gltfPath}`,
    scale: 2.0,                    // Increase scale for better visibility
    minimumPixelSize: 128,         // Ensure minimum visibility (increased from 64)
    maximumScale: 10.0,           // Allow larger scaling when zoomed in
    heightReference: 0,           // Clamp to ground
    silhouetteColor: Color.YELLOW, // Add outline for better definition
    silhouetteSize: 2.0,
    shadows: 1,                   // Cast shadows
    colorBlendMode: 0,            // Normal color blending
    colorBlendAmount: 0.5
  };
}

             else {
              // glTF not ready yet, show fallback marker
              console.log(`glTF not ready for ${asset.filename}, using marker`);
              entityOptions.cylinder = {
                length: 10,
                topRadius: 3,
                bottomRadius: 3,
                material: Color.ORANGE.withAlpha(0.8),
                outline: true,
                outlineColor: Color.RED
              };
            }
          } catch (error) {
            // Fallback: show point marker
            console.log(`Using fallback point for: ${asset.filename}`);
            entityOptions.point = {
              pixelSize: 15,
              color: Color.YELLOW,
              outlineColor: Color.BLACK,
              outlineWidth: 2
            };
          }

          // Ensure viewer and entities collection exist before adding
          if (viewer && viewer.entities && !viewer.isDestroyed()) {
            viewer.entities.add(entityOptions);
          }
        }
        
        setAssets(loadedAssets);
      } catch (error) {
        console.error("Asset fetch failed:", error);
      }
    };

    // Load assets after viewer is initialized
    loadAssets();

    return () => {
      if (viewer && !viewer.isDestroyed()) {
        viewer.destroy();
      }
    };
  }, []);

  function handleFlyTo(event) {
    const filename = event.target.value;
    if (!filename || !viewerRef.current || viewerRef.current.isDestroyed()) return;
    
    const viewer = viewerRef.current;
    const entity = viewer.entities.getById(filename);
    if (entity) {
      console.log("Flying to", filename);
      setTimeout(() => {
        if (!viewer.isDestroyed()) {
          viewer.flyTo(entity);
        }
      }, 300);
    } else {
      alert("Entity not found in scene: " + filename);
    }
  }

  return (
    <div>
      <div style={{ padding: 12 }}>
        <label style={{ color: "#A0F1FF", fontWeight: 500, marginRight: 10 }}>
          Jump to scan:
        </label>
        <select onChange={handleFlyTo} style={{ fontSize: 16, padding: "4px 8px", borderRadius: 6 }}>
          <option value="">Select OBJ file...</option>
          {assets.map((asset) => (
            <option key={asset.filename} value={asset.filename}>
              {asset.filename} (lat: {asset.latitude?.toFixed(3)}, lon: {asset.longitude?.toFixed(3)})
            </option>
          ))}
        </select>
      </div>
      <div
        ref={cesiumContainer}
        style={{ width: "100vw", height: "80vh", background: "#000" }}
      />
    </div>
  );
}
