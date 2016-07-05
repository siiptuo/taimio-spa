import React from 'react';

import ActivityList from './ActivityList';

import { date, duration } from './filters';

function groupActivitiesByDate(data) {
    const dateActivityMap = data.reduce((obj, d) => {
        const key = date(d.started_at);
        if (typeof obj[key] !== 'undefined') {
            obj[key].push(d);
        } else {
            obj[key] = [d];
        }
        return obj;
    }, {});
    const days = [];
    for (let date in dateActivityMap) {
        days.push({
            date: new Date(date),
            activities: dateActivityMap[date],
        });
    }
    return days.sort((a, b) => b.date.getTime() - a.date.getTime());
}

const shortDateFormat = new Intl.DateTimeFormat(navigator.language, {
    weekday: 'short',
    day: 'numeric',
    month: 'numeric',
});

export default class ActivityDurationSum extends React.Component {
    constructor(props) {
        super(props);
        if (this.props.activities.some(activity => !!activity.finished_at)) {
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
        if (this.props.loading) {
            return <div>Loading...</div>;
        }
        return (
            <div>
                {groupActivitiesByDate(this.props.activities).map(day => (
                    <div className="activity-summary-day" key={day.date.getTime()}>
                        <h3>
                            {this.props.title || shortDateFormat.format(day.date)}
                            <span className="activity-summary-total-duration">
                                <ActivityDurationSum activities={day.activities} />
                            </span>
                        </h3>
                        <ActivityList
                            activities={day.activities}
                            onActivityClick={this.onActivityClick}
                        />
                    </div>
                ))}
            </div>
        );
    }
}

ActivitySummary.contextTypes = {
    router: React.PropTypes.object,
};

ActivitySummary.propTypes = {
    loading: React.PropTypes.bool.isRequired,
    activities: React.PropTypes.array.isRequired,
    title: React.PropTypes.string,
};
