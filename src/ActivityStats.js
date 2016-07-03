import React from 'react';
import { connect } from 'react-redux';

import { duration } from './filters';

import { fetchActivitiesIfNeeded } from './actions';

function countActivitiesByHour(activities) {
    const hours = new Array(24).fill(0);
    for (const activity of activities) {
        hours[activity.started_at.getHours()]++;
    }
    return hours;
}

class DayDonut extends React.Component {
    render() {
        const hours = countActivitiesByHour(this.props.activities);
        const maxHours = Math.max.apply(null, hours);
        const innerRadius = 0;
        const outerRadius = 100;
        const radius = (outerRadius + innerRadius) / 2;
        const center = 100;
        const paths = [];
        const delta = 360 / 24;
        for (let angle = -delta / 2; angle < 360; angle += delta) {
            paths.push([
                'M',
                center + radius * Math.cos((angle + delta - 90) * Math.PI / 180),
                center + radius * Math.sin((angle + delta - 90) * Math.PI / 180),
                'A',
                radius, radius, 0, 0, 0,
                center + radius * Math.cos((angle - 90) * Math.PI / 180),
                center + radius * Math.sin((angle - 90) * Math.PI / 180),
            ].join(' '));
        }
        return (
            <svg width={200} height={200}>
                {paths.map((path, i) => (
                    <g key={i} className="day-donut">
                        <path
                            d={path}
                            stroke="#4a90e2"
                            strokeWidth={outerRadius - innerRadius}
                            fill="none"
                            opacity={hours[i] / maxHours}
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

function sumTagDurations(activities) {
    return activities.reduce((obj, activity) => {
        for (let tag of activity.tags) {
            const finished_at = activity.finished_at != null ?
                activity.finished_at.getTime() :
                Date.now();
            const value = finished_at - activity.started_at.getTime();
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
    constructor(props) {
        super(props);
        this.state = { selectedTags: new Set() };
    }

    componentDidMount() {
        this.props.dispatch(fetchActivitiesIfNeeded());
    }

    toggleTag(tagName) {
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
                <table className="activity-stats">
                    <tbody>
                        {tags.map(tag => (
                            <tr
                                key={tag.name}
                                onClick={this.toggleTag.bind(this, tag.name)}
                                className={'activity-stats-container' + (this.state.selectedTags.has(tag.name) ? ' selected' : '')}
                            >
                                <th className="activity-stats-title">{tag.name}</th>
                                <td className="activity-stats-duration">
                                    <div
                                        className="activity-stats-bar"
                                        style={{ width: `${tag.duration / maxDuration * 100}%` }}
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

ActivityStats.propTypes = {
    dispatch: React.PropTypes.func.isRequired,
    activities: React.PropTypes.array.isRequired,
    loading: React.PropTypes.bool.isRequired,
};

function mapStateToProps(state) {
    return {
        activities: state.activities.activities,
        loading: state.activities.isFetching,
    };
}

export default connect(mapStateToProps)(ActivityStats);
