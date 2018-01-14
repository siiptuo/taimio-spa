import React from 'react';
import ReactDOM from 'react-dom';
import { createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import thunkMiddleware from 'redux-thunk';

import taimioStore from './reducers';
import * as auth from './auth';

import App from './App';

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
        <App />
    </Provider>,
    document.getElementById('app')
);
