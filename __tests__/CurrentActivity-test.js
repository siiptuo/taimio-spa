jest.dontMock('../src/CurrentActivity');
jest.dontMock('../src/filters');

import React from 'react';
import ReactDOM from 'react-dom';
import ReactTestUtils from 'react-addons-test-utils';

const CurrentActivity = require('../src/CurrentActivity').default;

describe('CurrentActivity', () => {
    it('displays no activity', () => {
        const renderer = ReactTestUtils.createRenderer();
        renderer.render(<CurrentActivity />);
        const result = renderer.getRenderOutput();

        expect(result.type).toBe('form');
        expect(result.props.className).toBe('current-activity-display');
        expect(result.props.children).toEqual([
            <h1>No activity</h1>,
            <button type="submit" disabled={true}>Stop</button>
        ]);
    });

    it('displays activity activity', () => {
        const testActivity = {
            started_at: new Date(2016, 1, 1, 19, 45),
            finished_at: null,
            title: 'Hello world',
            tags: ['tiima', 'test'],
        };

        const _Date = Date;
        function MockDate() {
            return new _Date(2016, 1, 1, 20);
        }
        MockDate.prototype = _Date.prototype;
        Date = MockDate;

        const renderer = ReactTestUtils.createRenderer();
        renderer.render(<CurrentActivity activity={testActivity} />);
        const result = renderer.getRenderOutput();

        Date = _Date;

        expect(result.type).toBe('form');
        expect(result.props.className).toBe('current-activity-display');
        expect(result.props.children).toEqual([
            <h1>
                Hello world
                <ul className="tag-list">
                    <li key="tiima">tiima</li>
                    <li key="test">test</li>
                </ul>
                15min
            </h1>,
            <button type="submit" disabled={false}>Stop</button>
        ]);
    });

    it('changes after click', () => {
        const testActivity = {
            started_at: new Date(2016, 1, 1, 19, 45),
            finished_at: null,
            title: 'Hello world',
            tags: ['tiima', 'test'],
        };
        const mockActivityStop = jest.genMockFunction();
        const currentActivity = ReactTestUtils.renderIntoDocument(
            <CurrentActivity activity={testActivity} onActivityStop={mockActivityStop} />
        );
        ReactTestUtils.Simulate.submit(ReactDOM.findDOMNode(currentActivity));
        expect(mockActivityStop).toBeCalledWith(testActivity);
    });
});
