import '@testing-library/jest-dom'
import { render, screen, waitFor } from '@testing-library/react'
import DocumentForm from '@/components/DocumentForm'

// Mock fetch globally
global.fetch = jest.fn()

describe('DocumentForm', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks()
  })

  it('should render without crashing when locations is undefined', async () => {
    // Mock API to return undefined
    (global.fetch as jest.Mock).mockImplementation((url) => {
      if (url.includes('/api/locations')) {
        return Promise.resolve({
          json: () => Promise.resolve(undefined),
        })
      }
      if (url.includes('/api/products')) {
        return Promise.resolve({
          json: () => Promise.resolve([]),
        })
      }
      return Promise.reject(new Error('Unknown URL'))
    })

    render(<DocumentForm docType="RECEIPT" />)

    // Component should render without crashing
    expect(screen.getByText('Reference No')).toBeInTheDocument()
    
    // Wait for useEffect to complete
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(2)
    })
  })

  it('should render without crashing when locations is null', async () => {
    (global.fetch as jest.Mock).mockImplementation((url) => {
      if (url.includes('/api/locations')) {
        return Promise.resolve({
          json: () => Promise.resolve(null),
        })
      }
      if (url.includes('/api/products')) {
        return Promise.resolve({
          json: () => Promise.resolve([]),
        })
      }
      return Promise.reject(new Error('Unknown URL'))
    })

    render(<DocumentForm docType="RECEIPT" />)

    expect(screen.getByText('Reference No')).toBeInTheDocument()
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(2)
    })
  })

  it('should render without crashing when locations is an error object', async () => {
    (global.fetch as jest.Mock).mockImplementation((url) => {
      if (url.includes('/api/locations')) {
        return Promise.resolve({
          json: () => Promise.resolve({ error: 'Database error' }),
        })
      }
      if (url.includes('/api/products')) {
        return Promise.resolve({
          json: () => Promise.resolve([]),
        })
      }
      return Promise.reject(new Error('Unknown URL'))
    })

    render(<DocumentForm docType="RECEIPT" />)

    expect(screen.getByText('Reference No')).toBeInTheDocument()
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(2)
    })
  })

  it('should render locations dropdown when locations array is provided', async () => {
    const mockLocations = [
      { id: '1', name: 'Warehouse A', warehouse_id: 'w1' },
      { id: '2', name: 'Warehouse B', warehouse_id: 'w2' },
    ]

    (global.fetch as jest.Mock).mockImplementation((url) => {
      if (url.includes('/api/locations')) {
        return Promise.resolve({
          json: () => Promise.resolve(mockLocations),
        })
      }
      if (url.includes('/api/products')) {
        return Promise.resolve({
          json: () => Promise.resolve([]),
        })
      }
      return Promise.reject(new Error('Unknown URL'))
    })

    render(<DocumentForm docType="TRANSFER" />)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(2)
    })

    // Should render location options
    await waitFor(() => {
      const selects = screen.getAllByRole('combobox')
      expect(selects.length).toBeGreaterThan(0)
    })
  })

  it('should render products dropdown when products array is provided', async () => {
    const mockProducts = [
      { id: '1', name: 'Product A', sku: 'SKU001' },
      { id: '2', name: 'Product B', sku: 'SKU002' },
    ]

    (global.fetch as jest.Mock).mockImplementation((url) => {
      if (url.includes('/api/locations')) {
        return Promise.resolve({
          json: () => Promise.resolve([]),
        })
      }
      if (url.includes('/api/products')) {
        return Promise.resolve({
          json: () => Promise.resolve(mockProducts),
        })
      }
      return Promise.reject(new Error('Unknown URL'))
    })

    render(<DocumentForm docType="RECEIPT" />)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(2)
    })

    // Should render product select
    await waitFor(() => {
      const selects = screen.getAllByRole('combobox')
      expect(selects.length).toBeGreaterThan(0)
    })
  })

  it('should handle fetch errors gracefully', async () => {
    // Mock console.error to avoid cluttering test output
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()

    (global.fetch as jest.Mock).mockImplementation(() => {
      return Promise.reject(new Error('Network error'))
    })

    render(<DocumentForm docType="RECEIPT" />)

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalled()
    })

    // Component should still render
    expect(screen.getByText('Reference No')).toBeInTheDocument()

    consoleErrorSpy.mockRestore()
  })

  it('should show appropriate fields for RECEIPT type', () => {
    (global.fetch as jest.Mock).mockImplementation(() => {
      return Promise.resolve({
        json: () => Promise.resolve([]),
      })
    })

    render(<DocumentForm docType="RECEIPT" />)

    expect(screen.getByText('Supplier')).toBeInTheDocument()
    expect(screen.queryByText('Customer')).not.toBeInTheDocument()
  })

  it('should show appropriate fields for DELIVERY type', () => {
    (global.fetch as jest.Mock).mockImplementation(() => {
      return Promise.resolve({
        json: () => Promise.resolve([]),
      })
    })

    render(<DocumentForm docType="DELIVERY" />)

    expect(screen.getByText('Customer')).toBeInTheDocument()
    expect(screen.queryByText('Supplier')).not.toBeInTheDocument()
  })
})
