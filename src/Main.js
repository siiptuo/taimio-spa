import React from 'react';

import CurrentActivity from './CurrentActivity';
import ActivitySwitcher from './ActivitySwitcher';
import ActivitySummary from './ActivitySummary';

import * as activity from './activity';

function onDate(date, reference) {
    return date.getYear() === reference.getYear()
        && date.getMonth() === reference.getMonth()
        && date.getDate() === reference.getDate();
}

export default class Main extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            activities: [],
            currentActivity: null,
            loading: true,
        };
        this.handleActivityStop = this.handleActivityStop.bind(this);
        this.handleActivityStart = this.handleActivityStart.bind(this);
    }

    componentDidMount() {
        activity.apiList()
            .then(data => {
                this.setState({
                    activities: data.filter(activity => onDate(activity.started_at, new Date())),
                    currentActivity: data.find(activity => activity.finished_at === null),
                    loading: false,
                });
                this.timeUpdateInterval = setInterval(this.updateTime.bind(this), 15000);
            })
            .catch(error => {
                alert('API error: ' + error.message);
                console.error('API error', error);
            });
    }

    componentWillUnmount() {
        clearInterval(this.timeUpdateInterval);
    }

    handleActivityStop(newActivity) {
        newActivity.finished_at = new Date();
        activity.apiSave(newActivity)
            .then(() => {
                this.setState({
                    activities: this.state.activities,
                    currentActivity: null,
                    loading: this.state.loading,
                });
            })
            .catch(error => {
                alert('API error: ' + error.message);
                console.error('API error', error);
            });
    }

    handleActivityStart(newActivity) {
        const promises = [activity.apiSave(newActivity)];
        if (this.state.currentActivity) {
            this.state.currentActivity.finished_at = new Date();
            promises.push(activity.apiSave(this.state.currentActivity));
        }
        Promise.all(promises)
            .then(([activity]) => {
                this.state.activities.unshift(activity);
                this.setState({
                    activities: this.state.activities,
                    currentActivity: activity,
                    loading: this.state.loading,
                });
            })
            .catch(error => {
                alert('API error: ' + error.message);
                console.error('API error', error);
            });
    }

    updateTime() {
        this.forceUpdate();
    }

    render() {
        return (
            <div>
                <CurrentActivity
                    activity={this.state.currentActivity}
                    onActivityStop={this.handleActivityStop}
                    loading={this.state.loading}
                />
                <ActivitySwitcher
                    onActivityStart={this.handleActivityStart}
                    loading={this.state.loading}
                />
                <ActivitySummary
                    activities={this.state.activities}
                    loading={this.state.loading}
                    title="Today"
                />
            </div>
        );
    }
}
