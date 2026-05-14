import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import LoginPage from '../LoginPage'

const mockNavigate = vi.fn()
const mockLogin = vi.fn()
const mockGoogleAuth = vi.fn()
const mockToastSuccess = vi.fn()
const mockToastError = vi.fn()

vi.mock('../../components/Navbar', () => ({
  default: () => null,
}))

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    login: mockLogin,
  }),
}))

vi.mock('../../services/api', () => ({
  patientLogin: vi.fn(),
  doctorLogin: vi.fn(),
  patientSignup: vi.fn(),
  doctorSignup: vi.fn(),
  adminLogin: vi.fn(),
  googleAuth: (...args) => mockGoogleAuth(...args),
}))

vi.mock('react-hot-toast', () => ({
  default: {
    success: (...args) => mockToastSuccess(...args),
    error: (...args) => mockToastError(...args),
  },
}))

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

vi.mock('@react-oauth/google', () => ({
  GoogleLogin: ({ onSuccess }) => (
    <button
      type="button"
      onClick={() => onSuccess({ credential: 'test-google-token' })}
    >
      GoogleMockButton
    </button>
  ),
}))

describe('LoginPage Google auth', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('shows email/password inputs and Google option for patient tab', () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    )

    expect(screen.getByPlaceholderText('your@email.com')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Min 6 characters')).toBeInTheDocument()
    expect(screen.getByText(/or continue with/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'GoogleMockButton' })).toBeInTheDocument()
  })

  test('handles pendingApproval response without calling login or navigate', async () => {
    mockGoogleAuth.mockResolvedValueOnce({
      data: {
        success: true,
        pendingApproval: true,
        message: 'Pending admin approval.',
      },
    })

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    )

    fireEvent.click(screen.getAllByRole('button', { name: 'GoogleMockButton' })[0])

    await waitFor(() => {
      expect(mockGoogleAuth).toHaveBeenCalledWith('test-google-token', 'patient')
      expect(mockLogin).not.toHaveBeenCalled()
      expect(mockNavigate).not.toHaveBeenCalled()
      expect(mockToastSuccess).toHaveBeenCalledWith('Pending admin approval.', { duration: 6000 })
    })
  })
})
