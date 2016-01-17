import Vue from 'vue';

function pad2(value) {
    return (value < 10 ? '0' : '') + value;
}

Vue.filter('time', value => {
    if (!(value instanceof Date)) {
        return value;
    }
    return pad2(value.getHours()) + ':' + pad2(value.getMinutes());
});

Vue.filter('date', value => {
    if (!(value instanceof Date)) {
        return value;
    }
    return pad2(value.getFullYear()) + '-' + pad2(value.getMonth() + 1) + '-' + pad2(value.getDate());
});

Vue.filter('duration', (start, end) => {
    if (!(end instanceof Date)) {
        end = new Date();
    }
    start = start.getTime();
    end = end.getTime();
    const secs = Math.floor((end - start) / 1000);
    const hours = Math.floor(secs / (60 * 60));
    const mins = Math.floor(secs / 60) - hours * 60;
    if (hours === 0) {
        return mins === 0 ? secs % 60 + 's' : mins + 'min';
    } else {
        return hours + 'h ' + mins + 'min';
    }
});

function init(data) {
    let currentActivity = null;
    data.forEach(day => {
        day.activities.forEach(activity => {
            if (activity.finished_at === null) {
                currentActivity = activity;
            }
        });
    });
    new Vue({
        el: '#app',
        data: {
            days: data,
            currentActivity
        },
    });
}

function unserializeActivity(data) {
    data.started_at = new Date(data.started_at);
    if (data.finished_at !== null) {
        data.finished_at = new Date(data.finished_at);
    }
    return data;
}

const millisecondsInDay = 1000 * 60 * 60 * 24;

function groupActivitiesByDate(data) {
    const dateActivityMap = data.reduce((obj, d) => {
        const key = Math.floor(d.started_at.getTime() / millisecondsInDay);
        if (typeof obj[key] !== 'undefined') {
            obj[key].push(d);
        } else {
            obj[key] = [d];
        }
        return obj;
    }, {});
    const days = [];
    for (let date in dateActivityMap) {
        days.push({
            date: new Date(date * millisecondsInDay),
            activities: dateActivityMap[date]
        });
    }
    return days;
}

fetch('api/activities')
    .then(response => response.json())
    .then(data => data.map(unserializeActivity))
    .then(groupActivitiesByDate)
    .then(init);
