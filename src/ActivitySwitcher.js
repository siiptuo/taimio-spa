import React from 'react';
import { connect } from 'react-redux';
import { startActivity } from './actions';

import * as activity from './activity';

export class ActivitySwitcher extends React.Component {
    constructor(props) {
        super(props);
        this.state = { input: '' };
        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleInputChange(event) {
        this.setState({ input: event.target.value });
    }

    handleSubmit(event) {
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
                <input type="text"
                    placeholder="Activity title #tag1 #tag2"
                    value={this.state.input}
                    onChange={this.handleInputChange}
                    disabled={this.props.loading}
                />
                <button type="submit" disabled={this.props.loading}>Start</button>
            </form>
        );
    }
}

ActivitySwitcher.propTypes = {
    onActivityStart: React.PropTypes.func.isRequired,
    loading: React.PropTypes.bool.isRequired,
};

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
