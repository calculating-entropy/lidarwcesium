import React, { useEffect, useRef } from "react";
import { Viewer, Cartesian3 } from "cesium";
import "cesium/Build/Cesium/Widgets/widgets.css";

window.CESIUM_BASE_URL = "/cesium";

export default function CesiumViewer() {
  const cesiumContainer = useRef(null);

  useEffect(() => {
    const viewer = new Viewer(cesiumContainer.current, {});
    fetch("http://localhost:8000/assets/")
      .then(res => res.json())
      .then(data => {
        (data.assets || []).forEach(url => {
          viewer.entities.add({
            model: { uri: `http://localhost:8000${url}` },
            position: Cartesian3.fromDegrees(2.2945, 48.8584, 0)
          });
        });
      })
      .catch(err => console.error("Asset fetch failed:", err));

    return () => {
      if (viewer && viewer.destroy) viewer.destroy();
    };
  }, []);

  return (
    <div
      ref={cesiumContainer}
      style={{ width: "100vw", height: "80vh", background: "#000" }}
    />
  );
}
