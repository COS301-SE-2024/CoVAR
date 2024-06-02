import React from 'react';
import { render, screen } from '@testing-library/react';
import Dashboard from '../dashboard/dashboard';

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