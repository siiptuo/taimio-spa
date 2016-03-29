import React from 'react';
import { hashHistory } from 'react-router';

import {localDateTime} from './filters';
import * as activity from './activity';

function parseLocalDate(input) {
    return new Date(input.replace(/-/g, '/').replace('T', ' '));
}

export default class ActivityEditor extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
        };
    }

    componentDidMount() {
        activity.apiGet(this.props.params.id)
            .then(activity => {
                const ongoing = activity.finished_at == null;
                this.setState({
                    activity,
                    ongoing,
                    loading: false,
                    started_at: localDateTime(activity.started_at),
                    finished_at: localDateTime(ongoing ? new Date() : activity.finished_at),
                    input: activity.title + (activity.tags.length > 0 ? ' #' + activity.tags.join(' #') : '')
                });
            })
            .catch(error => {
                alert('API error: ' + error.message);
                console.error('API error', error);
            });
    }

    onStartedAtChange(event) {
        this.setState({
            started_at: event.target.value,
            finished_at: this.state.finished_at,
            ongoing: this.state.ongoing,
            input: this.state.input,
            loading: this.state.loading,
            activity: this.state.activity,
        });
    }

    onFinishedAtChange(event) {
        this.setState({
            started_at: this.state.started_at,
            finished_at: event.target.value,
            ongoing: this.state.ongoing,
            input: this.state.input,
            loading: this.state.loading,
            activity: this.state.activity,
        });
    }

    onOngoingChange(event) {
        this.setState({
            started_at: this.state.started_at,
            finished_at: this.state.finished_at,
            ongoing: event.target.checked,
            input: this.state.input,
            loading: this.state.loading,
            activity: this.state.activity,
        });
    }

    onInputChange(event) {
        this.setState({
            started_at: this.state.started_at,
            finished_at: this.state.finished_at,
            ongoing: this.state.ongoing,
            input: event.target.value,
            loading: this.state.loading,
            activity: this.state.activity,
        });
    }

    onSave() {
        const parsedInput = activity.parseInput(this.state.input);
        const newActivity = {
            id: this.state.activity.id,
            title: parsedInput.title,
            tags: parsedInput.tags,
            started_at: parseLocalDate(this.state.started_at),
            finished_at: this.state.ongoing ? null : parseLocalDate(this.state.finished_at),
        };
        activity.apiSave(newActivity)
            .then(activity => {
                hashHistory.push('/');
            })
            .catch(error => {
                alert('API error: ' + error.message);
                console.error('API error', error);
            });
    }

    onCancel() {
        hashHistory.push('/');
    }

    onResume() {
        alert('TODO');
    }

    onRemove() {
        activity.apiRemove(this.state.activity)
            .then(() => {
                hashHistory.push('/');
            })
            .catch(error => {
                alert('API error: ' + error.message);
                console.error('API error', error);
            });
    }

    render() {
        if (this.state.loading) {
            return <div>Loading...</div>;
        }
        return (
            <form>
                <label>
                    Start time:
                    <input type="datetime-local"
                        step="1"
                        value={this.state.started_at}
                        onChange={this.onStartedAtChange.bind(this)} />
                </label>
                <label>
                    End time:
                    <input type="datetime-local"
                        step="1"
                        value={this.state.finished_at}
                        disabled={this.state.ongoing}
                        onChange={this.onFinishedAtChange.bind(this)} />
                </label>
                <label>
                    <input type="checkbox" checked={this.state.ongoing} onChange={this.onOngoingChange.bind(this)} />
                    Ongoing
                </label>
                <label>
                    Activity:
                    <input type="text" value={this.state.input} onChange={this.onInputChange.bind(this)} />
                </label>
                <div className="action-area">
                    <button onClick={this.onCancel.bind(this)}>Cancel</button>
                    <button onClick={this.onRemove.bind(this)}>Remove</button>
                    {this.state.activity.finished_at ? <button onClick={this.onResume.bind(this)}>Resume</button> : null}
                    <button onClick={this.onSave.bind(this)}>Save</button>
                </div>
            </form>
        );
    }
}
