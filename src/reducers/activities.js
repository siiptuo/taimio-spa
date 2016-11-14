import { keyBy, omit } from 'lodash';

export default function activities(state = {
    ranges: {},
    activities: {},
}, action) {
    switch (action.type) {
        case 'RECEIVE_ACTIVITY':
            return {
                ...state,
                activities: {
                    ...state.activities,
                    [action.activity.id]: action.activity,
                },
            };
        case 'RECEIVE_ACTIVITIES':
            return {
                ...state,
                activities: {
                    ...state.activities,
                    ...keyBy(action.activities, 'id'),
                },
                ranges: {
                    ...state.ranges,
                    [`${action.startDate}-${action.endDate}`]: true,
                },
            };
        case 'START_ACTIVITY_SUCCESS':
        case 'UPDATE_ACTIVITY_SUCCESS':
        case 'RESUME_ACTIVITY_SUCCESS':
        case 'STOP_ACTIVITY_SUCCESS':
            return {
                ...state,
                activities: {
                    ...state.activities,
                    [action.activity.id]: action.activity,
                },
            };
        case 'REMOVE_ACTIVITY_SUCCESS':
            return {
                ...state,
                activities: omit(state.activities, action.id),
            };
        default:
            return state;
    }
}
