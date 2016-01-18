import Vue from 'vue';
import * as filters from './filters';
import * as activity from './activity';

Vue.filter('time', filters.time);
Vue.filter('date', filters.date);
Vue.filter('duration', filters.duration);

Vue.component('activities-summary', {
    props: ['day'],
    template: '#activities-summary-template',
    methods: {
        clickActivity(activity) {
            this.$dispatch('click-activity', activity);
        }
    }
});

Vue.component('activity-editor', {
    props: ['activity'],
    template: '#activity-editor-template',
    data() {
        return {
            started_at: this.activity.started_at.toISOString(),
            finished_at: this.activity.finished_at !== null ? this.activity.finished_at.toISOString() : null,
            ongoing: this.activity.finished_at === null,
            input: this.activity.title + (this.activity.tags.length > 0 ? ' #' + this.activity.tags.join(' #') : '')
        };
    },
    methods: {
        save() {
            const parsedInput = activity.parseInput(this.input);
            this.activity.title = parsedInput.title;
            this.activity.tags = parsedInput.tags;
            this.activity.started_at = new Date(this.started_at);
            this.activity.finished_at = this.ongoing ? null : new Date(this.finished_at);
            this.$dispatch('save', this.activity);
        },
        cancel() {
            this.$dispatch('cancel');
        }
    }
});

Vue.component('current-activity', {
    props: ['activity'],
    template: '#current-activity-template',
    methods: {
        stop() {
            this.$dispatch('stop');
        }
    }
});

Vue.component('activity-switcher', {
    data() {
        return {
            input: ''
        };
    },
    template: '#activity-switcher-template',
    methods: {
        start() {
            const parsedInput = activity.parseInput(this.input);
            this.$dispatch('start', {
                title: parsedInput.title,
                tags: parsedInput.tags,
                started_at: new Date(),
                finished_at: null,
            });
            this.input = '';
        }
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
            currentActivity,
            editActivity: null
        },
        methods: {
            startActivity(newActivity) {
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
            clickActivity(newActivity) {
                this.editActivity = newActivity;
            },
            cancelActivity() {
                this.editActivity = null;
            },
            saveActivity(newActivity) {
                activity.apiSave(newActivity)
                    .then(() => {
                        if (newActivity.finished_at === null) {
                            this.currentActivity = newActivity;
                        }
                        this.editActivity = null;
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
