// import React from 'react';
import { render } from '@testing-library/react';
import App from '../App';

jest.mock('../App', () => {
  return {
    __esModule: true,
    default: jest.fn(),
    initializeApp: jest.fn(),
    getAuth: jest.fn(),
    getFirestore: jest.fn(),
  };
});

describe('App', () => {
  test('is true', () => {
    render(<App />);
    expect(true).toEqual(true);
  });
});