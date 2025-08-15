import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { useParams } from 'react-router-dom'
import Airport from '../Airport'
import http from '../../api/http'


vi.mock('react-router-dom', () => ({
  useParams: vi.fn(),
  Link: vi.fn(({ children }) => children)
}))

vi.mock('../../api/http', () => ({
  default: {
    get: vi.fn()
  }
}))

describe('Airport', () => {
  const mockArrivalsData = [
    {
      id: 1,
      flightNumber: 'AA123',
      airlineName: 'American Airlines',
      originCode: 'LAX',
      destinationCode: 'JFK',
      scheduledTime: '2025-08-15T10:00:00',
      status: 'ON_TIME',
      flightType: 'ARRIVAL'
    }
  ]

  const mockDeparturesData = [
    {
      id: 2,
      flightNumber: 'UA456',
      airlineName: 'United Airlines',
      originCode: 'JFK',
      destinationCode: 'SFO',
      scheduledTime: '2025-08-15T14:30:00',
      status: 'DELAYED',
      flightType: 'DEPARTURE'
    }
  ]

  const mockAirportData = {
    id: 'JFK',
    name: 'John F. Kennedy International Airport',
    city: 'New York',
    state: 'NY'
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useParams).mockReturnValue({ id: 'JFK' })
  })

  it('renders loading state initially', () => {
    vi.mocked(http.get).mockImplementation(() => new Promise(() => {})) 
    
    render(<Airport />)
    
    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })

  it('loads and displays airport data successfully', async () => {
    vi.mocked(http.get)
      .mockResolvedValueOnce({ data: mockArrivalsData })
      .mockResolvedValueOnce({ data: mockDeparturesData })
      .mockResolvedValueOnce({ data: mockAirportData })
    
    render(<Airport />)
    
    await waitFor(() => {
      expect(http.get).toHaveBeenCalledWith('/airports/JFK/flights/arrivals')
      expect(http.get).toHaveBeenCalledWith('/airports/JFK/flights/departures')
    })

    // Should display flight information
    await waitFor(() => {
      expect(screen.getByText('AA123')).toBeInTheDocument()
      expect(screen.getByText('UA456')).toBeInTheDocument()
    })
  })

  it('displays arrivals and departures sections', async () => {
    vi.mocked(http.get)
      .mockResolvedValueOnce({ data: mockArrivalsData })
      .mockResolvedValueOnce({ data: mockDeparturesData })
      .mockResolvedValueOnce({ data: mockAirportData })
    
    render(<Airport />)
    
    await waitFor(() => {
      expect(screen.getByText(/Departures \(/)).toBeInTheDocument()
      expect(screen.getByText(/Arrivals \(/)).toBeInTheDocument()
    })
  })

  it('handles API errors gracefully', async () => {
    vi.mocked(http.get).mockRejectedValue(new Error('Network error'))
    
    render(<Airport />)
    
    await waitFor(() => {
      expect(screen.getByText(/could not connect to the server/i)).toBeInTheDocument()
    })
  })

  it('normalizes flight data correctly', async () => {
    const flightWithMissingFields = {
      id: 1,
      flightNumber: 'DL789',
      
    }
    
    vi.mocked(http.get)
      .mockResolvedValueOnce({ data: [flightWithMissingFields] })
      .mockResolvedValueOnce({ data: [] })
      .mockResolvedValueOnce({ data: mockAirportData })
    
    render(<Airport />)
    
    await waitFor(() => {
      expect(screen.getByText('DL789')).toBeInTheDocument()
    })
    
    
    expect(screen.getAllByText('-').length).toBeGreaterThan(0)
  })

  it('handles empty flight data', async () => {
    vi.mocked(http.get)
      .mockResolvedValueOnce({ data: [] })
      .mockResolvedValueOnce({ data: [] })
      .mockResolvedValueOnce({ data: mockAirportData })
    
    render(<Airport />)
    
    await waitFor(() => {
      expect(screen.getByText('No flights scheduled')).toBeInTheDocument()
    })
  })

  it('uses correct airport ID from params', async () => {
    vi.mocked(useParams).mockReturnValue({ id: 'LAX' })
    vi.mocked(http.get)
      .mockResolvedValueOnce({ data: [] })
      .mockResolvedValueOnce({ data: [] })
      .mockResolvedValueOnce({ data: { id: 'LAX', name: 'Los Angeles International' } })
    
    render(<Airport />)
    
    await waitFor(() => {
      expect(http.get).toHaveBeenCalledWith('/airports/LAX/flights/arrivals')
      expect(http.get).toHaveBeenCalledWith('/airports/LAX/flights/departures')
    })
  })

  it('displays back navigation link', async () => {
    vi.mocked(http.get)
      .mockResolvedValueOnce({ data: [] })
      .mockResolvedValueOnce({ data: [] })
      .mockResolvedValueOnce({ data: mockAirportData })
    
    render(<Airport />)
    
    await waitFor(() => {
      const backLink = screen.getByText(/back/i)
      expect(backLink).toBeInTheDocument()
      
    })
  })
})
