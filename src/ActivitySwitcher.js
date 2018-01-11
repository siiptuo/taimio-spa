import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { startActivity } from './actions';

import * as activity from './activity';

export class ActivitySwitcher extends React.Component {
    static propTypes = {
        onActivityStart: PropTypes.func.isRequired,
        loading: PropTypes.bool.isRequired,
    }

    constructor(props) {
        super(props);
        this.state = { input: '' };
    }

    handleInputChange = (event) => {
        this.setState({ input: event.target.value });
    }

    handleSubmit = (event) => {
        event.preventDefault();
        const input = this.state.input.trim();
        if (!input) {
            return;
        }
        const { title, tags } = activity.parseInput(input);
        this.props.onActivityStart(title, tags);
        this.setState({ input: '' });
    }

    render() {
        return (
            <form className="start-activity-form" onSubmit={this.handleSubmit}>
                <input
                    type="text"
                    placeholder="Activity title #tag1 #tag2"
                    value={this.state.input}
                    onChange={this.handleInputChange}
                    disabled={this.props.loading}
                />
                <button type="submit" disabled={this.props.loading}>&#9654;</button>
            </form>
        );
    }
}

function mapStateToProps(state) {
    return {
        loading: state.activities.isFetching,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        onActivityStart(title, tags) {
            dispatch(startActivity(title, tags));
        },
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(ActivitySwitcher);
