import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import UserEvaluation from '../app/(pages)/evaluate/user/[username]/page';
import { usePathname } from 'next/navigation';
import { fetchUploadsClient, handleRemoveFile } from '../functions/requests';

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(() => '/user/testuser'),
  useRouter: () => ({
    replace: jest.fn(),
  }),
}));

jest.mock('../functions/requests', () => ({
  fetchUploadsClient: jest.fn(),
  fetchReports: jest.fn(),
  handleRemoveFile: jest.fn(),
  handleToggleReport: jest.fn(),
}));

jest.mock('../app/(pages)/evaluate/components/fileUpload', () => {
  const MockFileUpload = ({ onFileSubmit }: { onFileSubmit: any }) => (
    <button onClick={onFileSubmit}>Mock FileUpload Component</button>
  );
  MockFileUpload.displayName = 'MockFileUpload';
  return MockFileUpload;
});

describe('UserEvaluation', () => {
  let mockAxios: MockAdapter;

  beforeEach(() => {
    mockAxios = new MockAdapter(axios);
    localStorage.setItem('accessToken', 'mock-token');
  });

  afterEach(() => {
    mockAxios.reset();
    localStorage.removeItem('accessToken');
  });

  test('handles file removal', async () => {
    const mockUploads = [
      { upload_id: 1, va: 1, client: 'testuser', organization: null, type: 'pdf', created_at: '2023-07-12T12:34:56Z', loid: 1, filename: 'file1.pdf', in_report: false },
    ];

    const mockFetchUploadsClient = jest.fn().mockResolvedValue(mockUploads);
    const mockHandleRemoveFile = jest.fn().mockResolvedValue({});

    (fetchUploadsClient as jest.Mock).mockImplementation(mockFetchUploadsClient);
    (handleRemoveFile as jest.Mock).mockImplementation(mockHandleRemoveFile);

    render(<UserEvaluation />);

    await waitFor(() => {
      expect(screen.getByText(/File Name: file1.pdf, Uploaded At:/)).toBeInTheDocument();
    });

    const removeButtons = screen.getAllByRole('button', { name: /delete/i });
    expect(removeButtons.length).toBeGreaterThan(0);
  
    fireEvent.click(removeButtons[0]);

    await waitFor(() => {
      expect(screen.queryByText(/File Name: file1.pdf, Uploaded At:/)).not.toBeInTheDocument();
    });
  });
});