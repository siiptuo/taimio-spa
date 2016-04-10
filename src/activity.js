export function parseInput(input) {
    input = input.trim();
    const tagStart = input.indexOf('#');
    if (tagStart >= 0) {
        return {
            title: input.slice(0, tagStart).trim(),
            tags: input.slice(tagStart + 1).split(/\s*#/),
        };
    }
    return {
        title: input,
        tags: [],
    };
}

export function unserialize(data) {
    data.started_at = new Date(data.started_at);
    if (data.finished_at !== null) {
        data.finished_at = new Date(data.finished_at);
    }
    return data;
}

export function serialize(activity) {
    return JSON.stringify({
        id: activity.id,
        started_at: activity.started_at.toISOString(),
        finished_at: activity.finished_at ? activity.finished_at.toISOString() : null,
        title: activity.title,
        tags: activity.tags,
    });
}

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

const API_ROOT = 'http://api.tiima.dev';

export function apiList() {
    return fetch(`${API_ROOT}/activities`)
        .then(checkStatus)
        .then(parseJSON)
        .then(data => data.map(unserialize));
}

export function apiGet(id) {
    return fetch(`${API_ROOT}/activities/${id}`)
        .then(checkStatus)
        .then(parseJSON)
        .then(unserialize);
}

export function apiSave(activity) {
    const isNew = typeof activity.id === 'undefined';
    return fetch(`${API_ROOT}/activities${isNew ? '' : `/${activity.id}`}`, {
        method: isNew ? 'POST' : 'PUT',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
        body: serialize(activity),
    })
        .then(checkStatus)
        .then(parseJSON)
        .then(unserialize);
}

export function apiRemove(activity) {
    return fetch(`${API_ROOT}/activities/${activity.id}`, {
        method: 'DELETE',
    })
        .then(checkStatus);
}
