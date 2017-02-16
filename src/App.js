import React from 'react';
import { Link, IndexLink } from 'react-router';

import * as auth from './auth';

export default class App extends React.Component {
    static propTypes = {
        children: React.PropTypes.element,
    }

    constructor(props) {
        super(props);
        this.state = {
            loggedIn: auth.isLoggedIn(),
            menuOpen: false,
        };
        auth.setOnChange(this.handleOnChange);
    }

    handleOnChange = (loggedIn) => {
        this.setState({ loggedIn });
    }

    handleMenuToggleClick = () => {
        this.setState({ menuOpen: !this.state.menuOpen });
    }

    handleMenuItemClick = () => {
        this.setState({ menuOpen: false });
    }

    render() {
        return (
            <div>
                <header>
                    <nav>
                        <div className="nav-top">
                            <img src="/logo-white.svg" alt="Taimio" />
                            <a
                                href="javascript:void(0)"
                                className="item-icon item-menu"
                                onClick={this.handleMenuToggleClick}
                            >
                                Menu
                            </a>
                        </div>
                        <div className={'nav-items' + (this.state.menuOpen ? ' open' : '')}>
                            <IndexLink to="/" activeClassName="selected" className="item-icon item-main" onClick={this.handleMenuItemClick}>Main</IndexLink>
                            <Link to="/list" activeClassName="selected" className="item-icon item-list" onClick={this.handleMenuItemClick}>List</Link>
                            <Link to="/stats" activeClassName="selected" className="item-icon item-stats" onClick={this.handleMenuItemClick}>Stats</Link>
                            <div className="spacer" />
                            {this.state.loggedIn ?
                                <Link to="/logout" activeClassName="selected" style={{ float: 'right' }} onClick={this.handleMenuItemClick}>Logout</Link> :
                                <Link to="/login" activeClassName="selected" style={{ float: 'right' }} onClick={this.handleMenuItemClick}>Login</Link>}
                        </div>
                    </nav>
                </header>
                <section>
                    {this.props.children}
                </section>
            </div>
        );
    }
}
