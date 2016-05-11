import { getRequest, postRequest, putRequest, deleteRequest } from './api';

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

function fixedEncodeURIComponent(str) {
    return encodeURIComponent(str).replace(/[!'()*]/g, function(c) {
        return '%' + c.charCodeAt(0).toString(16);
    });
}

function createQueryParams(params) {
    if (!params || Object.keys(params).length === 0) {
        return '';
    }
    const pairs = [];
    for (let key in params) {
        pairs.push(key + '=' + fixedEncodeURIComponent(params[key]));
    }
    return '?' + pairs.join('&');
}

export function apiList(params) {
    return getRequest('activities' + createQueryParams(params))
        .then(data => data.map(unserialize));
}

export function apiGet(id) {
    return getRequest(`activities/${id}`)
        .then(unserialize);
}

export function apiSave(activity) {
    const isNew = typeof activity.id === 'undefined';
    if (isNew) {
        return postRequest('activities', serialize(activity))
            .then(unserialize);
    } else {
        return putRequest(`activities/${activity.id}`, serialize(activity))
            .then(unserialize);
    }
}

export function apiRemove(activity) {
    return deleteRequest(`activities/${activity.id}`);
}
