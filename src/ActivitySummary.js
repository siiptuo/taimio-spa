import React from 'react';

import ActivityList from './ActivityList';

import {date, duration} from './filters';

const millisecondsInDay = 1000 * 60 * 60 * 24;

function groupActivitiesByDate(data) {
    const dateActivityMap = data.reduce((obj, d) => {
        const key = Math.floor(d.started_at.getTime() / millisecondsInDay);
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
            date: new Date(date * millisecondsInDay),
            activities: dateActivityMap[date]
        });
    }
    return days.sort((a, b) => b.date.getTime() - a.date.getTime());
}

export default class ActivitySummary extends React.Component {
    render() {
        return (
            <div>
                {groupActivitiesByDate(this.props.activities).map(day => (
                    <div key={day.date.getTime()}>
                        <h3>
                            {date(day.date)}
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
