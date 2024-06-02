import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import UserList from '../adminTools/components/userList';

jest.mock('../adminTools/components/userList', () => {
    return {
      __esModule: true,
      default: jest.fn(),
      initializeApp: jest.fn(),
      getAuth: jest.fn(),
      getFirestore: jest.fn(),
    };
  });


describe('UserList Component', () => {
    //test if the component renders
    test('renders UserList component', () => {
        render(<UserList />);
    });
    
});
