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
            selectedActivity: null,
            currentPage: 'main',
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
                    selectedActivity: null,
                    currentPage: this.state.currentPage,
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
                    selectedActivity: null,
                    currentPage: this.state.currentPage,
                    loading: this.state.loading,
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
            currentPage: this.state.currentPage,
            loading: this.state.loading,
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
                    currentPage: this.state.currentPage,
                    loading: this.state.loading,
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
            currentPage: this.state.currentPage,
            loading: this.state.loading,
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
                    selectedActivity: null,
                    currentPage: this.state.currentPage,
                    loading: this.state.loading,
                });
            })
    }

    handlePageChange(event, page) {
        event.preventDefault();
        this.setState({
            activities: this.state.activities,
            currentActivity: this.state.currentActivity,
            selectedActivity: this.state.selectedActivity,
            currentPage: page,
            loading: this.state.loading,
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
                    currentPage: this.state.currentPage,
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
            this.state.selectedActivity ?
            <ActivityEditor activity={this.state.selectedActivity}
                onSave={this.handleActivitySave.bind(this)}
                onCancel={this.handleActivityCancel.bind(this)}
                onResume={this.handleActivityResume.bind(this)}
                onRemove={this.handleActivityRemove.bind(this)} /> :
            <div>
                <ul className="tabs">
                    <li><a href="main" className={this.state.currentPage === 'main' ? 'selected' : ''} onClick={(event) => this.handlePageChange(event, 'main')}>Main</a></li>
                    <li><a href="stats" className={this.state.currentPage === 'stats' ? 'selected' : ''} onClick={(event) => this.handlePageChange(event, 'stats')}>Stats</a></li>
                </ul>
                {this.state.currentPage === 'main' ? (
                    <div>
                        <CurrentActivity activity={this.state.currentActivity}
                                         onActivityStop={this.handleActivityStop.bind(this)}
                                         loading={this.state.loading} />
                        <ActivitySwitcher onActivityStart={this.handleActivityStart.bind(this)}
                                          loading={this.state.loading} />
                        <ActivitySummary activities={this.state.activities}
                                         onActivityClick={this.handleActivityClick.bind(this)}
                                         loading={this.state.loading} />
                    </div>
                    ) : <ActivityStats activities={this.state.activities} />}
            </div>
        );
    }
}
