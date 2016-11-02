import React from 'react';
import ReactDOM from 'react-dom';
import ReactTestUtils from 'react-addons-test-utils';
import { shallow } from 'enzyme';

const ActivitySwitcher = require('../src/ActivitySwitcher').ActivitySwitcher;

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

        wrapper.find('input').simulate('change', { target: { value: 'Hello World #taimio' } });
        wrapper.simulate('submit', { preventDefault: () => {} });

        expect(mockActivityStart).toBeCalledWith('Hello World', ['taimio']);
    });

    it('does not accept empty input', () => {
        const mockActivityStart = jest.genMockFunction();
        const wrapper = renderComponent(false, mockActivityStart);

        wrapper.find('input').simulate('change', { target: { value: ' ' } });
        wrapper.simulate('submit', { preventDefault: () => {} });

        expect(mockActivityStart.mock.calls.length).toBe(0);
    });
});
