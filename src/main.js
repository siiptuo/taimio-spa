import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, IndexRoute, browserHistory } from 'react-router';

import App from './App';
import Main from './Main';
import List from './List';
import ActivityStats from './ActivityStats';
import ActivityEditor from './ActivityEditor';
import Login from './Login';
import Logout from './Logout';

import * as auth from './auth';

function requireAuth(nextState, replace) {
    if (!auth.isLoggedIn()) {
        replace({
            pathname: '/login',
            state: { nextPathname: nextState.location.pathname },
        });
    }
}

ReactDOM.render(
    <Router history={browserHistory}>
        <Route path="/" component={App}>
            <IndexRoute component={Main} onEnter={requireAuth} />
            <Route path="/list" component={List} onEnter={requireAuth} />
            <Route path="/stats" component={ActivityStats} onEnter={requireAuth} />
            <Route path="/activity/:id" component={ActivityEditor} onEnter={requireAuth} />
            <Route path="/login" component={Login} />
            <Route path="/logout" component={Logout} />
        </Route>
    </Router>,
    document.getElementById('app')
);
