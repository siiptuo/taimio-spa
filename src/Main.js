import React from 'react';

import ActivityEditor from './ActivityEditor';
import CurrentActivity from './CurrentActivity';
import ActivitySwitcher from './ActivitySwitcher';
import ActivitySummary from './ActivitySummary';
import ActivityStats from './ActivityStats';

import * as activity from './activity';

export default class Main extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            activities: [],
            currentActivity: null,
            loading: true,
        };
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

    componentDidMount() {
        activity.apiList()
            .then(data => {
                this.setState({
                    activities: data,
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

    render() {
        return (
            <div>
                <CurrentActivity activity={this.state.currentActivity}
                                 onActivityStop={this.handleActivityStop.bind(this)}
                                 loading={this.state.loading} />
                <ActivitySwitcher onActivityStart={this.handleActivityStart.bind(this)}
                                  loading={this.state.loading} />
                <ActivitySummary activities={this.state.activities}
                                 loading={this.state.loading} />
            </div>
        );
    }
}
