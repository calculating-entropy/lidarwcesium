export const API_URL = 'http://localhost:8000';

export async function listObjs() {
    const res = await fetch(`${API_URL}/list_objs/`);
    return res.json();
}

export async function uploadObj(file) {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_URL}/upload_obj/`, {
        method: 'POST',
        body: formData,
    });
    return res.json();
}

export async function getMeasurements(filename) {
    const res = await fetch(`${API_URL}/measure/${filename}`);
    return res.json();
}

export async function listAssets() {
    const res = await fetch(`${API_URL}/assets/`);
    return res.json();
}
