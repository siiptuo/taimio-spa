import React from 'react';

import ActivityEditor from './ActivityEditor';
import CurrentActivity from './CurrentActivity';
import ActivitySwitcher from './ActivitySwitcher';
import ActivitySummary from './ActivitySummary';

import * as activity from './activity';

export default class Main extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            activities: [],
            currentActivity: null,
            selectedActivity: null,
        };
    }

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
    }

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
    }

    handleActivityClick(activity) {
        this.setState({
            activities: this.state.activities,
            currentActivity: this.state.currentActivity,
            selectedActivity: activity,
        });
    }

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
    }

    handleActivityCancel() {
        this.setState({
            activities: this.state.activities,
            currentActivity: this.state.currentActivity,
            selectedActivity: null,
        });
    }

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
    }

    render() {
        return (
            this.state.selectedActivity ?
            <ActivityEditor activity={this.state.selectedActivity}
                onSave={this.handleActivitySave.bind(this)}
                onCancel={this.handleActivityCancel.bind(this)} /> :
            <div>
                <CurrentActivity activity={this.state.currentActivity} onActivityStop={this.handleActivityStop.bind(this)} />
                <ActivitySwitcher onActivityStart={this.handleActivityStart.bind(this)} />
                <ActivitySummary activities={this.state.activities} onActivityClick={this.handleActivityClick.bind(this)} />
            </div>
        );
    }
}
