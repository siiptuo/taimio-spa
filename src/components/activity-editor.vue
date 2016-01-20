<template>
    <form @submit.prevent="save">
        <label>
            Start time:
            <input type="datetime-local" v-model="started_at" step="1">
        </label>
        <label>
            End time:
            <input type="datetime-local" v-model="finished_at" :disabled="ongoing" step="1">
        </label>
        <label>
            <input type="checkbox" v-model="ongoing">
            Ongoing
        </label>
        <label>
            Content:
            <input type="text" v-model="input">
        </label>
        <button @click.prevent="cancel">Cancel</button>
        <button type="submit">Save</button>
    </form>
</template>

<script>
import * as activity from '../activity';
import * as filters from '../filters';

function parseLocalDate(input) {
    return new Date(input.replace(/-/g, '/').replace('T', ' '));
}

export default {
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
                    this.$router.go({name: 'main'});
               });
        },
        cancel() {
            this.$router.go({name: 'main'});
        }
    }
};
</script>
