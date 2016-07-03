import React, { PropTypes } from 'react';
import { connect } from 'react-redux';

import CurrentActivity from './CurrentActivity';
import ActivitySwitcher from './ActivitySwitcher';
import ActivitySummary from './ActivitySummary';

import * as activity from './activity';
import * as filters from './filters';

import { fetchActivitiesIfNeeded } from './actions';

function onDate(date, reference) {
    return date.getYear() === reference.getYear()
        && date.getMonth() === reference.getMonth()
        && date.getDate() === reference.getDate();
}

function getTodayActivities(activities) {
    return activities.filter(activity => onDate(activity.started_at, new Date()));
}

function mapStateToProps(state) {
    return {
        activities: getTodayActivities(state.activities.activities),
        loading: false,
    };
}

const TodayActivitySummary = connect(mapStateToProps)(ActivitySummary);

export class Main extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
        };
        // this.handleActivityStop = this.handleActivityStop.bind(this);
        // this.handleActivityStart = this.handleActivityStart.bind(this);
    }

    componentDidMount() {
        // const today = filters.date(new Date());
        // activity.apiList({ start_date: today, end_date: today })
        this.props.dispatch(fetchActivitiesIfNeeded());
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

Main.propTypes = {
    dispatch: PropTypes.func.isRequired,
};

export default connect()(Main);
