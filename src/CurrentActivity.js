import React from 'react';
import {duration} from './filters';

export default class CurrentActivity extends React.Component {
    handleStop(event) {
        event.preventDefault();
        this.props.onActivityStop(this.props.activity);
    }

    render() {
        const hasActivity = this.props.activity != null;
        const activityHeader = hasActivity ?
            <h1>
                {this.props.activity.title}
                <ul className="tag-list">
                    {this.props.activity.tags.map(tag => <li key={tag}>{tag}</li>)}
                </ul>
                {duration(this.props.activity.started_at)}
            </h1> :
            <h1>{this.props.loading ? 'Loading...' : 'No activity'}</h1>;
        return (
            <form className="current-activity-display" onSubmit={this.handleStop.bind(this)}>
                {activityHeader}
                <button type="submit" disabled={!hasActivity || this.props.loading}>Stop</button>
            </form>
        );
    }
}

