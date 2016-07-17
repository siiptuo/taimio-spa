import { apiList, apiSave, apiRemove } from '../activity';

export function requestActivities() {
    return {
        type: 'REQUEST_ACTIVITIES',
    };
}

export function receiveActivities(activities) {
    return {
        type: 'RECEIVE_ACTIVITIES',
        activities,
    };
}

function fetchActivities() {
    return (dispatch) => {
        dispatch(requestActivities());
        return apiList().then(activities => dispatch(receiveActivities(activities)));
    };
}

function shouldFetchActivities(state) {
    return !state.activities.isFetching && !state.activities.fetchDone;
}

export function fetchActivitiesIfNeeded() {
    return (dispatch, getState) => {
        if (shouldFetchActivities(getState())) {
            return dispatch(fetchActivities());
        } else {
            return Promise.resolve();
        }
    }
}

function getCurrentActivity() {
    return (dispatch, getState) => {
        return dispatch(fetchActivitiesIfNeeded())
            .then(() => {
                const activities = getState().activities.activities;
                return activities.find(activity => activity.finished_at == null);
            });
    };
}

export function fetchActivity(id) {
    return (dispatch, getState) => {
        return dispatch(fetchActivitiesIfNeeded())
            .then(() => {
                const activities = getState().activities.activities;
                return activities.find(activity => activity.id == id);
            });
    };
}

function updateActivitySuccess(activity) {
    return {
        type: 'UPDATE_ACTIVITY_SUCCESS',
        data: activity,
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

function stopActivitySuccess(activity) {
    return {
        type: 'STOP_ACTIVITY_SUCCESS',
        data: activity,
    };
}

export function stopActivity(id, finishedAt = new Date()) {
    return (dispatch, getState) => {
        dispatch({ type: 'REQUEST_STOP_ACTIVITY', id });
        const activities = getState().activities.activities;
        const oldActivity = activities.find(activity => activity.id === id);
        const newActivity = Object.assign({}, oldActivity, { finished_at: finishedAt });
        return apiSave(newActivity).then((activity) => dispatch(stopActivitySuccess(activity)));
    };
}

function stopCurrentActivity(finishedAt = new Date()) {
    return (dispatch) => {
        return dispatch(getCurrentActivity()).then((activity) => {
            if (!activity) {
                return null;
            }
            return dispatch(stopActivity(activity.id, finishedAt));
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

        const activities = getState().activities.activities;
        const oldActivity = activities.find(activity => activity.id === id);
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
