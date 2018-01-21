import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { date, time } from './filters';
import * as activity from './activity';
import {
  fetchActivity,
  updateActivity,
  resumeActivity,
  removeActivity,
} from './actions';
import { getWeekRange } from './List';

function parseLocalDate(input) {
  return new Date(input.replace(/-/g, '/').replace('T', ' '));
}

function isOnSameDay(date1, date2) {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

export class ActivityEditor extends React.Component {
  static contextTypes = {
    router: PropTypes.object,
  };

  static propTypes = {
    params: PropTypes.shape({
      id: PropTypes.string.isRequired,
    }).isRequired,
    dispatch: PropTypes.func.isRequired,
    location: PropTypes.object.isRequired,
    activity: activity.propType,
    loading: PropTypes.bool.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {};
  }

  setActivityState = activity => {
    if (!activity) {
      return;
    }
    const ongoing = activity.finished_at == null;
    this.setState({
      ongoing,
      startedAtDate: date(activity.started_at),
      startedAtTime: time(activity.started_at, true),
      finishedAtTime: time(ongoing ? new Date() : activity.finished_at, true),
      input:
        activity.title +
        (activity.tags.length > 0 ? ' #' + activity.tags.join(' #') : ''),
    });
  };

  componentDidMount() {
    if (this.props.activity) {
      this.setActivityState(this.props.activity);
    } else {
      this.props.dispatch(fetchActivity(this.props.match.params.id));
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setActivityState(nextProps.activity);
  }

  onStartedAtDateChange = event => {
    this.setState({ startedAtDate: event.target.value });
  };

  onStartedAtTimeChange = event => {
    this.setState({ startedAtTime: event.target.value });
  };

  onFinishedAtTimeChange = event => {
    this.setState({ finishedAtTime: event.target.value });
  };

  onOngoingChange = event => {
    this.setState({ ongoing: event.target.checked });
  };

  onInputChange = event => {
    this.setState({ input: event.target.value });
  };

  onSave = event => {
    event.preventDefault();
    const { title, tags } = activity.parseInput(this.state.input);
    const startedAt = parseLocalDate(
      `${this.state.startedAtDate}T${this.state.startedAtTime}`,
    );
    let finishedAt = null;
    if (!this.state.ongoing) {
      finishedAt = parseLocalDate(
        `${this.state.startedAtDate}T${this.state.finishedAtTime}`,
      );
      if (this.state.finishedAtTime < this.state.startedAtTime) {
        finishedAt.setDate(finishedAt.getDate() + 1);
      }
    }
    this.props
      .dispatch(
        updateActivity({
          id: this.props.activity.id,
          title,
          tags,
          started_at: startedAt,
          finished_at: finishedAt,
        }),
      )
      .then(() => {
        this.goBack();
      });
  };

  onCancel = event => {
    event.preventDefault();
    this.goBack();
  };

  onResume = event => {
    event.preventDefault();
    this.props.dispatch(resumeActivity(this.props.activity.id)).then(() => {
      this.props.history.push('/');
    });
  };

  onRemove = event => {
    event.preventDefault();
    if (confirm('Remove activity?')) {
      const activity = { ...this.props.activity };
      this.props.dispatch(removeActivity(this.props.activity.id)).then(() => {
        this.goBack(activity);
      });
    }
  };

  goBack = (activity = this.props.activity) => {
    // Simply go back if there is history.
    if (this.props.history.action === 'PUSH') {
      this.props.history.goBack();
    } else {
      // Try to be smart when there is no history by going to the page where
      // the activity is listed.
      if (isOnSameDay(activity.started_at, new Date())) {
        this.props.history.push('/');
      } else {
        const [start, end] = getWeekRange(activity.started_at).map(date);
        this.props.history.push({
          pathname: '/list',
          query: { start, end },
        });
      }
    }
  };

  render() {
    if (this.props.loading) {
      return <div>Loading...</div>;
    }
    return (
      <form>
        <fieldset>
          <legend>Time</legend>
          <div className="time-input">
            <input
              type="date"
              value={this.state.startedAtDate}
              size={10}
              onChange={this.onStartedAtDateChange}
            />
            <input
              type="time"
              value={this.state.startedAtTime}
              size={5}
              onChange={this.onStartedAtTimeChange}
            />
            -
            <input
              type="time"
              value={this.state.finishedAtTime}
              disabled={this.state.ongoing}
              size={5}
              onChange={this.onFinishedAtTimeChange}
            />
            <label>
              <input
                type="checkbox"
                checked={this.state.ongoing}
                onChange={this.onOngoingChange}
              />
              Ongoing
            </label>
          </div>
        </fieldset>
        <label>
          Activity:
          <input
            type="text"
            value={this.state.input}
            onChange={this.onInputChange}
          />
        </label>
        <div className="action-area">
          <button onClick={this.onCancel}>Cancel</button>
          <button onClick={this.onRemove}>Remove</button>
          {this.props.activity.finished_at ? (
            <button onClick={this.onResume}>Resume</button>
          ) : null}
          <button onClick={this.onSave}>Save</button>
        </div>
      </form>
    );
  }
}

function mapStateToProps(state, ownProps) {
  const activity = state.activities.activities[ownProps.match.params.id];
  return {
    activity,
    loading: !activity,
  };
}

export default connect(mapStateToProps)(ActivityEditor);
