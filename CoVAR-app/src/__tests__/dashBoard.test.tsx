import React from 'react';
import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import Dashboard from '../app/(pages)/dashboard/page';

class MockResizeObserver {
    observe = jest.fn();
    unobserve = jest.fn();
    disconnect = jest.fn();
}

global.ResizeObserver = MockResizeObserver;

describe('Dashboard Component', () => {
    test('renders example charts and list', () => {
        render(<div style={{ minWidth: '300px', minHeight: '300px' }}>
            <Dashboard />
        </div>);
    });
});