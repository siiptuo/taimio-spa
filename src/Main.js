import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import CurrentActivity from './CurrentActivity';
import ActivitySwitcher from './ActivitySwitcher';
import ActivitySummary from './ActivitySummary';

import * as filters from './filters';

import { fetchActivities } from './actions';

function onDate(date, reference) {
  return (
    date.getYear() === reference.getYear() &&
    date.getMonth() === reference.getMonth() &&
    date.getDate() === reference.getDate()
  );
}

function getTodayActivities(activities) {
  return activities.filter(activity => onDate(activity.started_at, new Date()));
}

function mapStateToProps(state) {
  return {
    activities: getTodayActivities(Object.values(state.activities.activities)),
    loading: false,
  };
}

const TodayActivitySummary = connect(mapStateToProps)(ActivitySummary);

export class Main extends React.Component {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
  };

  componentDidMount() {
    const today = filters.date(new Date());
    this.props.dispatch(fetchActivities(today, today));
  }

  render() {
    return (
      <div>
        <CurrentActivity />
        <ActivitySwitcher />
        <TodayActivitySummary title="Today" />
      </div>
    );
  }
}

export default connect()(Main);
