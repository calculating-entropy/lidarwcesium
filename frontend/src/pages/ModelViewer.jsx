import React from "react";
import { useSearchParams } from "react-router-dom";
import ReactThreeObjViewer from "../components/ReactThreeObjViewer";

export default function ModelViewer() {
  const [searchParams] = useSearchParams();
  const file = searchParams.get("file");
  const objFileUrl = file ? `http://localhost:8000/raw_objs/${file}` : null;

  if (!objFileUrl)
    return (
      <div style={{ padding: 20, color: "red" }}>
        No OBJ file specified. Use URL query, e.g. ?file=yourfile.obj
      </div>
    );

  return (
    <div style={{ padding: 20 }}>
      <h1 style={{ color: "#00d8f9" }}>3D Model Viewer</h1>
      <a href="/" style={{ color: "#5ab9f8", display: "inline-block", marginBottom: 10 }}>
        ← Back to Home
      </a>
      <ReactThreeObjViewer objFileUrl={objFileUrl} />
    </div>
  );
}
