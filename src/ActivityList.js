import React from 'react';
import Duration from './Duration';
import { propType as activityPropType } from './activity';

const shortTimeFormat = new Intl.DateTimeFormat(navigator.language, {
    hour: 'numeric',
    minute: 'numeric',
});

const ActivityList = (props) => (
    <table className="activity-list">
        <tbody>
            {props.activities.sort((a, b) => b.started_at - a.started_at).map(activity => (
                <tr key={activity.id} onClick={() => props.onActivityClick(activity)}>
                    <td className="activity-list-time-column">
                        {shortTimeFormat.format(activity.started_at)}
                    </td>
                    <td className="activity-list-time-column">-</td>
                    <td className="activity-list-time-column">
                        {activity.finished_at === null ?
                            '' :
                            shortTimeFormat.format(activity.finished_at)}
                    </td>
                    <td className="activity-list-title-column">
                        {activity.title}
                        <ul className="tag-list">
                            {Array.isArray(activity.tags) ?
                                activity.tags.map(tag => <li key={tag}>{tag}</li>) :
                                null}
                        </ul>
                    </td>
                    <td className="activity-list-duration-column">
                        <Duration startTime={activity.started_at} endTime={activity.finished_at} />
                    </td>
                </tr>
            ))}
        </tbody>
    </table>
);

ActivityList.propTypes = {
    activities: React.PropTypes.arrayOf(activityPropType).isRequired,
    onActivityClick: React.PropTypes.func.isRequired,
};

export default ActivityList;
