import React from 'react';
import { Link, IndexLink } from 'react-router';

import ActivityEditor from './ActivityEditor';
import Main from './Main';
import ActivityStats from './ActivityStats';

export default class App extends React.Component {
    render() {
        return (
            <div>
                <header>
                    <nav>
                        <ul className="tabs">
                            <IndexLink to="/" activeClassName="selected">Main</IndexLink>
                            <Link to="/stats" activeClassName="selected">Stats</Link>
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
