export function parseInput(input) {
    const tagStart = input.indexOf('#');
    if (tagStart >= 0) {
        return {
            title: input.slice(0, tagStart - 1),
            tags: input.slice(tagStart + 1).split(' #')
        };
    }
    return {
        title: input,
        tags: []
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
        tags: activity.tags
    });
}

export function apiSave(activity) {
    const isNew = typeof activity.id === 'undefined';
    return fetch('/api/activities' + (isNew ? '' : '/' + activity.id), {
        method: isNew ? 'POST' : 'PUT',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: serialize(activity),
    })
        .then(response => response.json())
        .then(unserialize);
}
