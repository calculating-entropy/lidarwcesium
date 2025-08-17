import open3d as o3d
import numpy as np
import os

def detect_planes(pc, min_inliers=5000, distance_threshold=0.01, ransac_n=3, num_iterations=1000):
    planes = []
    rest = pc
    while True:
        try:
            plane_model, inliers = rest.segment_plane(
                distance_threshold=distance_threshold,
                ransac_n=ransac_n,
                num_iterations=num_iterations
            )
        except RuntimeError:
            break
        if len(inliers) < min_inliers:
            break
        pc_inliers = rest.select_by_index(inliers)
        planes.append({"params": plane_model, "points": pc_inliers})
        rest = rest.select_by_index(inliers, invert=True)
    return planes

def measure_vertical_extents(planes):
    # Filter to nearly-horizontal planes only (normal's y-component is close to 1 or -1)
    # A normal of (0, 1, 0) is a floor pointing up.
    # A normal of (0,-1, 0) is a ceiling pointing down.
    horizontals = [p for p in planes if abs(p["params"][1]) > 0.95] # Using a stricter threshold

    if len(horizontals) < 2:
        return None, "Could not find at least two horizontal planes (floor and ceiling)."

    horizontals_sorted = sorted(horizontals, key=lambda p: p["params"][3])

    lowest_plane_params = horizontals_sorted[0]["params"]
    highest_plane_params = horizontals_sorted[-1]["params"]

    # The distance between two parallel planes Ax+By+Cz+D=0 is |D2 - D1| / sqrt(A^2+B^2+C^2)
    # Open3D's segment_plane returns a normalized normal vector, so sqrt(A^2+B^2+C^2) is 1.
    distance = abs(highest_plane_params[3] - lowest_plane_params[3])

    return distance, None

def measure_obj(obj_filename):
    """
    Loads an OBJ file from ../data/raw_objs/, samples point cloud, detects planes,
    and returns the floor-to-ceiling distance.
    """
    obj_dir = os.path.join(os.path.dirname(__file__), "../data/raw_objs")
    obj_path = os.path.normpath(os.path.join(obj_dir, obj_filename))

    if not os.path.exists(obj_path):
        return {"error": f"OBJ file not found at {obj_path}"}

    try:
        mesh = o3d.io.read_triangle_mesh(obj_path)
        if mesh.is_empty():
            return {"error": "Failed to load mesh or mesh is empty"}

        mesh.compute_vertex_normals()
        pc = mesh.sample_points_uniformly(number_of_points=100_000)

        planes = detect_planes(pc)
        distance, error = measure_vertical_extents(planes)

        if error:
            return {"error": error}

        return {
            "filename": obj_filename,
            "ceiling_to_floor_distance_m": distance
        }
    except Exception as e:
        return {"error": str(e)}
