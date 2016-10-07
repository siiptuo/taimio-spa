import React from 'react';
import { connect } from 'react-redux';

import { fetchActivitiesIfNeeded } from './actions';
import { parseInput } from './activity';
import ActivitySummary from './ActivitySummary';
import { date } from './filters';

function getStartOfDay(date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function getEndOfDay(date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
}

function diffDays(date, days) {
    const newDate = new Date(date.getTime());
    newDate.setDate(newDate.getDate() + days);
    return newDate;
}

function getWeekday(date) {
    const weekday = date.getDay();
    return (weekday === 0 ? 7 : weekday) - 1;
}

function getWeekRange(date) {
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
    constructor(props) {
        super(props);
        this.handleSearchInput = this.handleSearchInput.bind(this);
        this.handleNextWeek = this.handleMove.bind(this, 7);
        this.handlePreviousWeek = this.handleMove.bind(this, -7);
    }

    componentDidMount() {
        this.props.dispatch(fetchActivitiesIfNeeded());
    }

    getLocationState() {
        let [start, end] = getWeekRange(new Date());

        if ('start' in this.props.location.query && 'end' in this.props.location.query) {
            start = getStartOfDay(new Date(this.props.location.query.start));
            end = getEndOfDay(new Date(this.props.location.query.end));
        }

        return { start, end, search: parseInput(this.props.location.query.search || '') };
    }

    handleSearchInput(event) {
        this.context.router.push({
            pathname: this.props.location.pathname,
            query: Object.assign({}, this.props.location.query, {
                search: event.target.value,
            }),
        });
    }

    handleMove(days) {
        const locationState = this.getLocationState();

        const startDate = new Date(locationState.start.getTime());
        startDate.setDate(startDate.getDate() + days);

        const endDate = new Date(locationState.end.getTime());
        endDate.setDate(endDate.getDate() + days);

        this.context.router.push({
            pathname: this.props.location.pathname,
            query: Object.assign({}, this.props.location.query, {
                start: date(startDate),
                end: date(endDate),
            }),
        });
    }

    render() {
        const { search, start: startDate, end: endDate } = this.getLocationState();

        const activities = this.props.activities
            .filter(activity => activity.title.includes(search.title) &&
                    search.tags.every(tag => activity.tags.includes(tag)));

        const dates = genDateRange(startDate, endDate).reverse();

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
                    <span className="start-date">{startDate.toLocaleDateString()}</span>
                    <span>-</span>
                    <span className="end-date">{endDate.toLocaleDateString()}</span>
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

List.contextTypes = {
    router: React.PropTypes.object,
};

List.propTypes = {
    dispatch: React.PropTypes.func.isRequired,
    activities: React.PropTypes.array.isRequired,
    loading: React.PropTypes.bool.isRequired,
    location: React.PropTypes.object.isRequired,
};

function mapStateToProps(state) {
    return {
        activities: state.activities.activities,
        loading: state.activities.isFetching,
    };
}

export default connect(mapStateToProps)(List);
