<template>
    <current-activity :activity="currentActivity" @stop="stopActivity"></current-activity>
    <activity-switcher @start="startActivity"></activity-switcher>
    <activity-summary v-for="day in days" :day="day" @click-activity="clickActivity"></activity-summary>
</template>

<script>
import CurrentActivity from './current-activity.vue';
import ActivitySwitcher from './activity-switcher.vue';
import ActivitySummary from './activity-summary.vue';

import * as activity from '../activity';

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

export default {
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
            this.$router.go({name: 'editActivity', params: {id: newActivity.id}});
        }
    },
    components: {
        CurrentActivity,
        ActivitySwitcher,
        ActivitySummary
    }
};
</script>
