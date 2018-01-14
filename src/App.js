import React from 'react';
import PropTypes from 'prop-types';
import { BrowserRouter, Switch, Route, NavLink, Redirect } from 'react-router-dom';

import Main from './Main';
import List from './List';
import ActivityStats from './ActivityStats';
import ActivityEditor from './ActivityEditor';
import Login from './Login';
import Logout from './Logout';

import * as auth from './auth';

const PrivateRoute = ({ component: Component, ...rest }) => (
    <Route {...rest} render={props => (
        auth.isLoggedIn() ? (
            <Component {...props} />
        ) : (
            <Redirect to={{
                pathname: '/login',
                state: { nextPathname: props.location },
            }} />
        )
    )} />
);

export default class App extends React.Component {
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
            <BrowserRouter>
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
                                <NavLink exact to="/" activeClassName="selected" className="item-icon item-main" onClick={this.handleMenuItemClick}>Main</NavLink>
                                <NavLink to="/list" activeClassName="selected" className="item-icon item-list" onClick={this.handleMenuItemClick}>List</NavLink>
                                <NavLink to="/stats" activeClassName="selected" className="item-icon item-stats" onClick={this.handleMenuItemClick}>Stats</NavLink>
                                <div className="spacer" />
                                {this.state.loggedIn ?
                                    <NavLink to="/logout" activeClassName="selected" style={{ float: 'right' }} onClick={this.handleMenuItemClick}>Logout</NavLink> :
                                    <NavLink to="/login" activeClassName="selected" style={{ float: 'right' }} onClick={this.handleMenuItemClick}>Login</NavLink>}
                            </div>
                        </nav>
                    </header>
                    <section>
                        <Switch>
                            <PrivateRoute exact path="/" component={Main} />
                            <PrivateRoute path="/list" component={List} />
                            <PrivateRoute path="/stats" component={ActivityStats} />
                            <PrivateRoute path="/activity/:id" component={ActivityEditor} />
                            <Route path="/login" component={Login} />
                            <Route path="/logout" component={Logout} />
                        </Switch>
                    </section>
                </div>
            </BrowserRouter>
        );
    }
}
