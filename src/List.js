import React from 'react';

import ActivitySummary from './ActivitySummary';

import * as activity from './activity';

export default class Main extends React.Component {
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
                this.timeUpdateInterval = setInterval(this.updateTime.bind(this), 15000);
            })
            .catch(error => {
                alert('API error: ' + error.message);
                console.error('API error', error);
            });
    }

    componentWillUnmount() {
        clearInterval(this.timeUpdateInterval);
    }

    updateTime() {
        this.forceUpdate();
    }

    render() {
        return (
            <div>
                <ActivitySummary
                    activities={this.state.activities}
                    loading={this.state.loading}
                    header="Tänään"
                />
            </div>
        );
    }
}
