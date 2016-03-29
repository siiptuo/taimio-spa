import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, IndexRoute, hashHistory } from 'react-router';

import App from './App';
import Main from './Main';
import ActivityStats from './ActivityStats';
import ActivityEditor from './ActivityEditor';

ReactDOM.render(
    <Router history={hashHistory}>
        <Route path="/" component={App}>
            <IndexRoute component={Main} />
            <Route path="/stats" component={ActivityStats} />
            <Route path="/activity/:id" component={ActivityEditor} />
        </Route>
    </Router>,
    document.getElementById('app')
);
