import React from 'react';
import { connect } from 'react-redux';

import { duration, date } from './filters';
import { fetchActivities } from './actions';
import { diffDays } from './List';
import { propType as activityPropType } from './activity';

export function countActivitiesByHour(activities) {
    const result = new Array(24).fill(0);
    for (const activity of activities) {
        const start = activity.started_at.getHours();
        const duration = (activity.finished_at.getTime() - activity.started_at.getTime());
        const hours = Math.ceil(duration / (60 * 60 * 1000));
        for (let i = 0; i < hours; i++) {
            result[(start + i) % 24]++;
        }
    }
    return result;
}

class DayDonut extends React.Component {
    static propTypes = {
        activities: React.PropTypes.arrayOf(activityPropType).isRequired,
    }

    render() {
        const hours = countActivitiesByHour(this.props.activities);
        const maxHours = Math.max.apply(null, hours);
        const radius = 100;
        const center = 100;
        const paths = [];
        const delta = 360 / 24;
        for (let angle = -delta / 2; angle < 360 - delta / 2; angle += delta) {
            paths.push([
                'M',
                Math.round(center + radius * Math.cos((angle + delta - 90) * Math.PI / 180)),
                Math.round(center + radius * Math.sin((angle + delta - 90) * Math.PI / 180)),
                'A', radius, radius, 0, 0, 0,
                Math.round(center + radius * Math.cos((angle - 90) * Math.PI / 180)),
                Math.round(center + radius * Math.sin((angle - 90) * Math.PI / 180)),
                'L',
                center,
                center,
            ].join(' '));
        }
        return (
            <svg width={200} height={200}>
                {paths.map((path, i) => (
                    <g key={i} className="day-donut">
                        <path
                            d={path}
                            opacity={maxHours === 0 ? 0 : hours[i] / maxHours}
                        />
                        <text
                            x={center + 90 * Math.cos((i * delta - 90) * Math.PI / 180)}
                            y={center + 90 * Math.sin((i * delta - 90) * Math.PI / 180)}
                        >
                            {i === 0 ? 24 : i}
                        </text>
                    </g>
                ))}
            </svg>
        );
    }
}

function groupActivitiesByDayOfTheWeek(activities) {
    const result = new Array(7);
    for (let i = 0; i < 7; i++) {
        result[i] = [];
    }
    for (const activity of activities) {
        result[activity.started_at.getDay()].push(activity);
    }
    return result;
}

function getActivityDuration(activity) {
    return activity.finished_at.getTime() - activity.started_at.getTime();
}

function sumActivityDurations(activities) {
    return activities.reduce((sum, activity) => sum + getActivityDuration(activity), 0);
}

class DayTable extends React.Component {
    static propTypes = {
        activities: React.PropTypes.arrayOf(activityPropType).isRequired,
    }

    render() {
        const labels = ['su', 'ma', 'ti', 'ke', 'to', 'pe', 'la'];
        const durations = groupActivitiesByDayOfTheWeek(this.props.activities)
            .map(activities => ({ activities, durationSum: sumActivityDurations(activities) }));
        const maxDuration = Math.max.apply(null, durations.map(d => d.durationSum));

        // Move sunday at end of the week.
        labels.push(labels.shift());
        durations.push(durations.shift());

        const columns = durations.map((d, i) => {
            const size = maxDuration === 0 ? 0 : d.durationSum / maxDuration;
            const count = d.activities.length;
            const title = count === 0 ?
                'No activities' :
                `${count} ${count === 1 ? 'activity' : 'activities'}: ${duration(d.durationSum)}`;
            return (
                <td key={i} title={title}>
                    <div className="day-table-header">{labels[i]}</div>
                    <div
                        className="day-table-circle"
                        style={{ transform: `scale(${size})` }}
                    />
                </td>
            );
        });

        return (
            <table className="day-table">
                <tbody>
                    <tr>{columns}</tr>
                </tbody>
            </table>
        );
    }
}

export function sumTagDurations(activities) {
    return activities.reduce((obj, activity) => {
        for (let tag of activity.tags) {
            const value = activity.finished_at.getTime() - activity.started_at.getTime();
            if (typeof obj[tag] === 'undefined') {
                obj[tag] = value;
            } else {
                obj[tag] += value;
            }
        }
        return obj;
    }, {});
}

export class ActivityStats extends React.Component {
    static propTypes = {
        dispatch: React.PropTypes.func.isRequired,
        activities: React.PropTypes.arrayOf(activityPropType).isRequired,
        loading: React.PropTypes.bool.isRequired,
    }

    constructor(props) {
        super(props);
        this.state = { selectedTags: new Set() };
    }

    componentDidMount() {
        this.props.dispatch(fetchActivities(date(diffDays(new Date(), -30)), date(new Date())));
    }

    toggleTag = (tagName) => {
        const selectedTags = new Set(this.state.selectedTags);
        if (this.state.selectedTags.has(tagName)) {
            selectedTags.delete(tagName);
        } else {
            selectedTags.add(tagName);
        }
        this.setState({ selectedTags });
    }

    render() {
        if (this.props.loading) {
            return <span>Loading...</span>;
        }
        if (this.props.activities.length === 0) {
            return <span>No data yet</span>;
        }
        const allActivities = this.props.activities;
        const allTagsObj = sumTagDurations(allActivities);
        const activities = (this.state.selectedTags.size === 0) ? allActivities :
            allActivities.filter(activity => Array.from(this.state.selectedTags).every(tag => activity.tags.includes(tag)));
        const tagsObj = sumTagDurations(activities);
        const tags = [];
        for (let tag in allTagsObj) {
            tags.push({
                name: tag,
                duration: tagsObj[tag] || 0,
                totalDuration: allTagsObj[tag],
            });
        }
        tags.sort((a, b) => b.totalDuration - a.totalDuration);
        const maxDuration = Math.max.apply(null, tags.map(tag => tag.duration));
        return (
            <div>
                <DayDonut activities={activities} />
                <DayTable activities={activities} />
                <table className="activity-stats">
                    <tbody>
                        {tags.map(tag => (
                            <tr
                                key={tag.name}
                                onClick={() => { this.toggleTag(tag.name); }}
                                className={'activity-stats-container' + (this.state.selectedTags.has(tag.name) ? ' selected' : '')}
                            >
                                <th className="activity-stats-title">{tag.name}</th>
                                <td className="activity-stats-duration">
                                    <div
                                        className="activity-stats-bar"
                                        style={{ width: `${maxDuration === 0 ? 0 : tag.duration / maxDuration * 100}%` }}
                                    >
                                        {duration(tag.duration)}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    }
}

function mapStateToProps(state) {
    const fromDate = diffDays(new Date(), -30);
    return {
        activities: Object.values(state.activities.activities)
            .filter(activity => activity.finished_at && activity.started_at > fromDate),
        loading: false,
    };
}

export default connect(mapStateToProps)(ActivityStats);
