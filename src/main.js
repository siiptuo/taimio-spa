import Vue from 'vue';
import VueRouter from 'vue-router';
import * as filters from './filters';
import * as activity from './activity';

function parseLocalDate(input) {
    return new Date(input.replace(/-/g, '/').replace('T', ' '));
}

Vue.use(VueRouter);

Vue.filter('time', filters.time);
Vue.filter('date', filters.date);
Vue.filter('duration', filters.duration);

Vue.component('activities-summary', {
    props: ['day'],
    computed: {
        totalDuration() {
            return this.day.activities.reduce((sum, activity) => {
                const end = activity.finished_at || new Date();
                return sum + end.getTime() - activity.started_at.getTime();
            }, 0);
        }
    },
    template: '#activities-summary-template',
    methods: {
        clickActivity(activity) {
            this.$dispatch('click-activity', activity);
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

const main = {
    data() {
        fetch('api/activities')
            .then(response => response.json())
            .then(data => data.map(activity.unserialize))
            .then(data => {
                this.currentActivity = data.find((d) => d.finished_at === null);
                return data;
            })
            .then(groupActivitiesByDate)
            .then(data => {
                this.days = data;
            });
        return {
            days: [],
            currentActivity: null
        };
    },
    template: '#main-template',
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
            router.go({name: 'editActivity', params: {id: newActivity.id}});
        }
    }
};

const activityEditor = {
    template: '#activity-editor-template',
    data() {
        activity.apiGet(this.$route.params.id)
            .then(activity => {
                this.activity = activity;
                this.started_at = filters.localDateTime(this.activity.started_at),
                this.finished_at = this.activity.finished_at !== null ? filters.localDateTime(this.activity.finished_at) : null,
                this.ongoing = this.activity.finished_at === null,
                this.input = this.activity.title + (this.activity.tags.length > 0 ? ' #' + this.activity.tags.join(' #') : '')
            });
        return {
            activity: null,
            started_at: '',
            finished_at: '',
            ongoing: false,
            input: ''
        };
    },
    methods: {
        save() {
            const parsedInput = activity.parseInput(this.input);
            this.activity.title = parsedInput.title;
            this.activity.tags = parsedInput.tags;
            this.activity.started_at = parseLocalDate(this.started_at);
            this.activity.finished_at = this.ongoing ? null : parseLocalDate(this.finished_at);

            activity.apiSave(this.activity)
                .then(() => {
                    router.go({name: 'main'});
               });
        },
        cancel() {
            router.go({name: 'main'});
        }
    }
};

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
    return days.sort((a, b) => b.date.getTime() - a.date.getTime());
}

const router = new VueRouter();
router.map({
    '/': {
        name: 'main',
        component: main
    },
    '/activity/:id': {
        name: 'editActivity',
        component: activityEditor
    }
});

router.start({}, '#app');
