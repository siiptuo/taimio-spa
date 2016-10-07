import React from 'react';
import { connect } from 'react-redux';

import { date, time } from './filters';
import * as activity from './activity';
import { fetchActivity, updateActivity, resumeActivity, removeActivity } from './actions';
import { getWeekRange } from './List';

function parseLocalDate(input) {
    return new Date(input.replace(/-/g, '/').replace('T', ' '));
}

function isOnSameDay(date1, date2) {
    return date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate();
}

export class ActivityEditor extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
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

    componentDidMount() {
        this.props.dispatch(fetchActivity(this.props.params.id)).then(activity => {
            const ongoing = activity.finished_at == null;
            this.setState({
                activity,
                ongoing,
                loading: false,
                startedAtDate: date(activity.started_at),
                startedAtTime: time(activity.started_at, true),
                finishedAtTime: time(ongoing ? new Date() : activity.finished_at, true),
                input: activity.title + (activity.tags.length > 0 ? ' #' + activity.tags.join(' #') : ''),
            });
        });
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
            id: this.state.activity.id,
            title,
            tags,
            started_at: startedAt,
            finished_at: finishedAt,
        }));
        this.context.router.push('/');
    }

    onCancel(event) {
        event.preventDefault();
        this.goBack();
    }

    onResume(event) {
        event.preventDefault();
        this.props.dispatch(resumeActivity(this.state.activity.id));
        this.goBack();
    }

    onRemove(event) {
        event.preventDefault();
        this.props.dispatch(removeActivity(this.state.activity.id));
        this.goBack();
    }

    goBack() {
        // Simply go back if there is history.
        if (this.props.location.action === 'PUSH') {
            this.context.router.goBack();
        } else {
            // Try to be smart when there is no history by always going to a page with the activity
            // listed.
            if (isOnSameDay(this.state.activity.started_at, new Date())) {
                this.context.router.push('/');
            } else {
                const [start, end] = getWeekRange(this.state.activity.started_at).map(date);
                this.context.router.push({
                    pathname: '/list',
                    query: { start, end },
                });
            }
        }
    }

    render() {
        if (this.state.loading) {
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
                        type="text" value={this.state.input}
                        onChange={this.onInputChange}
                    />
                </label>
                <div className="action-area">
                    <button onClick={this.onCancel}>Cancel</button>
                    <button onClick={this.onRemove}>Remove</button>
                    {this.state.activity.finished_at ?
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
    dispatch: React.PropTypes.func.isRequired,
    location: React.PropTypes.object.isRequired,
};

export default connect()(ActivityEditor);
