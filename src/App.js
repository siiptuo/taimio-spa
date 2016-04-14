import React from 'react';
import { Link, IndexLink } from 'react-router';

import * as auth from './auth';

export default class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = { loggedIn: auth.isLoggedIn() };
        auth.setOnChange(this.handleOnChange.bind(this));
    }

    handleOnChange(loggedIn) {
        this.setState({ loggedIn });
    }

    render() {
        return (
            <div>
                <header>
                    <nav>
                        <ul className="tabs">
                            <IndexLink to="/" activeClassName="selected">Main</IndexLink>
                            <Link to="/list" activeClassName="selected">List</Link>
                            <Link to="/stats" activeClassName="selected">Stats</Link>
                            {this.state.loggedIn ?
                                <Link to="/logout" activeClassName="selected" style={{ float: 'right' }}>Logout</Link> :
                                <Link to="/login" activeClassName="selected" style={{ float: 'right' }}>Login</Link>}
                        </ul>
                    </nav>
                </header>
                <section>
                    {this.props.children}
                </section>
            </div>
        );
    }
}

App.propTypes = {
    children: React.PropTypes.element,
};
