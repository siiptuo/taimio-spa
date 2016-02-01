var React = require('react');
var ReactDOM = require('react-dom');

import * as activity from './activity';
import * as filters from './filters';

const millisecondsInDay = 1000 * 60 * 60 * 24;

function groupActivitiesByDate(data) {
    const dateActivityMap = data.reduce((obj, d) => {
        const key = Math.floor(d.started_at.getTime() / millisecondsInDay);
        if (typeof obj[key] !== 'undefined') {
            obj[key].push(d);
        } else {
            obj[key] = [d];
        }
        return obj;
    }, {});
    const days = [];
    for (let date in dateActivityMap) {
        days.push({
            date: new Date(date * millisecondsInDay),
            activities: dateActivityMap[date]
        });
    }
    return days.sort((a, b) => b.date.getTime() - a.date.getTime());
}

const CurrentActivity = React.createClass({
    handleStop(event) {
        event.preventDefault();
        this.props.onActivityStop(this.props.activity);
    },
    render() {
        const hasActivity = this.props.activity != null;
        const activityHeader = hasActivity ?
            <h1>
                {this.props.activity.title}
                <ul className="tag-list">
                    {this.props.activity.tags.map(tag => <li key={tag}>{tag}</li>)}
                </ul>
                {filters.duration(this.props.activity.started_at)}
            </h1> :
            <h1>No activity</h1>;
        return (
            <form className="current-activity-display" onSubmit={this.handleStop}>
                {activityHeader}
                <button type="submit" disabled={!hasActivity}>Stop</button>
            </form>
        );
    }
});

const ActivitySwitcher = React.createClass({
    getInitialState() {
        return {input: ''};
    },
    handleInputChange(event) {
        this.setState({input: event.target.value});
    },
    handleSubmit(event) {
        event.preventDefault();
        const input = this.state.input.trim();
        if (!input) {
            return;
        }
        const parsedInput = activity.parseInput(input);
        this.props.onActivityStart({
            title: parsedInput.title,
            tags: parsedInput.tags,
            started_at: new Date(),
            finished_at: null,
        });
        this.setState({input: ''});
    },
    render() {
        return (
            <form className="start-activity-form" onSubmit={this.handleSubmit}>
                <input type="text"
                    placeholder="Activity title #tag1 #tag2"
                    value={this.state.input}
                    onChange={this.handleInputChange} />
                <button type="submit">Start</button>
            </form>
        );
    }
});

