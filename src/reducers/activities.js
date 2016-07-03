function activity(state, action) {
    switch (action.type) {
        case 'REQUEST_UPDATE_ACTIVITY':
            if (state.id !== action.id) {
                return state;
            }
            return Object.assign({}, state, { status: 'LOADING' });
        case 'UPDATE_ACTIVITY_SUCCESS':
        case 'STOP_ACTIVITY_SUCCESS':
            if (state.id !== action.data.id) {
                return state;
            }
            return Object.assign({}, state, action.data, { status: 'SUCCESS' });
        default:
            return state;
    }
}

export default function activities(state = {
    isFetching: false,
    fetchDone: false,
    activities: [],
}, action) {
    switch (action.type) {
        case 'REQUEST_ACTIVITIES':
            return Object.assign({}, state, {
                isFetching: true,
                fetchDone: false,
            });
        case 'RECEIVE_ACTIVITIES':
            return Object.assign({}, state, {
                isFetching: false,
                fetchDone: true,
                activities: action.activities,
            });
        case 'UPDATE_ACTIVITY_SUCCESS':
        case 'STOP_ACTIVITY_SUCCESS':
            return Object.assign({}, state, {
                activities: state.activities.map(a => activity(a, action)),
            });
        case 'REMOVE_ACTIVITY_SUCCESS':
            return Object.assign({}, state, {
                activities: state.activities.filter(a => a.id != action.id),
            });
        case 'START_ACTIVITY_SUCCESS':
        case 'RESUME_ACTIVITY_SUCCESS':
            return Object.assign({}, state, {
                activities: [
                    action.activity,
                    ...state.activities,
                ],
            });
        default:
            return state;
    }
}
