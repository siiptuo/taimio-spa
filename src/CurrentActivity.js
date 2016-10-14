import React from 'react';
import { connect } from 'react-redux';

import { stopActivity } from './actions';
import Duration from './Duration';

export class CurrentActivity extends React.Component {
    constructor(props) {
        super(props);
        this.handleStop = this.handleStop.bind(this);
    }

    handleStop(event) {
        event.preventDefault();
        this.props.onActivityStop(this.props.activity.id);
    }

    render() {
        const hasActivity = this.props.activity != null;
        const activityHeader = hasActivity ?
            <div className="current-activity">
                <div className="current-activity-title">
                    {this.props.activity.title}
                    <ul className="tag-list">
                        {this.props.activity.tags.map(tag => <li key={tag}>{tag}</li>)}
                    </ul>
                </div>
                <div className="current-activity-duration">
                    <Duration
                        startTime={this.props.activity.started_at}
                        endTime={this.props.activity.finished_at}
                    />
                </div>
            </div> :
            <div className="current-activity">{this.props.loading ? 'Loading...' : 'No activity'}</div>;
        return (
            <form className={"current-activity-display" + (hasActivity ? '' : ' no-activity')} onSubmit={this.handleStop}>
                <div className="current-activity-status" />
                {activityHeader}
                <button type="submit" disabled={!hasActivity || this.props.loading}>
                    &#10003; Complete
                </button>
            </form>
        );
    }
}

CurrentActivity.propTypes = {
    activity: React.PropTypes.object,
    onActivityStop: React.PropTypes.func.isRequired,
    loading: React.PropTypes.bool.isRequired,
};

function mapStateToProps(state) {
    return {
        activity: state.activities.activities.find(activity => !activity.finished_at),
        loading: state.activities.isFetching,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        onActivityStop(id) {
            dispatch(stopActivity(id));
        },
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(CurrentActivity);
