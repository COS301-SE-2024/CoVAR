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

// // Mock firebase/firestore
// jest.mock('firebase/firestore', () => ({
//     __esModule: true,
//     getFirestore: jest.fn(),
// }));

// // Mock useAuth hook
// jest.mock('../firebase/firebaseConfig.js', () => ({
//     useAuth: jest.fn().mockReturnValue({
//         currentUser: { uid: '123', email: 'test@example.com' },
//         userLoggedIn: true,
//         loading: false,
//     }),
// }));

describe('Sidebar Component', () => {
    it('renders menu items correctly', () => {
        render(
            <MemoryRouter>
                <Sidebar />
            </MemoryRouter>
        );
        screen.debug();
        expect(screen.getByText('Dashboard')).toBeInTheDocument();
        expect(screen.getByText('Evaluate')).toBeInTheDocument();
        expect(screen.getByText('Account')).toBeInTheDocument();
        expect(screen.getByText('Settings')).toBeInTheDocument();
        expect(screen.getByText('Admin Tools')).toBeInTheDocument();
    });
});