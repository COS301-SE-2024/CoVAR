import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import '@testing-library/jest-dom/extend-expect';
import Sidebar from '../sidebar/sidebar';
import { doSignOut } from '../firebase/auth';

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
        <Sidebar role={'admin'} onSignOut={doSignOut}/>
      </Router>
    );

    // Check that each menu item is rendered
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Account')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();
  });

  

 
})