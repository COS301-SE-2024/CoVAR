import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import '@testing-library/jest-dom/extend-expect';
import Sidebar from '../sidebar/sidebar';

// Mock Firebase services
jest.mock('firebase/app', () => ({
  initializeApp: jest.fn(),
}));

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({
    currentUser: {
      email: 'test@example.com',
    },
    signOut: jest.fn(),
  })),
  GoogleAuthProvider: jest.fn(),
}));

jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(),
}));

// Mock the useAuth hook
jest.mock('../contexts/authContext/index', () => ({
  useAuth: jest.fn(() => ({
    currentUser: { email: 'test@example.com' },
    userLoggedIn: true,
    loading: false,
  })),
}));

// Mock the useNavigate hook from react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

const mockNavigate = jest.requireMock('react-router-dom').useNavigate;

describe('Sidebar Component', () => {
  beforeEach(() => {
    mockNavigate.mockReset();
  });

  test('renders the sidebar with all menu items', () => {
    render(
      <Router>
        <Sidebar />
      </Router>
    );

    // Check that each menu item is rendered
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Evaluate')).toBeInTheDocument();
    expect(screen.getByText('Account')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('Admin Tools')).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();
  });

  test('navigates to correct route when menu items are clicked', () => {
    render(
      <Router>
        <Sidebar />
      </Router>
    );

    // Simulate clicks on the menu items
    fireEvent.click(screen.getByText('Dashboard'));
    expect(mockNavigate).toHaveBeenCalledWith('/');

    fireEvent.click(screen.getByText('Evaluate'));
    expect(mockNavigate).toHaveBeenCalledWith('/evaluate');

    fireEvent.click(screen.getByText('Account'));
    expect(mockNavigate).toHaveBeenCalledWith('/account');

    fireEvent.click(screen.getByText('Settings'));
    expect(mockNavigate).toHaveBeenCalledWith('/settings');

    fireEvent.click(screen.getByText('Admin Tools'));
    expect(mockNavigate).toHaveBeenCalledWith('/admin-tools');
  });

  test('displays LockIcon and title', () => {
    render(
      <Router>
        <Sidebar />
      </Router>
    );

    expect(screen.getByText('CoVAR')).toBeInTheDocument();
    expect(screen.getByTestId('LockIcon')).toBeInTheDocument();
  });
});
