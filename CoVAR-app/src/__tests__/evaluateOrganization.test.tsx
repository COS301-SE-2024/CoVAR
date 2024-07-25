import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import OrganizationEvaluation from '../app/(pages)/evaluate/organization/[organization]/page';
import { usePathname } from 'next/navigation';
import { fetchUploadsOrganization, handleRemoveFile } from '../functions/requests';

// Mock the next/navigation module
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(() => '/organization/testorg'),
}));

// Mock the functions from requests
jest.mock('../functions/requests', () => ({
  fetchUploadsOrganization: jest.fn(),
  handleRemoveFile: jest.fn(),
}));

// Mock the FileUpload component
jest.mock('../app/(pages)/evaluate/components/fileUpload', () => {
  const MockFileUpload = ({ onFileSubmit }: { onFileSubmit: any }) => (
    <button onClick={onFileSubmit}>Mock FileUpload Component</button>
  );
  MockFileUpload.displayName = 'MockFileUpload';
  return MockFileUpload;
});

describe('OrganizationEvaluation', () => {
  let mockAxios: MockAdapter;

  beforeEach(() => {
    mockAxios = new MockAdapter(axios);
    localStorage.setItem('accessToken', 'mock-token');
  });

  afterEach(() => {
    mockAxios.reset();
    localStorage.removeItem('accessToken');
    jest.clearAllMocks(); // Clear all mocks after each test
  });

  test('handles file removal', async () => {
    const mockUploads = [
      { upload_id: 1, va: 1, client: null, organization: 'testorg', type: 'pdf', created_at: '2023-07-12T12:34:56Z', loid: 1, filename: 'file1.pdf', in_report: false },
    ];

    // Setup mock implementations
    (fetchUploadsOrganization as jest.Mock).mockResolvedValue(mockUploads);
    (handleRemoveFile as jest.Mock).mockResolvedValue({});

    render(<OrganizationEvaluation />);

    await waitFor(() => {
      expect(screen.getByText(/File Name: file1.pdf, Uploaded At:/)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Remove'));

    await waitFor(() => {
      expect(screen.queryByText(/File Name: file1.pdf, Uploaded At:/)).not.toBeInTheDocument();
    });
  });
});