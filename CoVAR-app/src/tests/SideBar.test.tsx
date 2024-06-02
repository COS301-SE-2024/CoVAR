import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Sidebar from '../sidebar/sidebar';

// Mock firebase/app
// jest.mock('firebase/app', () => ({
//     __esModule: true,
//     initializeApp: jest.fn(),
// }));

// // Mock firebase/auth
// jest.mock('firebase/auth', () => ({
//     __esModule: true,
//     getAuth: jest.fn().mockReturnValue({
//         onAuthStateChanged: jest.fn(),
//     }),
//     GoogleAuthProvider: jest.fn().mockImplementation(() => ({})), // Mock GoogleAuthProvider
// }));

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