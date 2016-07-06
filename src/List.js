import React from 'react';
import { connect } from 'react-redux';

import { fetchActivitiesIfNeeded } from './actions';
import { parseInput } from './activity';
import ActivitySummary from './ActivitySummary';

class List extends React.Component {
    constructor(props) {
        super(props);
        this.state = { title: '', tags: [] };
        this.handleSearchInput = this.handleSearchInput.bind(this);
    }

    componentDidMount() {
        this.props.dispatch(fetchActivitiesIfNeeded());
    }

    handleSearchInput(event) {
        this.setState(parseInput(event.target.value));
    }

    render() {
        const activities = this.props.activities
            .filter(activity => activity.title.includes(this.state.title) &&
                    this.state.tags.every(tag => activity.tags.includes(tag)));
        return (
            <div>
                <div className="search-container">
                    <input
                        type="search"
                        placeholder="Search activities by title and tags..."
                        value={this.state.search}
                        onInput={this.handleSearchInput}
                    />
                </div>
                <ActivitySummary
                    activities={activities}
                    loading={this.props.loading}
                />
            </div>
        );
    }
}

List.propTypes = {
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

export default connect(mapStateToProps)(List);
