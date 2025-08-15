import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axios from 'axios'
import Admin from '../Admin'

// Mock axios
vi.mock('axios')
const mockedAxios = vi.mocked(axios)

describe('Admin', () => {
  const mockFlightsData = [
    {
      id: 1,
      flightNumber: 'AA123',
      airlineName: 'American Airlines',
      originCode: 'LAX',
      destinationCode: 'JFK',
      scheduledTime: '2025-08-15T10:00:00',
      status: 'ON_TIME',
      flightType: 'DEPARTURE'
    },
    {
      id: 2,
      flightNumber: 'UA456',
      airlineName: 'United Airlines',
      originCode: 'SFO',
      destinationCode: 'ORD',
      scheduledTime: '2025-08-15T14:30:00',
      status: 'DELAYED',
      flightType: 'ARRIVAL'
    }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders admin page with form and loading state initially', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: mockFlightsData })
    
    render(<Admin />)
    
    // Check page header
    expect(screen.getByText('Flight Administration')).toBeInTheDocument()
    expect(screen.getByText('Manage flight schedules and information')).toBeInTheDocument()
    
    // Check form elements
    expect(screen.getByLabelText('Flight Number')).toBeInTheDocument()
    expect(screen.getByLabelText('Airline')).toBeInTheDocument()
    expect(screen.getByLabelText('Origin Airport')).toBeInTheDocument()
    expect(screen.getByLabelText('Destination Airport')).toBeInTheDocument()
    expect(screen.getByLabelText('Departure Time')).toBeInTheDocument()
    expect(screen.getByLabelText('Arrival Time')).toBeInTheDocument()
    
    // Check loading state initially
    expect(screen.getByText('Loading flights...')).toBeInTheDocument()
    
    // Wait for flights to load
    await waitFor(() => {
      expect(screen.queryByText('Loading flights...')).not.toBeInTheDocument()
    }, { timeout: 3000 })
  })

  it('loads and displays flights on mount', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: mockFlightsData })
    
    render(<Admin />)
    
    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledWith('http://localhost:8080/admin/flights')
    })
    
    // Should display flights in table
    await waitFor(() => {
      expect(screen.getByText('AA123')).toBeInTheDocument()
      expect(screen.getByText('American Airlines')).toBeInTheDocument()
      expect(screen.getByText('UA456')).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  it('submits new flight successfully', async () => {
    const user = userEvent.setup()
    
    // Mock initial load
    mockedAxios.get.mockResolvedValueOnce({ data: [] })
    
    // Mock successful flight creation
    const newFlightResponse = {
      id: 3,
      flightNumber: 'DL789',
      airlineName: 'Delta Airlines',
      originCode: 'ATL',
      destinationCode: 'LAX',
      scheduledTime: '2025-08-15T16:00:00',
      status: 'ON_TIME',
      flightType: 'DEPARTURE'
    }
    mockedAxios.post.mockResolvedValueOnce({ data: newFlightResponse })
    
    render(<Admin />)
    
    // Wait for initial load
    await waitFor(() => {
      expect(screen.queryByText('Loading flights...')).not.toBeInTheDocument()
    })
    
    // Fill out form
    await user.type(screen.getByLabelText('Flight Number'), 'DL789')
    await user.type(screen.getByLabelText('Airline'), 'Delta Airlines')
    await user.type(screen.getByLabelText('Origin Airport'), 'ATL')
    await user.type(screen.getByLabelText('Destination Airport'), 'LAX')
    await user.type(screen.getByLabelText('Departure Time'), '2025-08-15T16:00')
    await user.type(screen.getByLabelText('Arrival Time'), '2025-08-15T18:00')
    
    // Submit form
    await user.click(screen.getByRole('button', { name: 'Add Flight' }))
    
    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith(
        'http://localhost:8080/admin/flights/simple',
        expect.objectContaining({
          flightNumber: 'DL789',
          airlineName: 'Delta Airlines',
          originCode: 'ATL',
          destinationCode: 'LAX',
          scheduledTime: '2025-08-15T16:00'
        })
      )
    })
  })

  it('handles API error gracefully', async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error('Network error'))
    
    render(<Admin />)
    
    await waitFor(() => {
      expect(screen.getByText('Failed to load flights.')).toBeInTheDocument()
    })
  })

  it('shows form validation errors for required fields', async () => {
    const user = userEvent.setup()
    
    mockedAxios.get.mockResolvedValueOnce({ data: [] })
    
    render(<Admin />)
    
    // Wait for initial load
    await waitFor(() => {
      expect(screen.queryByText('Loading flights...')).not.toBeInTheDocument()
    })
    
    // Try to submit empty form
    await user.click(screen.getByRole('button', { name: 'Add Flight' }))
    
    // Should not make API call for empty form
    expect(mockedAxios.post).not.toHaveBeenCalled()
  })

  it('handles edit mode correctly', async () => {
    const user = userEvent.setup()
    
    mockedAxios.get.mockResolvedValueOnce({ data: mockFlightsData })
    
    render(<Admin />)
    
    // Wait for flights to load
    await waitFor(() => {
      expect(screen.getByText('AA123')).toBeInTheDocument()
    })
    
    // Click edit button (assuming FlightTable renders edit buttons)
    const editButtons = screen.getAllByTitle('Edit flight')
    await user.click(editButtons[0])
    
    // Should populate form with flight data
    expect(screen.getByDisplayValue('AA123')).toBeInTheDocument()
    expect(screen.getByDisplayValue('American Airlines')).toBeInTheDocument()
    
    // Button should change to "Update Flight"
    expect(screen.getByRole('button', { name: 'Update Flight' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
  })

  it('uses quick time buttons correctly', async () => {
    const user = userEvent.setup()
    
    mockedAxios.get.mockResolvedValueOnce({ data: [] })
    
    render(<Admin />)
    
    // Wait for initial load
    await waitFor(() => {
      expect(screen.queryByText('Loading flights...')).not.toBeInTheDocument()
    })
    
    // Click 9 AM quick time button for departure
    const quickTimeButtons = screen.getAllByText('9 AM')
    await user.click(quickTimeButtons[0])
    
    // Should set the departure time input (accepts current time being set)
    const departureInput = screen.getByLabelText('Departure Time')
    expect(departureInput.value).toMatch(/T\d{2}:\d{2}/)
  })

  it('uses quick date buttons correctly', async () => {
    const user = userEvent.setup()
    
    mockedAxios.get.mockResolvedValueOnce({ data: [] })
    
    render(<Admin />)
    
    // Wait for initial load
    await waitFor(() => {
      expect(screen.queryByText('Loading flights...')).not.toBeInTheDocument()
    })
    
    // Click Today quick date button
    const todayButtons = screen.getAllByText('Today')
    await user.click(todayButtons[0])
    
    // Should set today's date in the departure time input
    const departureInput = screen.getByLabelText('Departure Time')
    expect(departureInput.value).toMatch(/2025-08-15/)
  })

  it('handles delete operation correctly', async () => {
    const user = userEvent.setup()
    
    mockedAxios.get.mockResolvedValueOnce({ data: mockFlightsData })
    mockedAxios.delete.mockResolvedValueOnce({})
    
    // Mock window.confirm to return true
    const originalConfirm = window.confirm
    window.confirm = vi.fn(() => true)
    
    render(<Admin />)
    
    // Wait for flights to load
    await waitFor(() => {
      expect(screen.getByText('AA123')).toBeInTheDocument()
    })
    
    // Click delete button
    const deleteButtons = screen.getAllByTitle('Delete flight')
    await user.click(deleteButtons[0])
    
    await waitFor(() => {
      expect(mockedAxios.delete).toHaveBeenCalledWith('http://localhost:8080/admin/flights/1')
    })
    
    // Restore original confirm
    window.confirm = originalConfirm
  })
})
