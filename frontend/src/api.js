import config from './config';

export const API_URL = config.apiUrl;

// Helper function for handling API responses
async function handleResponse(response) {
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Unknown error occurred' }));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }
    return response.json();
}

export async function listObjs() {
    try {
        const res = await fetch(`${API_URL}/list_objs/`);
        return await handleResponse(res);
    } catch (error) {
        console.error('Error listing objects:', error);
        throw new Error(`Failed to fetch objects: ${error.message}`);
    }
}

export async function uploadObj(file, latitude = null, longitude = null) {
    try {
        if (!file) {
            throw new Error('No file provided');
        }
        
        if (!file.name.endsWith('.obj')) {
            throw new Error('Only .obj files are allowed');
        }
        
        const formData = new FormData();
        formData.append('file', file);
        
        if (latitude !== null) {
            formData.append('latitude', latitude.toString());
        }
        if (longitude !== null) {
            formData.append('longitude', longitude.toString());
        }
        
        const res = await fetch(`${API_URL}/upload_obj/`, {
            method: 'POST',
            body: formData,
        });
        
        return await handleResponse(res);
    } catch (error) {
        console.error('Error uploading object:', error);
        throw new Error(`Failed to upload file: ${error.message}`);
    }
}

export async function getMeasurements(filename) {
    try {
        if (!filename) {
            throw new Error('Filename is required');
        }
        
        const res = await fetch(`${API_URL}/measure/${encodeURIComponent(filename)}`);
        return await handleResponse(res);
    } catch (error) {
        console.error('Error getting measurements:', error);
        throw new Error(`Failed to get measurements: ${error.message}`);
    }
}

export async function listAssets() {
    try {
        const res = await fetch(`${API_URL}/assets/`);
        return await handleResponse(res);
    } catch (error) {
        console.error('Error listing assets:', error);
        throw new Error(`Failed to fetch assets: ${error.message}`);
    }
}
