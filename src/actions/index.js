import { apiGet, apiList, apiSave, apiRemove, apiGetCurrent } from '../activity';

export function requestActivities(startDate, endDate) {
    return {
        type: 'REQUEST_ACTIVITIES',
        startDate,
        endDate,
    };
}

export function receiveActivities(startDate, endDate, activities) {
    return {
        type: 'RECEIVE_ACTIVITIES',
        startDate,
        endDate,
        activities,
    };
}

export function fetchActivities(startDate, endDate) {
    return (dispatch, getState) => {
        if (getState().activities.ranges[`${startDate}-${endDate}`]) {
            return Promise.resolve();
        }
        dispatch(requestActivities(startDate, endDate));
        return apiList({ start_date: startDate, end_date: endDate })
            .then(activities => dispatch(receiveActivities(startDate, endDate, activities)));
    };
}

function requestActivity(id) {
    return {
        type: 'REQUEST_ACTIVITY',
        id,
    };
}

function receiveActivity(activity) {
    return {
        type: 'RECEIVE_ACTIVITY',
        activity,
    };
}

export function fetchActivity(id) {
    return (dispatch, getState) => {
        if (getState().activities.activities[id]) {
            return Promise.resolve();
        }
        dispatch(requestActivity(id));
        return apiGet(id)
            .then(activity => dispatch(receiveActivity(activity)));
    };
}

export function fetchCurrentActivity() {
    return dispatch => {
        return apiGetCurrent()
            .then((activity) => {
                if (activity) {
                    dispatch(receiveActivity(activity));
                }
            });
    };
}

function updateActivitySuccess(activity) {
    return {
        type: 'UPDATE_ACTIVITY_SUCCESS',
        activity,
    };
}

export function updateActivity(activity) {
    return (dispatch) => {
        dispatch({ type: 'REQUEST_UPDATE_ACTIVITY', id: activity.id });
        return apiSave(activity).then(activity => dispatch(updateActivitySuccess(activity)));
    };
}

function startActivitySuccess(activity) {
    return {
        type: 'START_ACTIVITY_SUCCESS',
        activity,
    };
}

function stopActivitySuccess(activity) {
    return {
        type: 'STOP_ACTIVITY_SUCCESS',
        activity,
    };
}

export function stopActivity(id, finishedAt = new Date()) {
    return (dispatch, getState) => {
        dispatch({ type: 'REQUEST_STOP_ACTIVITY', id });
        const oldActivity = getState().activities.activities[id];
        const newActivity = Object.assign({}, oldActivity, { finished_at: finishedAt });
        return apiSave(newActivity)
            .then((activity) => { dispatch(stopActivitySuccess(activity)); });
    };
}

function stopCurrentActivity(finishedAt = new Date()) {
    return (dispatch, getState) => {
        return dispatch(fetchCurrentActivity()).then(() => {
            const currentActivity = Object.values(getState().activities.activities)
                .find(activity => !activity.finished_at);
            if (!currentActivity) {
                return null;
            }
            return dispatch(stopActivity(currentActivity.id, finishedAt));
        });
    };
}

export function startActivity(title, tags, startedAt = new Date()) {
    return (dispatch) => {
        dispatch({ type: 'REQUEST_START_ACTIVITY' });
        const newActivity = {
            title,
            tags,
            started_at: startedAt,
        };
        return Promise.all([
            dispatch(stopCurrentActivity(startedAt)),
            apiSave(newActivity),
        ]).then(([oldActivity, newActivity]) => {
            dispatch(startActivitySuccess(newActivity));
        });
    };
}

function removeActivitySuccess(id) {
    return {
        type: 'REMOVE_ACTIVITY_SUCCESS',
        id,
    };
}

export function removeActivity(id) {
    return (dispatch) => {
        dispatch({ type: 'REQUEST_REMOVE_ACTIVITY', id });
        return apiRemove(id).then(() => dispatch(removeActivitySuccess(id)));
    };
}

function resumeActivitySuccess(activity) {
    return {
        type: 'RESUME_ACTIVITY_SUCCESS',
        activity,
    };
}

export function resumeActivity(id, startedAt = new Date()) {
    return (dispatch, getState) => {
        dispatch({ type: 'REQUEST_RESUME_ACTIVITY', id });

        const oldActivity = getState().activities.activities[id];
        const newActivity = Object.assign({}, oldActivity, {
            started_at: startedAt,
            finished_at: null,
        });
        delete newActivity.id;

        return Promise.all([
            dispatch(stopCurrentActivity(startedAt)),
            apiSave(newActivity),
        ]).then(([oldActivity, newActivity]) => {
            dispatch(resumeActivitySuccess(newActivity));
        });
    };
}
