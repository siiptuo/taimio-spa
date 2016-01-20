<template>
    <form @submit.prevent="stop" class="current-activity-display">
        <h1 v-if="activity">
            {{ activity.title }}
            <ul class="tag-list">
                <li v-for="tag in activity.tags">{{ tag }}</li>
            </ul>
            {{ activity.started_at | duration }}
        </h1>
        <h1 v-else>No activity</h1>
        <button type="submit" :disabled="activity === null">Stop</button>
    </form>
</template>

<script>
export default {
    props: ['activity'],
    methods: {
        stop() {
            this.$dispatch('stop');
        }
    }
};
</script>
