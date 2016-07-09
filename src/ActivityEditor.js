import React from 'react';
import { connect } from 'react-redux';

import { date, time } from './filters';
import * as activity from './activity';
import { updateActivity, resumeActivity, removeActivity } from './actions';

function parseLocalDate(input) {
    return new Date(input.replace(/-/g, '/').replace('T', ' '));
}

export class ActivityEditor extends React.Component {
    constructor(props) {
        super(props);
        const { activity } = props;
        const ongoing = activity.finished_at == null;
        this.state = {
            ongoing,
            loading: false,
            startedAtDate: date(activity.started_at),
            startedAtTime: time(activity.started_at, true),
            finishedAtTime: time(ongoing ? new Date() : activity.finished_at, true),
            input: activity.title + (activity.tags.length > 0 ? ' #' + activity.tags.join(' #') : ''),
        };
        this.onStartedAtDateChange = this.onStartedAtDateChange.bind(this);
        this.onStartedAtTimeChange = this.onStartedAtTimeChange.bind(this);
        this.onFinishedAtTimeChange = this.onFinishedAtTimeChange.bind(this);
        this.onOngoingChange = this.onOngoingChange.bind(this);
        this.onInputChange = this.onInputChange.bind(this);
        this.onSave = this.onSave.bind(this);
        this.onCancel = this.onCancel.bind(this);
        this.onResume = this.onResume.bind(this);
        this.onRemove = this.onRemove.bind(this);
    }

    onStartedAtDateChange(event) {
        this.setState(Object.assign({}, this.state, { startedAtDate: event.target.value }));
    }

    onStartedAtTimeChange(event) {
        this.setState(Object.assign({}, this.state, { startedAtTime: event.target.value }));
    }

    onFinishedAtTimeChange(event) {
        this.setState(Object.assign({}, this.state, { finishedAtTime: event.target.value }));
    }

    onOngoingChange(event) {
        this.setState(Object.assign({}, this.state, { ongoing: event.target.checked }));
    }

    onInputChange(event) {
        this.setState(Object.assign({}, this.state, { input: event.target.value }));
    }

    onSave(event) {
        event.preventDefault();
        const { title, tags } = activity.parseInput(this.state.input);
        const startedAt = parseLocalDate(`${this.state.startedAtDate}T${this.state.startedAtTime}`);
        let finishedAt = null;
        if (!this.state.ongoing) {
            finishedAt = parseLocalDate(`${this.state.startedAtDate}T${this.state.finishedAtTime}`);
            if (this.state.finishedAtTime < this.state.startedAtTime) {
                finishedAt.setDate(finishedAt.getDate() + 1);
            }
        }
        this.props.dispatch(updateActivity({
            id: this.props.activity.id,
            title,
            tags,
            started_at: startedAt,
            finished_at: finishedAt,
        }));
        this.context.router.push('/');
    }

    onCancel(event) {
        event.preventDefault();
        this.context.router.push('/');
    }

    onResume(event) {
        event.preventDefault();
        this.props.dispatch(resumeActivity(this.props.activity.id));
        this.context.router.push('/');
    }

    onRemove(event) {
        event.preventDefault();
        this.props.dispatch(removeActivity(this.props.activity.id));
        this.context.router.push('/');
    }

    render() {
        if (this.state.loading) {
            return <div>Loading...</div>;
        }
        return (
            <form>
                <fieldset>
                    <legend>Time</legend>
                    <input
                        type="date"
                        value={this.state.startedAtDate}
                        onChange={this.onStartedAtDateChange}
                    />
                    <input
                        type="time"
                        value={this.state.startedAtTime}
                        onChange={this.onStartedAtTimeChange}
                    />
                    -
                    <input
                        type="time"
                        value={this.state.finishedAtTime}
                        disabled={this.state.ongoing}
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
                </fieldset>
                <label>
                    Activity:
                    <input
                        type="text" value={this.state.input}
                        onChange={this.onInputChange}
                    />
                </label>
                <div className="action-area">
                    <button onClick={this.onCancel}>Cancel</button>
                    <button onClick={this.onRemove}>Remove</button>
                    {this.props.activity.finished_at ?
                        <button onClick={this.onResume}>Resume</button> :
                        null}
                    <button onClick={this.onSave}>Save</button>
                </div>
            </form>
        );
    }
}

ActivityEditor.contextTypes = {
    router: React.PropTypes.object,
};

ActivityEditor.propTypes = {
    params: React.PropTypes.object.isRequired,
    activity: React.PropTypes.object.isRequired,
    dispatch: React.PropTypes.func.isRequired,
};

function mapStateToProps(state, ownProps) {
    return {
        activity: state.activities.activities.find(a => a.id == ownProps.params.id),
    };
}

export default connect(mapStateToProps)(ActivityEditor);
