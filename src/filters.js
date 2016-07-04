function pad2(value) {
    return (value < 10 ? '0' : '') + value;
}

export function time(value) {
    if (!(value instanceof Date)) {
        return '';
    }
    return `${pad2(value.getHours())}:${pad2(value.getMinutes())}`;
}

export function date(value) {
    if (!(value instanceof Date)) {
        return '';
    }
    const year = pad2(value.getFullYear());
    const month = pad2(value.getMonth() + 1);
    const date = pad2(value.getDate());
    return `${year}-${month}-${date}`;
}

export function localDateTime(value) {
    if (!(value instanceof Date)) {
        return '';
    }
    const year = pad2(value.getFullYear());
    const month = pad2(value.getMonth() + 1);
    const date = pad2(value.getDate());
    const hours = pad2(value.getHours());
    const minutes = pad2(value.getMinutes());
    const seconds = pad2(value.getSeconds());
    return `${year}-${month}-${date}T${hours}:${minutes}:${seconds}`;
}

export function duration(start, end, realTime = false) {
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
        if (mins === 0) {
            return realTime ? 'just now' : `${secs}s`;
        }
        return `${mins}min`;
    }
    return `${hours}h${mins !== 0 ? ` ${mins}min` : ''}`;
}
