import React from 'react';

import {duration} from './filters';
import * as activity from './activity';

export default class ActivityStats extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            activities: [],
            loading: true,
        };
    }

    componentDidMount() {
        activity.apiList()
            .then(data => {
                this.setState({
                    activities: data,
                    loading: false,
                });
            })
            .catch(error => {
                alert('API error: ' + error.message);
                console.error('API error', error);
            });
    }

    render() {
        if (this.state.loading) {
            return <span>Loading...</span>;
        }
        const tagsObj = this.state.activities.reduce((obj, activity) => {
            // FIXME: sometimes API return tags in an object?
            if (!Array.isArray(activity.tags)) {
                return obj;
            }
            for (let tag of activity.tags) {
                const finished_at = activity.finished_at != null ? activity.finished_at.getTime() : Date.now();
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
                                <div className="activity-stats-bar" style={{width: `${tag.duration / maxDuration * 100}%`}}>
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
