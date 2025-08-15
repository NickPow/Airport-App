import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import Flights from '../Flights';

// Mock axios
vi.mock('axios');
const mockedAxios = vi.mocked(axios);

// Mock data
const mockFlightsData = [
  {
    id: 1,
    flightNumber: "AA123",
    airlineName: "American Airlines",
    aircraft: "Boeing 737",
    originCode: "LAX",
    destinationCode: "JFK",
    scheduledTime: "2025-08-15T10:00:00Z",
    status: "ON_TIME",
    flightType: "DEPARTURE"
  },
  {
    id: 2,
    flightNumber: "UA456",
    airlineName: "United Airlines",
    aircraft: "Airbus A320",
    originCode: "SFO",
    destinationCode: "ORD",
    scheduledTime: "2025-08-15T14:30:00Z",
    status: "DELAYED",
    flightType: "DEPARTURE"
  }
];

const renderFlights = () => {
  render(
    <BrowserRouter>
      <Flights />
    </BrowserRouter>
  );
};

describe('Flights Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock successful API response by default
    mockedAxios.get.mockResolvedValue({
      data: mockFlightsData
    });
  });

  it('renders the flights page with title and subtitle', async () => {
    renderFlights();
    
    await waitFor(() => {
      expect(screen.getByText('Flight Information')).toBeInTheDocument();
    });
    expect(screen.getByText('Real-time flight details, gates, and passenger information')).toBeInTheDocument();
  });

  it('shows loading state initially', () => {
    renderFlights();
    
    expect(screen.getByText('Loading flight information...')).toBeInTheDocument();
  });

  it('fetches and displays flight data', async () => {
    renderFlights();
    
    await waitFor(() => {
      expect(screen.getByText('AA123')).toBeInTheDocument();
    });
    
    expect(screen.getByText('American Airlines')).toBeInTheDocument();
    expect(screen.getByText('UA456')).toBeInTheDocument();
    expect(screen.getByText('United Airlines')).toBeInTheDocument();
  });

  it('displays flight routes correctly', async () => {
    renderFlights();
    
    await waitFor(() => {
      expect(screen.getByText('LAX')).toBeInTheDocument();
    });
    
    expect(screen.getByText('JFK')).toBeInTheDocument();
    expect(screen.getByText('SFO')).toBeInTheDocument();
    expect(screen.getByText('ORD')).toBeInTheDocument();
  });

  it('shows flight statistics', async () => {
    renderFlights();
    
    await waitFor(() => {
      expect(screen.getByText('Total Flights')).toBeInTheDocument();
    });
    
    // Use getAllByText to handle multiple "On Time" elements (filter dropdown and stats)
    const onTimeElements = screen.getAllByText('On Time');
    expect(onTimeElements.length).toBeGreaterThan(0);
    
    // Use getAllByText to handle multiple "Delayed" elements (filter dropdown and stats)
    const delayedElements = screen.getAllByText('Delayed');
    expect(delayedElements.length).toBeGreaterThan(0);
    
    expect(screen.getByText('Total Passengers')).toBeInTheDocument();
  });

  it('includes search functionality', async () => {
    renderFlights();
    
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Search flights, airlines, airports...')).toBeInTheDocument();
    });
  });

  it('includes status filter', async () => {
    renderFlights();
    
    await waitFor(() => {
      expect(screen.getByText('Filter by Status:')).toBeInTheDocument();
    });
    
    expect(screen.getByDisplayValue('All Flights')).toBeInTheDocument();
  });

  it('displays passenger capacity information', async () => {
    renderFlights();
    
    await waitFor(() => {
      // Use getAllByText to handle multiple "Passengers" elements
      const passengerElements = screen.getAllByText('Passengers');
      expect(passengerElements.length).toBeGreaterThan(0);
    });
    
    // Should show capacity indicators
    const capacityElements = screen.getAllByText(/\d+% Capacity/);
    expect(capacityElements.length).toBeGreaterThan(0);
  });

  it('shows gate and terminal information', async () => {
    renderFlights();
    
    await waitFor(() => {
      expect(screen.getAllByText('Gate').length).toBeGreaterThan(0);
    });
    
    expect(screen.getAllByText('Terminal').length).toBeGreaterThan(0);
  });

  it('handles API error gracefully', async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error('API Error'));
    
    renderFlights();
    
    await waitFor(() => {
      expect(screen.getByText('Failed to load flight information')).toBeInTheDocument();
    });
  });

  it('shows empty state when no flights match filter', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: [] });
    
    renderFlights();
    
    await waitFor(() => {
      expect(screen.getByText('No flights found')).toBeInTheDocument();
    });
    
    expect(screen.getByText('Try adjusting your search or filter criteria')).toBeInTheDocument();
  });

  it('calls the correct API endpoint', () => {
    renderFlights();
    
    expect(mockedAxios.get).toHaveBeenCalledWith('http://localhost:8080/admin/flights');
  });

  it('handles non-array API response', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: null });
    
    renderFlights();
    
    await waitFor(() => {
      expect(screen.queryByText('Loading flight information...')).not.toBeInTheDocument();
    });
    
    // Should not crash and show empty state
    expect(screen.getByText('No flights found')).toBeInTheDocument();
  });

  it('displays flight status badges', async () => {
    renderFlights();
    
    await waitFor(() => {
      expect(screen.getByText('ON TIME')).toBeInTheDocument();
    });
    
    expect(screen.getByText('DELAYED')).toBeInTheDocument();
  });

  it('shows aircraft information', async () => {
    renderFlights();
    
    await waitFor(() => {
      expect(screen.getAllByText('Aircraft').length).toBeGreaterThan(0);
    });
    
    expect(screen.getByText('Boeing 737')).toBeInTheDocument();
    expect(screen.getByText('Airbus A320')).toBeInTheDocument();
  });
});
