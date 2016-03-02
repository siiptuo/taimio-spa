import React from 'react';

import ActivityList from './ActivityList';

import {date, duration} from './filters';

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
            activities: dateActivityMap[date]
        });
    }
    return days.sort((a, b) => b.date.getTime() - a.date.getTime());
}

const shortDateFormat = new Intl.DateTimeFormat(navigator.language, {
    weekday: 'short',
    day:'numeric',
    month: 'numeric'}
);

export default class ActivitySummary extends React.Component {
    render() {
        return (
            <div>
                {groupActivitiesByDate(this.props.activities).map(day => (
                    <div key={day.date.getTime()}>
                        <h3>
                            {shortDateFormat.format(day.date)}
                            <span className="activity-summary-total-duration">
                                {duration(day.activities.reduce((sum, activity) => {
                                    const end = activity.finished_at || new Date();
                                    return sum + end.getTime() - activity.started_at.getTime();
                                }, 0))}
                            </span>
                        </h3>
                        <ActivityList activities={day.activities} onActivityClick={this.props.onActivityClick} />
                    </div>
                ))}
            </div>
        );
    }
}
