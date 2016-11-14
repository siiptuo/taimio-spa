import React from 'react';
import { Link, IndexLink } from 'react-router';

import * as auth from './auth';

export default class App extends React.Component {
    static propTypes = {
        children: React.PropTypes.element,
    }

    constructor(props) {
        super(props);
        this.state = { loggedIn: auth.isLoggedIn() };
        auth.setOnChange(this.handleOnChange);
    }

    handleOnChange = (loggedIn) => {
        this.setState({ loggedIn });
    }

    render() {
        return (
            <div>
                <header>
                    <nav>
                        <img src="/logo-white.svg" alt="Taimio" />
                        <IndexLink to="/" activeClassName="selected" className="item-icon item-main">Main</IndexLink>
                        <Link to="/list" activeClassName="selected" className="item-icon item-list">List</Link>
                        <Link to="/stats" activeClassName="selected" className="item-icon item-stats">Stats</Link>
                        <div className="spacer" />
                        {this.state.loggedIn ?
                            <Link to="/logout" activeClassName="selected" style={{ float: 'right' }}>Logout</Link> :
                            <Link to="/login" activeClassName="selected" style={{ float: 'right' }}>Login</Link>}
                    </nav>
                </header>
                <section>
                    {this.props.children}
                </section>
            </div>
        );
    }
}