const ActivityList = React.createClass({
    render() {
        return (
            <table className="activity-list">
                <tbody>
                    {this.props.activities.map(activity => (
                        <tr key={activity.id} onClick={this.props.onActivityClick.bind(null, activity)}>
                            <td className="activity-list-time-column">{filters.time(activity.started_at)}</td>
                            <td className="activity-list-time-column">-</td>
                            <td className="activity-list-time-column">{filters.time(activity.finished_at)}</td>
                            <td className="activity-list-title-column">
                                {activity.title}
                                <ul className="tag-list">
                                    {Array.isArray(activity.tags) ? activity.tags.map(tag => <li key={tag}>{tag}</li>) : null}
                                </ul>
                            </td>
                            <td className="activity-list-duration-column">
                                {filters.duration(activity.started_at, activity.finished_at)}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        );
    }
});

const ActivitySummary = React.createClass({
    render() {
        return (
            <div>
                {groupActivitiesByDate(this.props.activities).map(day => (
                    <div key={day.date.getTime()}>
                        <h3>
                            {filters.date(day.date)}
                            <span className="activity-summary-total-duration">
                                {filters.duration(day.activities.reduce((sum, activity) => {
                                    const end = activity.finished_at || new Date();
                                    return sum + end.getTime() - activity.started_at.getTime();
                                }, 0))}
                            </span>
                        </h3>
                        <ActivityList activities={day.activities} onActivityClick={this.props.onActivityClick} />
                    </div>
                ))}
            </div>
        );
    }
});

function parseLocalDate(input) {
    return new Date(input.replace(/-/g, '/').replace('T', ' '));
}

const ActivityEditor = React.createClass({
    getInitialState() {
        const ongoing = this.props.activity.finished_at == null;
        return {
            ongoing,
            started_at: filters.localDateTime(this.props.activity.started_at),
            finished_at: filters.localDateTime(ongoing ? new Date() : this.props.activity.finished_at),
            input: this.props.activity.title + (this.props.activity.tags.length > 0 ? ' #' + this.props.activity.tags.join(' #') : '')
        };
    },
    onCancel(event) {
        event.preventDefault();
        this.props.onCancel();
    },
    onSubmit(event) {
        event.preventDefault();
        const parsedInput = activity.parseInput(this.state.input);
        this.props.onSave({
            id: this.props.activity.id,
            title: parsedInput.title,
            tags: parsedInput.tags,
            started_at: parseLocalDate(this.state.started_at),
            finished_at: this.state.ongoing ? null : parseLocalDate(this.state.finished_at),
        });
    },
    onStartedAtChange(event) {
        this.setState({
            started_at: event.target.value,
            finished_at: this.state.finished_at,
            ongoing: this.state.ongoing,
            input: this.state.input,
        });
    },
    onFinishedAtChange(event) {
        this.setState({
            started_at: this.state.started_at,
            finished_at: event.target.value,
            ongoing: this.state.ongoing,
            input: this.state.input,
        });
    },
    onOngoingChange(event) {
        this.setState({
            started_at: this.state.started_at,
            finished_at: this.state.finished_at,
            ongoing: event.target.checked,
            input: this.state.input,
        });
    },
    onInputChange(event) {
        this.setState({
            started_at: this.state.started_at,
            finished_at: this.state.finished_at,
            ongoing: this.state.ongoing,
            input: event.target.value,
        });
    },
    render() {
        return (
            <form onSubmit={this.onSubmit}>
                <label>
                    Start time:
                    <input type="datetime-local"
                        step="1"
                        value={this.state.started_at}
                        onChange={this.onStartedAtChange} />
                </label>
                <label>
                    End time:
                    <input type="datetime-local"
                        step="1"
                        value={this.state.finished_at}
                        disabled={this.state.ongoing}
                        onChange={this.onFinishedAtChange} />
                </label>
                <label>
                    <input type="checkbox" checked={this.state.ongoing} onChange={this.onOngoingChange} />
                    Ongoing
                </label>
                <label>
                    Activity:
                    <input type="text" value={this.state.input} onChange={this.onInputChange} />
                </label>
                <button onClick={this.onCancel}>Cancel</button>
                <button type="submit">Save</button>
            </form>
        );
    }
});

const Main = React.createClass({
    handleActivityStop(newActivity) {
        newActivity.finished_at = new Date();
        activity.apiSave(newActivity)
            .then(() => {
                this.setState({
                    activities: this.state.activities,
                    currentActivity: null,
                    selectedActivity: null,
                });
            });
    },
    handleActivityStart(newActivity) {
        if (this.state.currentActivity) {
            this.state.currentActivity.finished_at = new Date();
            activity.apiSave(this.state.currentActivity)
                .then(() => activity.apiSave(newActivity))
                .then(activity => {
                    this.state.activities.unshift(activity);
                    this.setState({
                        activities: this.state.activities,
                        currentActivity: activity,
                        selectedActivity: null,
                    });
                });
        } else {
            activity.apiSave(newActivity)
                .then(activity => {
                    this.state.activities.unshift(activity);
                    this.setState({
                        activities: this.state.activities,
                        currentActivity: activity,
                        selectedActivity: null,
                    });
                });
        }
    },
    handleActivityClick(activity) {
        this.setState({
            activities: this.state.activities,
            currentActivity: this.state.currentActivity,
            selectedActivity: activity,
        });
    },
    handleActivitySave(newActivity) {
        activity.apiSave(newActivity)
            .then((activity) => {
                const activityIndex = this.state.activities.findIndex(a => a.id === activity.id);
                this.state.activities[activityIndex] = activity;
                this.setState({
                    activities: this.state.activities,
                    currentActivity: activity.finished_at == null ? activity : this.state.currentActivity,
                    selectedActivity: null,
                });
           });
    },
    handleActivityCancel() {
        this.setState({
            activities: this.state.activities,
            currentActivity: this.state.currentActivity,
            selectedActivity: null,
        });
    },
    getInitialState() {
        return {
            activities: [],
            currentActivity: null,
            selectedActivity: null,
        };
    },
    componentDidMount() {
        fetch('api/activities')
            .then(response => response.json())
            .then(data => data.map(activity.unserialize))
            .then(data => {
                this.setState({
                    activities: data,
                    currentActivity: data.find(activity => activity.finished_at === null),
                });
            });
    },
    render() {
        return (
            this.state.selectedActivity ?
            <ActivityEditor activity={this.state.selectedActivity}
                onSave={this.handleActivitySave}
                onCancel={this.handleActivityCancel} /> :
            <div>
                <CurrentActivity activity={this.state.currentActivity} onActivityStop={this.handleActivityStop} />
                <ActivitySwitcher onActivityStart={this.handleActivityStart} />
                <ActivitySummary activities={this.state.activities} onActivityClick={this.handleActivityClick} />
            </div>
        );
    }
});

ReactDOM.render(
    <Main />,
    document.getElementById('app')
);
