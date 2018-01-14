import React from 'react';

import * as auth from './auth';

export default class Logout extends React.Component {
  componentDidMount() {
    auth.logout();
  }

  render() {
    return <p>Logged out</p>;
  }
}
