import React from 'react';
import PropTypes from 'prop-types';

import * as auth from './auth';
import Logo from '../images/taimio.svg';

export default class Login extends React.Component {
  static propTypes = {
    location: PropTypes.object,
  };

  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  handleSubmit = event => {
    event.preventDefault();

    auth
      .login(this.refs.username.value, this.refs.password.value)
      .then(() => {
        if (
          this.props.location.state &&
          this.props.location.state.nextPathname
        ) {
          this.props.history.replace(this.props.location.state.nextPathname);
        } else {
          this.props.history.replace('/');
        }
      })
      .catch(error => {
        console.error(error);
        this.setState({ error: 'Failed!' });
      });
  };

  render() {
    return (
      <form className="login-form" onSubmit={this.handleSubmit}>
        <img src={Logo} alt="Taimio" />
        <input ref="username" placeholder="Username" />
        <input ref="password" type="password" placeholder="Password" />
        {this.state.error && <p className="error">{this.state.error}</p>}
        <button type="submit">Login</button>
      </form>
    );
  }
}
