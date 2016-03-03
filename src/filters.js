function pad2(value) {
    return (value < 10 ? '0' : '') + value;
}

export function time(value) {
    if (!(value instanceof Date)) {
        return '';
    }
    return pad2(value.getHours()) + ':' + pad2(value.getMinutes());
}

export function date(value) {
    if (!(value instanceof Date)) {
        return '';
    }
    return pad2(value.getFullYear()) + '-' + pad2(value.getMonth() + 1) + '-' + pad2(value.getDate());
}

export function localDateTime(value) {
    if (!(value instanceof Date)) {
        return '';
    }
    return pad2(value.getFullYear()) + '-' + pad2(value.getMonth() + 1) + '-' + pad2(value.getDate()) +
        'T' + pad2(value.getHours()) + ':' + pad2(value.getMinutes()) + ':' + pad2(value.getSeconds());
}

export function duration(start, end) {
    let diff = start;
    if (start instanceof Date) {
        if (!(end instanceof Date)) {
            end = new Date();
        }
        diff = end.getTime() - start.getTime();
    } else if (typeof start !== 'number') {
        throw new Error('start must be Date or Number');
    }
    const secs = Math.floor(diff / 1000);
    const hours = Math.floor(secs / (60 * 60));
    const mins = Math.floor(secs / 60) - hours * 60;
    if (hours === 0) {
        return mins === 0 ? 'just now' : `${mins}min`;
    } else {
        return `${hours}h` + (mins !== 0 ? ` ${mins}min` : '');
    }
}
