import os
import uuid
import time
from fastapi import FastAPI, File, UploadFile, HTTPException, BackgroundTasks
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from app.config import RAW_OBJ_DIR, PROCESSED_TILE_DIR
from app.worker import process_obj
from app.measure import measure_obj
from fastapi.middleware.cors import CORSMiddleware



app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Or ["http://localhost:3000"] for stricter security
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# Serve processed assets
app.mount("/processed_assets", StaticFiles(directory=PROCESSED_TILE_DIR), name="processed_assets")
# Serve raw OBJ files
app.mount("/raw_objs", StaticFiles(directory=RAW_OBJ_DIR), name="raw_objs")

# In-memory metadata (for demo; for production, use a DB)
uploaded_objs = []

@app.post("/upload_obj/")
async def upload_obj(file: UploadFile = File(...), background_tasks: BackgroundTasks = None):
    if not file.filename.endswith(".obj"):
        raise HTTPException(status_code=400, detail="Only .obj files allowed")
    unique_id = str(uuid.uuid4())
    filename = f"{unique_id}.obj"
    raw_path = os.path.join(RAW_OBJ_DIR, filename)
    with open(raw_path, "wb") as f:
        f.write(await file.read())
    ts = time.time()
    # Store metadata with timestamp for listing
    uploaded_objs.append({
        "filename": filename,
        "timestamp": ts
    })
    # Start conversion in background
    background_tasks.add_task(process_obj, filename)
    return {"message": "File uploaded, processing started", "filename": filename, "timestamp": ts}

@app.get("/list_objs/")
def list_objs():
    # List all OBJs with download URL and timestamp
    objs = []
    for entry in uploaded_objs:
        download_url = f"/raw_objs/{entry['filename']}"
        measure_url = f"/measure/{entry['filename']}"
        objs.append({
            "filename": entry['filename'],
            "timestamp": entry['timestamp'],
            "download_url": download_url,
            "measure_url": measure_url
        })
    return {"objs": objs}

@app.get("/measure/{filename}")
def get_measurements(filename: str):
    if not filename.endswith(".obj"):
        raise HTTPException(status_code=400, detail="File must be an OBJ")
    path = os.path.join(RAW_OBJ_DIR, filename)
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="OBJ not found")
    result = measure_obj(filename)
    return {"filename": filename, "measurements": result}

@app.get("/assets/")
def list_assets():
    files = os.listdir(PROCESSED_TILE_DIR)
    urls = [f"/processed_assets/{file}" for file in files if file.endswith('.gltf')]
    return {"assets": urls}

@app.get("/processed_assets/{filename}")
def get_processed_asset(filename: str):
    file_path = os.path.join(PROCESSED_TILE_DIR, filename)
    if os.path.exists(file_path):
        return FileResponse(file_path, filename=filename)
    raise HTTPException(status_code=404, detail="File not found")

@app.get("/raw_objs/{filename}")
def get_raw_obj(filename: str):
    file_path = os.path.join(RAW_OBJ_DIR, filename)
    if os.path.exists(file_path):
        return FileResponse(file_path, filename=filename)
    raise HTTPException(status_code=404, detail="File not found")

