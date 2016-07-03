import React from 'react';
import { connect } from 'react-redux';

import { fetchActivitiesIfNeeded } from './actions';

import ActivitySummary from './ActivitySummary';

class List extends React.Component {
    componentDidMount() {
        this.props.dispatch(fetchActivitiesIfNeeded());
    }

    render() {
        return (
            <ActivitySummary
                activities={this.props.activities}
                loading={this.props.loading}
            />
        );
    }
}

List.propTypes = {
    dispatch: React.PropTypes.func.isRequired,
    activities: React.PropTypes.array.isRequired,
    loading: React.PropTypes.bool.isRequired,
};

function mapStateToProps(state) {
    return {
        activities: state.activities.activities,
        loading: state.activities.isFetching,
    };
}

export default connect(mapStateToProps)(List);
