# import os
# import subprocess
# from app.config import RAW_OBJ_DIR, PROCESSED_TILE_DIR

# def process_obj(obj_filename: str):
#     obj_path = os.path.join(RAW_OBJ_DIR, obj_filename)
#     basename = obj_filename.rsplit('.', 1)[0]
#     gltf_filename = f"{basename}.gltf"
#     gltf_path = os.path.join(PROCESSED_TILE_DIR, gltf_filename)
#     try:
#         subprocess.run(["obj2gltf", "-i", obj_path, "-o", gltf_path], check=True)
#     except Exception as e:
#         print(f"Error converting OBJ to glTF: {e}")
import os
import subprocess
import trimesh
import numpy as np
from pygltflib import GLTF2, Buffer, BufferView, Accessor, Mesh, Primitive, Asset, Scene, Node, Material, PbrMetallicRoughness
import base64
from app.config import RAW_OBJ_DIR, PROCESSED_TILE_DIR

def process_obj(obj_filename: str):
    obj_path = os.path.join(RAW_OBJ_DIR, obj_filename)
    basename = obj_filename.rsplit('.', 1)[0]
    gltf_filename = f"{basename}.gltf"
    gltf_path = os.path.join(PROCESSED_TILE_DIR, gltf_filename)
    
    try:
        # First try the custom high-quality conversion
        if _convert_with_trimesh(obj_path, gltf_path):
            print(f"✅ Successfully converted {obj_filename} to high-quality glTF using trimesh")
            return
        else:
            print(f"⚠️  Trimesh conversion failed for {obj_filename}, falling back to obj2gltf")
            # Fallback to your existing obj2gltf method
            _convert_with_obj2gltf(obj_path, gltf_path)
            
    except Exception as e:
        print(f"❌ Error converting OBJ to glTF: {e}")

def _convert_with_trimesh(obj_path: str, gltf_path: str) -> bool:
    """High-quality conversion using trimesh and pygltflib"""
    try:
        # Load mesh with trimesh
        mesh = trimesh.load(obj_path, force='mesh')
        
        # Handle scene vs single mesh
        if isinstance(mesh, trimesh.Scene):
            if len(mesh.geometry) == 0:
                return False
            # Take the first geometry from the scene
            mesh = list(mesh.geometry.values())[0]
        
        # Ensure we have valid data
        if len(mesh.vertices) == 0 or len(mesh.faces) == 0:
            return False
        
        # Prepare data arrays
        vertices = np.array(mesh.vertices).astype(np.float32)
        indices = np.array(mesh.faces).flatten().astype(np.uint32)
        
        # Generate normals for better lighting
        if hasattr(mesh, 'vertex_normals') and len(mesh.vertex_normals) > 0:
            normals = np.array(mesh.vertex_normals).astype(np.float32)
        else:
            # Generate normals if not present
            mesh.fix_normals()
            normals = np.array(mesh.vertex_normals).astype(np.float32)
        
        # Create binary buffers
        vertex_buffer = vertices.tobytes()
        normal_buffer = normals.tobytes()
        index_buffer = indices.tobytes()
        combined_buffer = vertex_buffer + normal_buffer + index_buffer
        
        # Create glTF structure with enhanced features
        gltf = GLTF2(
            asset=Asset(version="2.0", generator="Custom Trimesh Converter"),
            buffers=[Buffer(
                byteLength=len(combined_buffer), 
                uri=f"data:application/octet-stream;base64,{base64.b64encode(combined_buffer).decode()}"
            )],
            bufferViews=[
                # Vertex positions
                BufferView(buffer=0, byteOffset=0, byteLength=len(vertex_buffer), target=34962),
                # Vertex normals
                BufferView(buffer=0, byteOffset=len(vertex_buffer), byteLength=len(normal_buffer), target=34962),
                # Indices
                BufferView(buffer=0, byteOffset=len(vertex_buffer) + len(normal_buffer), byteLength=len(index_buffer), target=34963)
            ],
            accessors=[
                # Position accessor
                Accessor(
                    bufferView=0, 
                    componentType=5126, 
                    count=len(vertices), 
                    type="VEC3",
                    max=vertices.max(axis=0).tolist(), 
                    min=vertices.min(axis=0).tolist()
                ),
                # Normal accessor
                Accessor(
                    bufferView=1, 
                    componentType=5126, 
                    count=len(normals), 
                    type="VEC3"
                ),
                # Index accessor
                Accessor(
                    bufferView=2, 
                    componentType=5125, 
                    count=len(indices), 
                    type="SCALAR"
                )
            ],
            materials=[Material(
                pbrMetallicRoughness=PbrMetallicRoughness(
                    baseColorFactor=[0.8, 0.8, 0.8, 1.0],  # Light gray
                    metallicFactor=0.1,
                    roughnessFactor=0.8
                ),
                doubleSided=True
            )],
            meshes=[Mesh(primitives=[Primitive(
                attributes={"POSITION": 0, "NORMAL": 1}, 
                indices=2,
                material=0
            )])],
            nodes=[Node(mesh=0)],
            scenes=[Scene(nodes=[0])],
            scene=0
        )
        
        # Save glTF file
        gltf.save(gltf_path)
        return True
        
    except Exception as e:
        print(f"Trimesh conversion error: {e}")
        return False

def _convert_with_obj2gltf(obj_path: str, gltf_path: str):
    """Fallback conversion using obj2gltf"""
    subprocess.run([
        "obj2gltf", 
        "-i", obj_path, 
        "-o", gltf_path,
        "--separateTextures",
        "--generateNormals",
        "--optimizeForCesium",
        "--checkTransparency",
        "--secure",
        "--metallicRoughness"
    ], check=True)
    print(f"Successfully converted using obj2gltf fallback")
