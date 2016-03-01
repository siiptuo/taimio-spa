import React from 'react';

import {localDateTime} from './filters';
import * as activity from './activity';

function parseLocalDate(input) {
    return new Date(input.replace(/-/g, '/').replace('T', ' '));
}

export default class ActivityEditor extends React.Component {
    constructor(props) {
        super(props);

        const ongoing = this.props.activity.finished_at == null;
        this.state = {
            ongoing,
            started_at: localDateTime(this.props.activity.started_at),
            finished_at: localDateTime(ongoing ? new Date() : this.props.activity.finished_at),
            input: this.props.activity.title + (this.props.activity.tags.length > 0 ? ' #' + this.props.activity.tags.join(' #') : '')
        };
    }

    onResume(event) {
        event.preventDefault();
        this.props.onResume();
    }

    onCancel(event) {
        event.preventDefault();
        this.props.onCancel();
    }

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
    }

    onStartedAtChange(event) {
        this.setState({
            started_at: event.target.value,
            finished_at: this.state.finished_at,
            ongoing: this.state.ongoing,
            input: this.state.input,
        });
    }

    onFinishedAtChange(event) {
        this.setState({
            started_at: this.state.started_at,
            finished_at: event.target.value,
            ongoing: this.state.ongoing,
            input: this.state.input,
        });
    }

    onOngoingChange(event) {
        this.setState({
            started_at: this.state.started_at,
            finished_at: this.state.finished_at,
            ongoing: event.target.checked,
            input: this.state.input,
        });
    }

    onInputChange(event) {
        this.setState({
            started_at: this.state.started_at,
            finished_at: this.state.finished_at,
            ongoing: this.state.ongoing,
            input: event.target.value,
        });
    }

    render() {
        return (
            <form onSubmit={this.onSubmit.bind(this)}>
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
                <button onClick={this.onCancel.bind(this)}>Cancel</button>
                {this.props.activity.finished_at ? <button onClick={this.onResume.bind(this)}>Resume</button> : null}
                <button type="submit">Save</button>
            </form>
        );
    }
}
