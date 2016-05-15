import React from 'react';

import * as auth from './auth';

export default class Login extends React.Component {
    constructor(props) {
        super(props);

        this.state = { error: null };

        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleSubmit(event) {
        event.preventDefault();

        auth.login(this.refs.username.value, this.refs.password.value)
            .then(() => {
                if (this.props.location.state && this.props.location.state.nextPathname) {
                    this.context.router.replace(this.props.location.state.nextPathname);
                } else {
                    this.context.router.replace('/');
                }
            })
            .catch(error => {
                console.error(error);
                this.setState({ error: 'Failed!' });
            });
    }

    render() {
        return (
            <div>
                <form onSubmit={this.handleSubmit}>
                    <input ref="username" placeholder="Username" />
                    <input ref="password" type="password" placeholder="Password" />
                    {this.state.error && <p className="error">{this.state.error}</p>}
                    <button type="submit">Login</button>
                </form>
            </div>
        );
    }
}

Login.contextTypes = {
    router: React.PropTypes.object,
};

Login.propTypes = {
    location: React.PropTypes.object,
};
