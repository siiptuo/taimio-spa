import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, IndexRoute, browserHistory } from 'react-router';
import { createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import thunkMiddleware from 'redux-thunk';

import taimioStore from './reducers';
import * as auth from './auth';

import App from './App';
import Main from './Main';
import List from './List';
import ActivityStats from './ActivityStats';
import ActivityEditor from './ActivityEditor';
import Login from './Login';
import Logout from './Logout';

// Polyfills
import "babel-polyfill";
import 'whatwg-fetch';
if (!window.Intl) {
    require('intl');
    require('intl/locale-data/jsonp/en.js');
}

// Remove tap delay in iOS standalone mode (add to home screen).
if (window.navigator.standalone) {
    require('react-fastclick')();
}

function requireAuth(nextState, replace) {
    if (!auth.isLoggedIn()) {
        replace({
            pathname: '/login',
            state: { nextPathname: nextState.location.pathname },
        });
    }
}

const logger = store => next => action => {
    console.group(action.type);
    console.info('dispatching', action);
    const result = next(action);
    console.log('next state', store.getState());
    console.groupEnd(action.type);
    return result;
};

const store = createStore(taimioStore, applyMiddleware(thunkMiddleware, logger));

ReactDOM.render(
    <Provider store={store}>
        <Router history={browserHistory}>
            <Route path="/" component={App}>
                <IndexRoute component={Main} onEnter={requireAuth} />
                <Route path="/list" component={List} onEnter={requireAuth} />
                <Route path="/stats" component={ActivityStats} onEnter={requireAuth} />
                <Route path="/activity/:id" component={ActivityEditor} onEnter={requireAuth} />
                <Route path="/login" component={Login} />
                <Route path="/logout" component={Logout} />
            </Route>
        </Router>
    </Provider>,
    document.getElementById('app')
);
