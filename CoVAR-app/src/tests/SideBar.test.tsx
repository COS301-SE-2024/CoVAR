import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Sidebar from '../sidebar/sidebar';

// Mock Firebase services

jest.mock('../sidebar/components/userRole', () => ({
  __esModule: true, // this property makes it work
  default: jest.fn().mockReturnValue('admin'), // Mock the user role
}));

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

// // Mock the useNavigate hook from react-router-dom
// jest.mock('react-router-dom', () => ({
//   ...jest.requireActual('react-router-dom'),
//   useNavigate: jest.fn(),
// }));

// const mockNavigate = jest.requireMock('react-router-dom').useNavigate;

describe('Sidebar Component', () => {
  

  test('renders the sidebar with all menu items', () => {
    render(
      <Router>
        <Sidebar />
      </Router>
    );

    // Check that each menu item is rendered
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Account')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();
  });

  

 
});
