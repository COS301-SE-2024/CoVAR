// import React from 'react';
// import { render, fireEvent, waitFor } from '@testing-library/react';
// import Login from '../login/loginForm';
// import { doSignInWithEmailAndPassword } from '../firebase/auth';

// jest.mock('../sidebar/components/userRole', () => ({
//     __esModule: true, // this property makes it work
//     default: jest.fn().mockReturnValue('admin'), // Mock the user role
//   }));
  
//   jest.mock('firebase/app', () => ({
//     initializeApp: jest.fn(),
//   }));
  
//   jest.mock('firebase/auth', () => ({
//     getAuth: jest.fn(() => ({
//       currentUser: {
//         email: 'test@example.com',
//       },
//       signOut: jest.fn(),
//     })),
//     GoogleAuthProvider: jest.fn(),
//   }));
  
//   jest.mock('firebase/firestore', () => ({
//     getFirestore: jest.fn(),
//   }));

// describe('Login Component', () => {
//     it('renders without crashing', () => {
//         render(<Login toggleForm={() => {}} />);
//     });

//     it('submits the form with email and password', async () => {
//         const { getByLabelText, getByRole } = render(<Login toggleForm={() => {}} />);
        
//         fireEvent.change(getByLabelText('Email Address'), { target: { value: 'test@example.com' } });
//         fireEvent.change(getByLabelText('Password'), { target: { value: 'password123' } });
        
//         fireEvent.submit(getByRole('button', { name: /log in/i }));

//         await waitFor(() => {
//             expect(doSignInWithEmailAndPassword).toHaveBeenCalledWith('test@example.com', 'password123');
//         });
//     });

//     // it('signs in with Google', async () => {
//     //     const { getByRole } = render(<Login toggleForm={() => {}} />);
        
//     //     fireEvent.click(getByRole('button', { name: /continue with google/i }));
        
//     //     await waitFor(() => {
//     //         expect(doSignInWithGoogle).toHaveBeenCalled();
//     //     });
//     // });

//     // Add more tests for error handling, etc.
// });