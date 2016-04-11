import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, IndexRoute, browserHistory } from 'react-router';

import App from './App';
import Main from './Main';
import List from './List';
import ActivityStats from './ActivityStats';
import ActivityEditor from './ActivityEditor';

ReactDOM.render(
    <Router history={browserHistory}>
        <Route path="/" component={App}>
            <IndexRoute component={Main} />
            <Route path="/list" component={List} />
            <Route path="/stats" component={ActivityStats} />
            <Route path="/activity/:id" component={ActivityEditor} />
        </Route>
    </Router>,
    document.getElementById('app')
);
