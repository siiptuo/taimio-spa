import React from 'react';

import * as activity from './activity';

export default class ActivitySwitcher extends React.Component {
    constructor(props) {
        super(props);
        this.state = {input: ''};
    }

    handleInputChange(event) {
        this.setState({input: event.target.value});
    }

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
    }

    render() {
        return (
            <form className="start-activity-form" onSubmit={this.handleSubmit.bind(this)}>
                <input type="text"
                    placeholder="Activity title #tag1 #tag2"
                    value={this.state.input}
                    onChange={this.handleInputChange.bind(this)} />
                <button type="submit">Start</button>
            </form>
        );
    }
}
