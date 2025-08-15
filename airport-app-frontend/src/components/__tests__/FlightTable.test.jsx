import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import FlightTable from '../FlightTable'

describe('FlightTable', () => {
  const mockFlights = [
    {
      id: 1,
      flightNumber: 'AA123',
      airline: 'American Airlines',
      origin: 'LAX',
      destination: 'JFK',
      departureTime: '2025-08-15T10:00:00',
      status: 'on_time'
    },
    {
      id: 2,
      flightNumber: 'UA456',
      airline: 'United Airlines',
      origin: 'SFO',
      destination: 'ORD',
      departureTime: '2025-08-15T14:30:00',
      status: 'delayed'
    }
  ]

  it('renders empty state when no flights provided', () => {
    render(<FlightTable flights={[]} />)
    
    expect(screen.getByText('No flights scheduled')).toBeInTheDocument()
    expect(screen.getByText('Add your first flight using the form above.')).toBeInTheDocument()
  })

  it('renders flights table when flights are provided', () => {
    render(<FlightTable flights={mockFlights} />)
    
    // Check table headers
    expect(screen.getByText('Flight')).toBeInTheDocument()
    expect(screen.getByText('Airline')).toBeInTheDocument()
    expect(screen.getByText('Route')).toBeInTheDocument()
    expect(screen.getByText('Departure')).toBeInTheDocument()
    expect(screen.getByText('Status')).toBeInTheDocument()
    expect(screen.getByText('Actions')).toBeInTheDocument()
    
    // Check flight data
    expect(screen.getByText('AA123')).toBeInTheDocument()
    expect(screen.getByText('American Airlines')).toBeInTheDocument()
    expect(screen.getByText('LAX')).toBeInTheDocument()
    expect(screen.getByText('JFK')).toBeInTheDocument()
    expect(screen.getByText('UA456')).toBeInTheDocument()
    expect(screen.getByText('United Airlines')).toBeInTheDocument()
  })

  it('calls onEdit when edit button is clicked', () => {
    const mockOnEdit = vi.fn()
    render(<FlightTable flights={mockFlights} onEdit={mockOnEdit} />)
    
    const editButtons = screen.getAllByTitle('Edit flight')
    fireEvent.click(editButtons[0])
    
    expect(mockOnEdit).toHaveBeenCalledWith(mockFlights[0])
  })

  it('calls onDelete when delete button is clicked and confirmed', () => {
    const mockOnDelete = vi.fn()
    
    // Mock window.confirm to return true
    const originalConfirm = window.confirm
    window.confirm = vi.fn(() => true)
    
    render(<FlightTable flights={mockFlights} onDelete={mockOnDelete} />)
    
    const deleteButtons = screen.getAllByTitle('Delete flight')
    fireEvent.click(deleteButtons[0])
    
    expect(window.confirm).toHaveBeenCalledWith('Delete flight AA123?')
    expect(mockOnDelete).toHaveBeenCalledWith(1)
    
    // Restore original confirm
    window.confirm = originalConfirm
  })

  it('does not call onDelete when delete is cancelled', () => {
    const mockOnDelete = vi.fn()
    
    // Mock window.confirm to return false
    const originalConfirm = window.confirm
    window.confirm = vi.fn(() => false)
    
    render(<FlightTable flights={mockFlights} onDelete={mockOnDelete} />)
    
    const deleteButtons = screen.getAllByTitle('Delete flight')
    fireEvent.click(deleteButtons[0])
    
    expect(window.confirm).toHaveBeenCalledWith('Delete flight AA123?')
    expect(mockOnDelete).not.toHaveBeenCalled()
    
    // Restore original confirm
    window.confirm = originalConfirm
  })

  it('handles missing flight data gracefully', () => {
    const incompleteFlights = [
      {
        id: 1,
        flightNumber: 'AA123',
        // Missing other fields
      }
    ]
    
    render(<FlightTable flights={incompleteFlights} />)
    
    expect(screen.getByText('AA123')).toBeInTheDocument()
    // Should show dashes for missing airline, origin, destination, and time
    expect(screen.getAllByText('-')).toHaveLength(4) // airline, origin, destination, time
  })

  it('formats datetime correctly', () => {
    render(<FlightTable flights={mockFlights} />)
    
    // The formatted date should be present (exact format depends on locale)
    const dateElements = screen.getAllByText(/Aug|10:00|2:30/)
    expect(dateElements.length).toBeGreaterThan(0)
  })

  it('displays correct status colors', () => {
    render(<FlightTable flights={mockFlights} />)
    
    // Check that status text is displayed
    expect(screen.getByText('on_time')).toBeInTheDocument()
    expect(screen.getByText('delayed')).toBeInTheDocument()
  })

  it('handles non-array flights input', () => {
    render(<FlightTable flights={null} />)
    expect(screen.getByText('No flights scheduled')).toBeInTheDocument()
  })
})
