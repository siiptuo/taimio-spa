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
        expect(result.props.className).toBe('current-activity-display no-activity');
        expect(result.props.children).toEqual([
            <div className="current-activity-status" />,
            <div className="current-activity">No activity</div>,
            <button type="submit" disabled={true}>&#10003; Complete</button>,
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
            <div className="current-activity-status" />,
            <div className="current-activity">
                <div className="current-activity-title">
                    Hello world
                    <ul className="tag-list">
                        <li key="taimio">taimio</li>
                        <li key="test">test</li>
                    </ul>
                </div>
                <div className="current-activity-duration">
                    <Duration startTime={testActivity.started_at} endTime={null} />
                </div>
            </div>,
            <button type="submit" disabled={false}>&#10003; Complete</button>
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
        const mockDispatch = jest.genMockFunction();
        const currentActivity = ReactTestUtils.renderIntoDocument(
            <CurrentActivity loading={false} activity={testActivity} dispatch={mockDispatch} />
        );
        ReactTestUtils.Simulate.submit(ReactDOM.findDOMNode(currentActivity));
        expect(mockDispatch.mock.calls.length).toBe(2);
    });
});
