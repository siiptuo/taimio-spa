import { keyBy, omit } from 'lodash';

export default function activities(
  state = {
    ranges: {},
    activities: {},
    current: undefined,
  },
  action,
) {
  switch (action.type) {
    case 'RECEIVE_ACTIVITY': {
      const newState = {
        ...state,
        activities: {
          ...state.activities,
          [action.activity.id]: action.activity,
        },
      };
      if (!action.activity.finished_at) {
        newState.current = action.activity.id;
      }
      return newState;
    }
    case 'RECEIVE_CURRENT_ACTIVITY': {
      if (!action.activity) {
        return {
          ...state,
          current: null,
        };
      }
      return {
        ...state,
        activities: {
          ...state.activities,
          [action.activity.id]: action.activity,
        },
        current: action.activity.id,
      };
    }
    case 'RECEIVE_ACTIVITIES': {
      const newState = {
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
      const currentActivity = action.activities.find(
        activity => !activity.finished_at,
      );
      if (currentActivity) {
        newState.current = currentActivity.id;
      }
      return newState;
    }
    case 'START_ACTIVITY_SUCCESS':
    case 'RESUME_ACTIVITY_SUCCESS':
      return {
        ...state,
        activities: {
          ...state.activities,
          [action.activity.id]: action.activity,
        },
        current: action.activity.id,
      };
    case 'UPDATE_ACTIVITY_SUCCESS':
    case 'STOP_ACTIVITY_SUCCESS': {
      const newState = {
        ...state,
        activities: {
          ...state.activities,
          [action.activity.id]: action.activity,
        },
      };
      if (state.current === action.activity.id && action.activity.finished_at) {
        newState.current = null;
      }
      if (!action.activity.finished_at) {
        newState.current = action.activity.id;
      }
      return newState;
    }
    case 'REMOVE_ACTIVITY_SUCCESS': {
      const newState = {
        ...state,
        activities: omit(state.activities, action.id),
      };
      if (state.current === action.id) {
        newState.current = null;
      }
      return newState;
    }
    default:
      return state;
  }
}
