import React from "react";
import CesiumViewer from "../components/CesiumViewer";

export default function Viewer() {
  return (
    <div>
      <h1>3D Map Viewer</h1>
      <CesiumViewer />
    </div>
  );
}
