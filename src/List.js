import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { fetchActivities } from './actions';
import { parseInput, propType as activityPropType } from './activity';
import ActivitySummary from './ActivitySummary';
import { date } from './filters';

function getStartOfDay(date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function getEndOfDay(date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
}

export function diffDays(date, days) {
    const newDate = new Date(date.getTime());
    newDate.setDate(newDate.getDate() + days);
    return newDate;
}

function getWeekday(date) {
    const weekday = date.getDay();
    return (weekday === 0 ? 7 : weekday) - 1;
}

export function getWeekRange(date) {
    const weekday = getWeekday(date);
    return [getStartOfDay(diffDays(date, -weekday)), getEndOfDay(diffDays(date, 6 - weekday))];
}

function genDateRange(startDate, endDate) {
    const dates = [];
    const date = new Date(startDate.getTime());
    while (date.getTime() < endDate.getTime()) {
        dates.push(new Date(date.getTime()));
        date.setDate(date.getDate() + 1);
    }
    return dates;
}

class List extends React.Component {
    static contextTypes = {
        router: PropTypes.object,
    }

    static propTypes = {
        dispatch: PropTypes.func.isRequired,
        activities: PropTypes.arrayOf(activityPropType).isRequired,
        loading: PropTypes.bool.isRequired,
        location: PropTypes.object.isRequired,
        startDate: PropTypes.instanceOf(Date).isRequired,
        endDate: PropTypes.instanceOf(Date).isRequired,
        search: PropTypes.object.isRequired,
    }

    componentDidMount() {
        this.props.dispatch(fetchActivities(date(this.props.startDate), date(this.props.endDate)));
    }

    handleSearchInput = (event) => {
        this.context.router.push({
            pathname: this.props.location.pathname,
            query: Object.assign({}, this.props.location.query, {
                search: event.target.value,
            }),
        });
    }

    handleMove = (days) => {
        const startDate = new Date(this.props.startDate.getTime());
        startDate.setDate(startDate.getDate() + days);

        const endDate = new Date(this.props.endDate.getTime());
        endDate.setDate(endDate.getDate() + days);

        this.context.router.push({
            pathname: this.props.location.pathname,
            query: Object.assign({}, this.props.location.query, {
                start: date(startDate),
                end: date(endDate),
            }),
        });

        this.props.dispatch(fetchActivities(date(startDate), date(endDate)));
    }

    handleNextWeek = () => this.handleMove(7)

    handlePreviousWeek = () => this.handleMove(-7)

    render() {
        const activities = this.props.activities
            .filter(activity => activity.title.includes(this.props.search.title) &&
                    this.props.search.tags.every(tag => activity.tags.includes(tag)));

        const dates = genDateRange(this.props.startDate, this.props.endDate).reverse();

        return (
            <div>
                <div className="search-container">
                    <input
                        type="search"
                        placeholder="Search activities by title and tags..."
                        value={this.props.location.query.search}
                        onInput={this.handleSearchInput}
                    />
                </div>
                <div className="date-filter">
                    <button onClick={this.handlePreviousWeek}>{'<'}</button>
                    <span className="start-date">{this.props.startDate.toLocaleDateString()}</span>
                    <span>-</span>
                    <span className="end-date">{this.props.endDate.toLocaleDateString()}</span>
                    <button onClick={this.handleNextWeek}>{'>'}</button>
                </div>
                {this.props.loading ? 'Loading...' : dates.map(date => {
                    const dateActivities = activities.filter(activity =>
                        activity.started_at.getTime() > getStartOfDay(date) &&
                        activity.started_at.getTime() < getEndOfDay(date));
                    return (
                        <ActivitySummary
                            key={date.getTime()}
                            activities={dateActivities}
                            date={date}
                        />
                    );
                })}
            </div>
        );
    }
}

function mapStateToProps(state, ownProps) {
    let [startDate, endDate] = getWeekRange(new Date());

    if ('start' in ownProps.location.query && 'end' in ownProps.location.query) {
        startDate = getStartOfDay(new Date(ownProps.location.query.start));
        endDate = getEndOfDay(new Date(ownProps.location.query.end));
    }

    const search = parseInput(ownProps.location.query.search || '');

    const range = state.activities.ranges[`${date(startDate)}-${date(endDate)}`];

    return {
        activities: Object.values(state.activities.activities),
        loading: !range,
        startDate,
        endDate,
        search,
    };
}

export default connect(mapStateToProps)(List);
