import os
import subprocess
from app.config import RAW_OBJ_DIR, PROCESSED_TILE_DIR

def process_obj(obj_filename: str):
    obj_path = os.path.join(RAW_OBJ_DIR, obj_filename)
    basename = obj_filename.rsplit('.', 1)[0]
    gltf_filename = f"{basename}.gltf"
    gltf_path = os.path.join(PROCESSED_TILE_DIR, gltf_filename)
    try:
        subprocess.run(["obj2gltf", "-i", obj_path, "-o", gltf_path], check=True)
    except Exception as e:
        print(f"Error converting OBJ to glTF: {e}")

