import React from 'react';
import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import UserList from '../app/(pages)/adminTools/components/userList';
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(() => '/user/testuser'),
  useRouter: () => ({
    replace: jest.fn(),
  }),
}));
jest.mock('../app/(pages)/adminTools/components/userList', () => {
    return {
      __esModule: true,
      default: jest.fn(),
      initializeApp: jest.fn(),
      getAuth: jest.fn(),
      getFirestore: jest.fn(),
    };
  });

describe('UserList Component', () => {
    test('renders UserList component', () => {
        render(<UserList />);
    });
    
});
