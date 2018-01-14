import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { fetchCurrentActivity, stopActivity } from './actions';
import Duration from './Duration';
import { propType as activityPropType } from './activity';

export class CurrentActivity extends React.Component {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    activity: activityPropType,
    loading: PropTypes.bool.isRequired,
  };

  componentDidMount() {
    this.props.dispatch(fetchCurrentActivity());
  }

  handleStop = event => {
    event.preventDefault();
    this.props.dispatch(stopActivity(this.props.activity.id));
  };

  render() {
    const hasActivity = this.props.activity != null;
    const activityHeader = hasActivity ? (
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
      </div>
    ) : (
      <div className="current-activity">
        {this.props.loading ? 'Loading...' : 'No activity'}
      </div>
    );
    return (
      <form
        className={
          'current-activity-display' + (hasActivity ? '' : ' no-activity')
        }
        onSubmit={this.handleStop}
      >
        <div className="current-activity-status" />
        {activityHeader}
        <button type="submit" disabled={!hasActivity || this.props.loading}>
          &#10003; Complete
        </button>
      </form>
    );
  }
}

function mapStateToProps(state) {
  return {
    activity: state.activities.activities[state.activities.current],
    loading: false,
  };
}

export default connect(mapStateToProps)(CurrentActivity);
