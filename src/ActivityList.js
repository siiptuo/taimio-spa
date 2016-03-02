import React from 'react';
import {duration, time} from './filters';

const shortTimeFormat = new Intl.DateTimeFormat(navigator.language, {
    hour: 'numeric',
    minute: 'numeric'
});

export default class ActivityList extends React.Component {
    render() {
        return (
            <table className="activity-list">
                <tbody>
                    {this.props.activities.map(activity => (
                        <tr key={activity.id} onClick={this.props.onActivityClick.bind(null, activity)}>
                            <td className="activity-list-time-column">{shortTimeFormat.format(activity.started_at)}</td>
                            <td className="activity-list-time-column">-</td>
                            <td className="activity-list-time-column">
                                {activity.finished_at === null ? '' : shortTimeFormat.format(activity.finished_at)}
                            </td>
                            <td className="activity-list-title-column">
                                {activity.title}
                                <ul className="tag-list">
                                    {Array.isArray(activity.tags) ? activity.tags.map(tag => <li key={tag}>{tag}</li>) : null}
                                </ul>
                            </td>
                            <td className="activity-list-duration-column">
                                {duration(activity.started_at, activity.finished_at)}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        );
    }
}
