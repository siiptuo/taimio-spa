import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import Duration from './Duration';
import { propType as activityPropType } from './activity';

const shortTimeFormat = new Intl.DateTimeFormat(navigator.language, {
  hour: 'numeric',
  minute: 'numeric',
});

const ActivityList = props => (
  <ul className="activity-list">
    {props.activities
      .sort((a, b) => b.started_at - a.started_at)
      .map(activity => (
        <li key={activity.id}>
          <Link to={`/activity/${activity.id}`}>
            <span className="activity-list-time-column activity-list-time-start">
              {shortTimeFormat.format(activity.started_at)}
            </span>
            <span className="activity-list-time-column activity-list-time-separator">
              -
            </span>
            <span className="activity-list-time-column activity-list-time-end">
              {activity.finished_at === null
                ? ''
                : shortTimeFormat.format(activity.finished_at)}
            </span>
            <span className="activity-list-title-column">
              {activity.title}
              <ul className="tag-list">
                {Array.isArray(activity.tags)
                  ? activity.tags.map(tag => <li key={tag}>{tag}</li>)
                  : null}
              </ul>
            </span>
            <span className="activity-list-duration-column">
              <Duration
                startTime={activity.started_at}
                endTime={activity.finished_at}
              />
            </span>
          </Link>
        </li>
      ))}
  </ul>
);

ActivityList.propTypes = {
  activities: PropTypes.arrayOf(activityPropType).isRequired,
};

export default ActivityList;
