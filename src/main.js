import Vue from 'vue';
import * as filters from './filters';
import * as activity from './activity';

Vue.filter('time', filters.time);
Vue.filter('date', filters.date);
Vue.filter('duration', filters.duration);

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
            editActivityData: null
        },
        methods: {
            startActivity() {
                const parsedInput = activity.parseInput(this.newActivityInput);
                const newActivity = {
                    title: parsedInput.title,
                    tags: parsedInput.tags,
                    started_at: new Date(),
                    finished_at: null,
                };
                if (this.currentActivity) {
                    this.currentActivity.finished_at = new Date();
                    activity.apiSave(this.currentActivity)
                        .then(() => { this.currentActivity = null; })
                        .then(() => activity.apiSave(newActivity))
                        .then(activity => {
                            this.days[0].activities.unshift(activity);
                            this.currentActivity = activity;
                        });
                } else {
                    activity.apiSave(newActivity)
                        .then(activity => {
                            this.days[0].activities.unshift(activity);
                            this.currentActivity = activity;
                        });
                }
            },
            stopActivity() {
                this.currentActivity.finished_at = new Date();
                activity.apiSave(this.currentActivity)
                    .then(() => { this.currentActivity = null; });
            },
            showEditActivity(activity) {
                this.editActivityData = {
                    activity,
                    started_at: activity.started_at.toISOString(),
                    finished_at: activity.finished_at.toISOString(),
                    ongoing: false,
                    input: activity.title + (activity.tags.length > 0 ? ' #' + activity.tags.join(' #') : '')
                };
            },
            cancelEditActivity() {
                this.editActivityData = null;
            },
            editActivity() {
                const parsedInput = activity.parseInput(this.editActivityData.input);
                const newActivity = this.editActivityData.activity;
                newActivity.title = parsedInput.title;
                newActivity.tags = parsedInput.tags;
                newActivity.started_at = new Date(this.editActivityData.started_at);
                newActivity.finished_at = this.editActivityData.ongoing ? null : new Date(this.editActivityData.finished_at);
                activity.apiSave(newActivity)
                    .then(() => {
                        if (newActivity.finished_at === null) {
                            this.currentActivity = newActivity;
                        }
                        this.editActivityData = null;
                    });
            }
        }
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
    .then(data => data.map(activity.unserialize))
    .then(groupActivitiesByDate)
    .then(init);
