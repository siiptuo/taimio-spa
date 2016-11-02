import { keyBy } from 'lodash';

export default function activities(state = {
    ranges: {},
    activities: {},
}, action) {
    switch (action.type) {
        case 'RECEIVE_ACTIVITY':
            return Object.assign({}, state, {
                activities: Object.assign({}, state.activities, {
                    [action.activity.id]: action.activity,
                }),
            });
        case 'RECEIVE_ACTIVITIES':
            return Object.assign({}, state, {
                activities: Object.assign({}, state.activities, keyBy(action.activities, 'id')),
                ranges: Object.assign({}, state.ranges, {
                    [`${action.startDate}-${action.endDate}`]: true,
                }),
            });
        case 'START_ACTIVITY_SUCCESS':
        case 'UPDATE_ACTIVITY_SUCCESS':
        case 'RESUME_ACTIVITY_SUCCESS':
        case 'STOP_ACTIVITY_SUCCESS':
            return Object.assign({}, state, {
                activities: Object.assign({}, state.activities, {
                    [action.activity.id]: action.activity,
                }),
            });
        case 'REMOVE_ACTIVITY_SUCCESS':
            const activities = Object.assign({}, state.activities);
            delete activities[action.id];
            return Object.assign({}, state, { activities });
        default:
            return state;
    }
}
