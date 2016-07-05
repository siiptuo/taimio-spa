jest.dontMock('../src/CurrentActivity');
jest.dontMock('../src/Duration');
jest.dontMock('../src/filters');

import React from 'react';
import ReactDOM from 'react-dom';
import ReactTestUtils from 'react-addons-test-utils';

const CurrentActivity = require('../src/CurrentActivity').CurrentActivity;
const Duration = require('../src/Duration').default;

describe('CurrentActivity', () => {
    it('displays no activity', () => {
        const renderer = ReactTestUtils.createRenderer();
        renderer.render(<CurrentActivity loading={false} />);
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
            tags: ['taimio', 'test'],
        };

        const renderer = ReactTestUtils.createRenderer();
        renderer.render(<CurrentActivity loading={false} activity={testActivity} />);
        const result = renderer.getRenderOutput();

        expect(result.type).toBe('form');
        expect(result.props.className).toBe('current-activity-display');
        expect(result.props.children).toEqual([
            <h1>
                Hello world
                <ul className="tag-list">
                    <li key="taimio">taimio</li>
                    <li key="test">test</li>
                </ul>
                <Duration startTime={testActivity.started_at} endTime={null} />
            </h1>,
            <button type="submit" disabled={false}>Stop</button>
        ]);
    });

    it('changes after click', () => {
        const testActivity = {
            id: 1,
            started_at: new Date(2016, 1, 1, 19, 45),
            finished_at: null,
            title: 'Hello world',
            tags: ['taimio', 'test'],
        };
        const mockActivityStop = jest.genMockFunction();
        const currentActivity = ReactTestUtils.renderIntoDocument(
            <CurrentActivity loading={false} activity={testActivity} onActivityStop={mockActivityStop} />
        );
        ReactTestUtils.Simulate.submit(ReactDOM.findDOMNode(currentActivity));
        expect(mockActivityStop).toBeCalledWith(1);
    });
});
