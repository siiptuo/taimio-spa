jest.dontMock('../src/ActivitySwitcher');
jest.dontMock('../src/activity');

import React from 'react';
import ReactDOM from 'react-dom';
import ReactTestUtils from 'react-addons-test-utils';

const ActivitySwitcher = require('../src/ActivitySwitcher').default;

describe('ActivitySwitcher', () => {
    it('displays normally', () => {
        const renderer = ReactTestUtils.createRenderer();
        renderer.render(<ActivitySwitcher loading={false} />);
        const result = renderer.getRenderOutput();

        expect(result.type).toBe('form');
        expect(result.props.className).toBe('start-activity-form');
        expect(result.props.children).toEqual([
            <input type="text"
                placeholder="Activity title #tag1 #tag2"
                value=""
                onChange={result.props.children[0].props.onChange}
                disabled={false}
            />,
            <button type="submit" disabled={false}>Start</button>
        ]);
    });

    it('handles click', () => {
        const mockActivityStart = jest.genMockFunction();
        const activitySwitcher = ReactTestUtils.renderIntoDocument(
            <ActivitySwitcher loading={false} onActivityStart={mockActivityStart} />
        );

        const input = ReactTestUtils.findRenderedDOMComponentWithTag(activitySwitcher, 'input');
        input.value = 'Hello World #tiima';
        ReactTestUtils.Simulate.change(input);
        ReactTestUtils.Simulate.submit(ReactDOM.findDOMNode(activitySwitcher));

        expect(mockActivityStart).toBeCalled();
        const activity = mockActivityStart.mock.calls[0][0];
        expect(activity.title).toBe('Hello World');
        expect(activity.tags).toEqual(['tiima']);
        // expect(activity.started_at).toBe();
        expect(activity.finished_at).toBeNull();

        expect(input.value).toBe('');
    });
});
