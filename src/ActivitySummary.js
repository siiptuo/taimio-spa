import React from 'react';

import ActivityList from './ActivityList';

import { duration } from './filters';

const shortDateFormat = new Intl.DateTimeFormat(navigator.language, {
    weekday: 'short',
    day: 'numeric',
    month: 'numeric',
});

export default class ActivityDurationSum extends React.Component {
    constructor(props) {
        super(props);
        if (this.props.activities.some(activity => !activity.finished_at)) {
            this.interval = setInterval(() => { this.forceUpdate(); }, 1000);
        }
    }

    componentWillUnmount() {
        clearInterval(this.interval);
    }

    render() {
        const durationSum = this.props.activities.reduce((sum, activity) => {
            const finishedAt = activity.finished_at || new Date();
            return sum + finishedAt.getTime() - activity.started_at.getTime();
        }, 0);
        return <span>{duration(durationSum)}</span>;
    }
}

ActivityDurationSum.propTypes = {
    activities: React.PropTypes.array.isRequired,
};

export default class ActivitySummary extends React.Component {
    constructor(props) {
        super(props);

        this.onActivityClick = this.onActivityClick.bind(this);
    }

    onActivityClick(activity) {
        this.context.router.push(`/activity/${activity.id}`);
    }

    render() {
        return (
            <div className={"activity-summary-day" + (this.props.activities.length === 0 ? ' inactive' : '')}>
                <h3>
                    {this.props.title || shortDateFormat.format(this.props.date)}
                    <span className="activity-summary-total-duration">
                        {this.props.activities.length === 0 ?
                            "No activities" :
                            <ActivityDurationSum activities={this.props.activities} />}
                    </span>
                </h3>
                <ActivityList
                    activities={this.props.activities}
                    onActivityClick={this.onActivityClick}
                />
            </div>
        );
    }
}

ActivitySummary.contextTypes = {
    router: React.PropTypes.object,
};

ActivitySummary.propTypes = {
    activities: React.PropTypes.array.isRequired,
    title: React.PropTypes.string,
    date: React.PropTypes.instanceOf(Date).isRequired,
};
