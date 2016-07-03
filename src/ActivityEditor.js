import React from 'react';
import { connect } from 'react-redux';

import { localDateTime } from './filters';
import * as activity from './activity';
import { updateActivity, resumeActivity, removeActivity } from './actions';

function parseLocalDate(input) {
    return new Date(input.replace(/-/g, '/').replace('T', ' '));
}

export class ActivityEditor extends React.Component {
    constructor(props) {
        super(props);
        const { activity } = props;
        const ongoing = activity.finished_at == null;
        this.state = {
            loading: false,
            ongoing,
            loading: false,
            started_at: localDateTime(activity.started_at),
            finished_at: localDateTime(ongoing ? new Date() : activity.finished_at),
            input: activity.title + (activity.tags.length > 0 ? ' #' + activity.tags.join(' #') : ''),
        };
        this.onStartedAtChange = this.onStartedAtChange.bind(this);
        this.onFinishedAtChange = this.onFinishedAtChange.bind(this);
        this.onOngoingChange = this.onOngoingChange.bind(this);
        this.onInputChange = this.onInputChange.bind(this);
        this.onSave = this.onSave.bind(this);
        this.onCancel = this.onCancel.bind(this);
        this.onResume = this.onResume.bind(this);
        this.onRemove = this.onRemove.bind(this);
    }

    componentDidMount() {
    }

    onStartedAtChange(event) {
        this.setState({
            started_at: event.target.value,
            finished_at: this.state.finished_at,
            ongoing: this.state.ongoing,
            input: this.state.input,
            loading: this.state.loading,
        });
    }

    onFinishedAtChange(event) {
        this.setState({
            started_at: this.state.started_at,
            finished_at: event.target.value,
            ongoing: this.state.ongoing,
            input: this.state.input,
            loading: this.state.loading,
        });
    }

    onOngoingChange(event) {
        this.setState({
            started_at: this.state.started_at,
            finished_at: this.state.finished_at,
            ongoing: event.target.checked,
            input: this.state.input,
            loading: this.state.loading,
        });
    }

    onInputChange(event) {
        this.setState({
            started_at: this.state.started_at,
            finished_at: this.state.finished_at,
            ongoing: this.state.ongoing,
            input: event.target.value,
            loading: this.state.loading,
        });
    }

    onSave(event) {
        event.preventDefault();
        const { title, tags } = activity.parseInput(this.state.input);
        this.props.dispatch(updateActivity({
            id: this.props.activity.id,
            title,
            tags,
            started_at: parseLocalDate(this.state.started_at),
            finished_at: this.state.ongoing ? null : parseLocalDate(this.state.finished_at),
        }));
        this.context.router.push('/');
    }

    onCancel(event) {
        event.preventDefault();
        this.context.router.push('/');
    }

    onResume(event) {
        event.preventDefault();
        this.props.dispatch(resumeActivity(this.props.activity.id));
        this.context.router.push('/');
    }

    onRemove(event) {
        event.preventDefault();
        this.props.dispatch(removeActivity(this.props.activity.id));
        this.context.router.push('/');
    }

    render() {
        if (this.state.loading) {
            return <div>Loading...</div>;
        }
        return (
            <form>
                <label>
                    Start time:
                    <input
                        type="datetime-local"
                        step="1"
                        value={this.state.started_at}
                        onChange={this.onStartedAtChange}
                    />
                </label>
                <label>
                    End time:
                    <input
                        type="datetime-local"
                        step="1"
                        value={this.state.finished_at}
                        disabled={this.state.ongoing}
                        onChange={this.onFinishedAtChange}
                    />
                </label>
                <label>
                    <input
                        type="checkbox"
                        checked={this.state.ongoing}
                        onChange={this.onOngoingChange}
                    />
                    Ongoing
                </label>
                <label>
                    Activity:
                    <input
                        type="text" value={this.state.input}
                        onChange={this.onInputChange}
                    />
                </label>
                <div className="action-area">
                    <button onClick={this.onCancel}>Cancel</button>
                    <button onClick={this.onRemove}>Remove</button>
                    {this.props.activity.finished_at ?
                        <button onClick={this.onResume}>Resume</button> :
                        null}
                    <button onClick={this.onSave}>Save</button>
                </div>
            </form>
        );
    }
}

ActivityEditor.contextTypes = {
    router: React.PropTypes.object,
};

ActivityEditor.propTypes = {
    params: React.PropTypes.object.isRequired,
    activity: React.PropTypes.object.isRequired,
    dispatch: React.PropTypes.func.isRequired,
};

function mapStateToProps(state, ownProps) {
    return {
        activity: state.activities.activities.find(a => a.id == ownProps.params.id),
    };
}

export default connect(mapStateToProps)(ActivityEditor);
