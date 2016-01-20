<template>
    <form @submit.prevent="start" class="start-activity-form">
        <input type="text" placeholder="New activity..." v-model="input">
        <button type="submit">Start</button>
    </form>
</template>

<script>
import * as activity from '../activity';

export default {
    data() {
        return {
            input: ''
        };
    },
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
};
</script>
