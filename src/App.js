import React from 'react';
import { Link, IndexLink } from 'react-router';

const App = (props) => (
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
            {props.children}
        </section>
    </div>
);

App.propTypes = {
    children: React.PropTypes.element,
};

export default App;
