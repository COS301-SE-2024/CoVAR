import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import OrganizationEvaluation from '../app/(pages)/evaluate/organization/[organization]/page';
import { usePathname } from 'next/navigation';

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(() => '/organization/testorg'),
}));

jest.mock('../functions/requests', () => ({
  handleDownloadFile: jest.fn(),
}));

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
  });



  test('handles file removal', async () => {
    const mockUploads = [
      { upload_id: 1, va: 1, client: null, organization: 'testorg', type: 'pdf', created_at: '2023-07-12T12:34:56Z', loid: 1, filename: 'file1.pdf' },
    ];

    mockAxios.onGet('/api/uploads/organization/testorg').reply(200, mockUploads);
    mockAxios.onDelete('/api/uploads/1').reply(200);

    render(<OrganizationEvaluation />);

    await waitFor(() => {
        expect(screen.getByText('File Name: file1.pdf, Uploaded At: 2023/07/12, 14:34:56')).toBeInTheDocument();
      });
  
      fireEvent.click(screen.getByText('Remove'));
  
      await waitFor(() =>
        expect(screen.queryByText('File Name: file1.pdf, Uploaded At: 2023/07/12, 14:34:56')).not.toBeInTheDocument()
      );
  });
});
