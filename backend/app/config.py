import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW_OBJ_DIR = os.path.join(BASE_DIR, "data", "raw_objs")
PROCESSED_TILE_DIR = os.path.join(BASE_DIR, "data", "processed_tiles")

os.makedirs(RAW_OBJ_DIR, exist_ok=True)
os.makedirs(PROCESSED_TILE_DIR, exist_ok=True)

