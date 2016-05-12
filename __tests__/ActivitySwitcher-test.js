jest.dontMock('../src/ActivitySwitcher');
jest.dontMock('../src/activity');

import React from 'react';
import ReactDOM from 'react-dom';
import ReactTestUtils from 'react-addons-test-utils';
import { shallow } from 'enzyme';

const ActivitySwitcher = require('../src/ActivitySwitcher').default;

describe('ActivitySwitcher', () => {
    function renderComponent(loading = true, onActivityStart = jest.genMockFunction()) {
        return shallow(
            <ActivitySwitcher
                onActivityStart={onActivityStart}
                loading={loading}
            />
        );
    }

    it('is a form with correct class', () => {
        expect(renderComponent().is('form.start-activity-form')).toBe(true);
    });

    it('contains an activity input', () => {
        const input = renderComponent(false).find('input');
        expect(input.length).toBe(1);
        expect(input.prop('value')).toBe('');
        expect(input.prop('placeholder')).toBe('Activity title #tag1 #tag2');
        expect(input.prop('disabled')).toBe(false);
    });

    it('contains a start button', () => {
        const button = renderComponent(false).find('button');
        expect(button.length).toBe(1);
        expect(button.text()).toBe('Start');
        expect(button.prop('disabled')).toBe(false);
    });

    it('disables interaction when loading', () => {
        const wrapper = renderComponent(true);
        expect(wrapper.find('input').prop('disabled')).toBe(true);
        expect(wrapper.find('button').prop('disabled')).toBe(true);
    });

    it('creates a new activity on button click', () => {
        const mockActivityStart = jest.genMockFunction();
        const wrapper = renderComponent(false, mockActivityStart);

        wrapper.find('input').simulate('change', { target: { value: 'Hello World #tiima' } });
        wrapper.simulate('submit', { preventDefault: () => {} });

        expect(mockActivityStart).toBeCalled();
        const activity = mockActivityStart.mock.calls[0][0];
        expect(activity.title).toBe('Hello World');
        expect(activity.tags).toEqual(['tiima']);
        // expect(activity.started_at).toBe();
        expect(activity.finished_at).toBeNull();
    });

    it('does not accept empty input', () => {
        const mockActivityStart = jest.genMockFunction();
        const wrapper = renderComponent(false, mockActivityStart);

        wrapper.find('input').simulate('change', { target: { value: ' ' } });
        wrapper.simulate('submit', { preventDefault: () => {} });

        expect(mockActivityStart.mock.calls.length).toBe(0);
    });
});
