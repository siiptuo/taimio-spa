import React from 'react';
import { connect } from 'react-redux';

import { duration } from './filters';

import { fetchActivitiesIfNeeded } from './actions';

export class ActivityStats extends React.Component {
    componentDidMount() {
        this.props.dispatch(fetchActivitiesIfNeeded());
    }

    render() {
        console.log(this.props);
        if (this.props.loading) {
            return <span>Loading...</span>;
        }
        if (this.props.activities.length === 0) {
            return <span>No data yet</span>;
        }
        const tagsObj = this.props.activities.reduce((obj, activity) => {
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
        const tags = [];
        for (let tag in tagsObj) {
            tags.push({
                name: tag,
                duration: tagsObj[tag],
            });
        }
        tags.sort((a, b) => b.duration - a.duration);
        const maxDuration = tags[0].duration;
        return (
            <table className="activity-stats">
                <tbody>
                    {tags.map(tag => (
                        <tr key={tag.name}>
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
