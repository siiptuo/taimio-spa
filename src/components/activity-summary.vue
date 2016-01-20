<template>
    <h3>
        {{ day.date | date }}
        <span class="activity-summary-total-duration">{{ totalDuration  | duration }}</span>
    </h3>
    <table class="activity-list">
        <tr v-for="activity in day.activities" @click="clickActivity(activity)">
            <td class="activity-list-time-column">{{ activity.started_at | time }}</a>
            <td class="activity-list-time-column">-</a>
            <td class="activity-list-time-column">{{ activity.finished_at | time }}</a>
            <td class="activity-list-title-column">
                {{ activity.title }}
                <ul class="tag-list">
                    <li v-for="tag in activity.tags">{{ tag }}</li>
                </ul>
            </td>
            <td class="activity-list-duration-column">{{ activity.started_at | duration activity.finished_at }}</td>
        </tr>
    </table>
</template>

<script>
export default {
    props: ['day'],
    computed: {
        totalDuration() {
            return this.day.activities.reduce((sum, activity) => {
                const end = activity.finished_at || new Date();
                return sum + end.getTime() - activity.started_at.getTime();
            }, 0);
        }
    },
    methods: {
        clickActivity(activity) {
            this.$dispatch('click-activity', activity);
        }
    }
};
</script>
