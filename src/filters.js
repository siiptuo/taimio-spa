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

export function duration(start, end) {
    if (!(end instanceof Date)) {
        end = new Date();
    }
    start = start.getTime();
    end = end.getTime();
    const secs = Math.floor((end - start) / 1000);
    const hours = Math.floor(secs / (60 * 60));
    const mins = Math.floor(secs / 60) - hours * 60;
    if (hours === 0) {
        return mins === 0 ? `${secs % 60}s` : `${mins}min`;
    } else {
        return `${hours}h` + (mins !== 0 ? ` ${mins}min` : '');
    }
}
