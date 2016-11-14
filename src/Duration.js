import React from 'react';
import { duration } from './filters';

export default class Duration extends React.Component {
    static propTypes = {
        startTime: React.PropTypes.instanceOf(Date),
        endTime: React.PropTypes.instanceOf(Date),
    }

    constructor(props) {
        super(props);
        if (!this.props.endTime) {
            this.interval = setInterval(() => { this.forceUpdate(); }, 1000);
        }
    }

    componentWillUnmount() {
        clearInterval(this.interval);
    }

    render() {
        return (
            <span>
                {duration(this.props.startTime, this.props.endTime, !this.props.endTime)}
            </span>
        );
    }
}
