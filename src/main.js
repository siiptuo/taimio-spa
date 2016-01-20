import Vue from 'vue';
import VueRouter from 'vue-router';
import * as filters from './filters';
import * as activity from './activity';
import main from './components/main.vue';
import activityEditor from './components/activity-editor.vue';

Vue.use(VueRouter);

Vue.filter('time', filters.time);
Vue.filter('date', filters.date);
Vue.filter('duration', filters.duration);

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
