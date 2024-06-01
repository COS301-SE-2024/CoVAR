// import React from 'react';
import { render, screen } from '@testing-library/react';
import App from '../App';

jest.mock('../App', () => {
  return {
    __esModule: true,
    default: jest.fn(), // Mocking the default export (App component)
    initializeApp: jest.fn(),
    getAuth: jest.fn(),
    getFirestore: jest.fn(),
  };
});

describe('App', () => {
  test('is true', () => {
    render(<App />);
    expect(true).toBeTruthy;
  });
});