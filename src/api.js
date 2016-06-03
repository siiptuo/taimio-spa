import * as auth from './auth';

function checkStatus(response) {
    if (response.status < 200 || response.status >= 300) {
        const error = new Error(response.statusText);
        error.response = response;
        throw error;
    }
    return response;
}

function parseJSON(response) {
    return response.json();
}

const API_ROOT = process.env.NODE_ENV === 'production' ? 'http://api.taim.io' : 'http://api.taimio.dev';

export function getRequest(url) {
    return fetch(`${API_ROOT}/${url}`, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${auth.getToken()}`,
        }
    })
        .then(checkStatus)
        .then(parseJSON);
};

export function postRequest(url, data) {
    return fetch(`${API_ROOT}/${url}`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${auth.getToken()}`,
        },
        body: data,
    })
        .then(checkStatus)
        .then(parseJSON);
};

export function putRequest(url, data) {
    return fetch(`${API_ROOT}/${url}`, {
        method: 'PUT',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${auth.getToken()}`,
        },
        body: data,
    })
        .then(checkStatus)
        .then(parseJSON);
};

export function deleteRequest(url) {
    return fetch(`${API_ROOT}/${url}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${auth.getToken()}`,
        },
    })
        .then(checkStatus)
        .then(parseJSON);
};
