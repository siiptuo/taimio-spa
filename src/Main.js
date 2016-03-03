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
                    selectedActivity: null,
                });
            })
            .catch(error => {
                alert('API error: ' + error.message);
                console.error('API error', error);
            });
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
            .then(activity => {
                const activityIndex = this.state.activities.findIndex(a => a.id === activity.id);
                this.state.activities[activityIndex] = activity;
                this.setState({
                    activities: this.state.activities,
                    currentActivity: activity.finished_at == null ? activity : this.state.currentActivity,
                    selectedActivity: null,
                });
            })
            .catch(error => {
                alert('API error: ' + error.message);
                console.error('API error', error);
            });
    }

    handleActivityCancel() {
        this.setState({
            activities: this.state.activities,
            currentActivity: this.state.currentActivity,
            selectedActivity: null,
        });
    }

    handleActivityResume() {
        this.handleActivityStart({
            started_at: new Date(),
            finished_at: null,
            title: this.state.selectedActivity.title,
            tags: this.state.selectedActivity.tags.slice(),
        });
    }

    handleActivityRemove() {
        activity.apiRemove(this.state.selectedActivity)
            .then(() => {
                this.setState({
                    activities: this.state.activities.filter(activity => activity.id !== this.state.selectedActivity.id),
                    currentActivity: this.state.currentActivity.id === this.state.selectedActivity.id ? null : this.state.currentActivity,
                    selectedActivity: null
                });
            })
    }

    updateTime() {
        this.forceUpdate();
    }

    componentDidMount() {
        activity.apiList()
            .then(data => {
                this.setState({
                    activities: data,
                    currentActivity: data.find(activity => activity.finished_at === null),
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

    render() {
        return (
            this.state.selectedActivity ?
            <ActivityEditor activity={this.state.selectedActivity}
                onSave={this.handleActivitySave.bind(this)}
                onCancel={this.handleActivityCancel.bind(this)}
                onResume={this.handleActivityResume.bind(this)}
                onRemove={this.handleActivityRemove.bind(this)} /> :
            <div>
                <CurrentActivity activity={this.state.currentActivity} onActivityStop={this.handleActivityStop.bind(this)} />
                <ActivitySwitcher onActivityStart={this.handleActivityStart.bind(this)} />
                <ActivitySummary activities={this.state.activities} onActivityClick={this.handleActivityClick.bind(this)} />
            </div>
        );
    }
}
