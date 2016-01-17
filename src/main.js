import Vue from 'vue';
import * as filters from './filters';

Vue.filter('time', filters.time);
Vue.filter('date', filters.date);
Vue.filter('duration', filters.duration);

function parseActivityInput(input) {
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

function apiSaveActivity(activity) {
    const isNew = typeof activity.id === 'undefined';
    return fetch('/api/activities' + (isNew ? '' : '/' + activity.id), {
        method: isNew ? 'POST' : 'PUT',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: serializeActivity(activity),
    })
        .then(response => response.json())
        .then(unserializeActivity);
}

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
            currentActivity,
            newActivityInput: '',
        },
        methods: {
            startActivity() {
                const parsedInput = parseActivityInput(this.newActivityInput);
                const newActivity = {
                    title: parsedInput.title,
                    tags: parsedInput.tags,
                    started_at: new Date(),
                    finished_at: null,
                };
                if (this.currentActivity) {
                    this.currentActivity.finished_at = new Date();
                    apiSaveActivity(this.currentActivity)
                        .then(() => { this.currentActivity = null; })
                        .then(() => apiSaveActivity(newActivity))
                        .then(activity => {
                            this.days[0].activities.unshift(activity);
                            this.currentActivity = activity;
                        });
                } else {
                    apiSaveActivity(newActivity)
                        .then(activity => {
                            this.days[0].activities.unshift(activity);
                            this.currentActivity = activity;
                        });
                }
            },
            stopActivity() {
                this.currentActivity.finished_at = new Date();
                apiSaveActivity(this.currentActivity)
                    .then(() => { this.currentActivity = null; });
            }
        }
    });
}

function unserializeActivity(data) {
    data.started_at = new Date(data.started_at);
    if (data.finished_at !== null) {
        data.finished_at = new Date(data.finished_at);
    }
    return data;
}

function serializeActivity(activity) {
    return JSON.stringify({
        id: activity.id,
        started_at: activity.started_at.toISOString(),
        finished_at: activity.finished_at ? activity.finished_at.toISOString() : null,
        title: activity.title,
        tags: activity.tags
    });
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
