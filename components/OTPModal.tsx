import { useState, useEffect } from 'react'
import { X, Shield, Clock } from 'lucide-react'
import { generateMockOTP } from '../lib/utils'

interface OTPModalProps {
  phoneNumber: string
  onVerified: () => void
  onClose: () => void
}

export default function OTPModal({ phoneNumber, onVerified, onClose }: OTPModalProps) {
  const [otp, setOtp] = useState('')
  const [mockOTP, setMockOTP] = useState('')
  const [countdown, setCountdown] = useState(60)
  const [error, setError] = useState('')
  const [isResending, setIsResending] = useState(false)

  useEffect(() => {
    // Generate mock OTP when modal opens
    const generatedOTP = generateMockOTP()
    setMockOTP(generatedOTP)
    console.log('Demo OTP:', generatedOTP) // For testing purposes
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [countdown])

  const handleOTPChange = (value: string) => {
    if (value.length <= 6 && /^\d*$/.test(value)) {
      setOtp(value)
      setError('')
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (otp.length !== 6) {
      setError('Vui lòng nhập đầy đủ 6 chữ số')
      return
    }

    // For demo purposes, accept both the generated OTP and 123456
    if (otp === mockOTP || otp === '123456') {
      onVerified()
    } else {
      setError('Mã OTP không chính xác')
    }
  }

  const handleResend = async () => {
    setIsResending(true)
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const newOTP = generateMockOTP()
    setMockOTP(newOTP)
    console.log('New Demo OTP:', newOTP)
    setCountdown(60)
    setIsResending(false)
    setError('')
    setOtp('')
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Shield className="h-5 w-5 mr-2 text-green-600" />
            Xác thực OTP
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="text-center mb-6">
          <p className="text-gray-600 mb-2">
            Chúng tôi đã gửi mã xác thực đến số điện thoại
          </p>
          <p className="font-medium text-gray-900">
            {phoneNumber.replace(/(\d{3})(\d{3})(\d{4})/, '$1 *** $3')}
          </p>
        </div>

        {/* Demo Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <p className="text-xs text-blue-800 text-center">
            <strong>Demo Mode:</strong> Sử dụng OTP: <code className="bg-blue-200 px-1 rounded">{mockOTP}</code> hoặc <code className="bg-blue-200 px-1 rounded">123456</code>
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nhập mã OTP (6 chữ số)
            </label>
            <input
              type="text"
              inputMode="numeric"
              className={`w-full px-4 py-3 text-center text-2xl font-mono border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                error ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="000000"
              value={otp}
              onChange={(e) => handleOTPChange(e.target.value)}
              maxLength={6}
            />
            {error && (
              <p className="text-red-600 text-sm mt-2 text-center">{error}</p>
            )}
          </div>

          <div className="text-center mb-6">
            {countdown > 0 ? (
              <p className="text-gray-600 text-sm flex items-center justify-center">
                <Clock className="h-4 w-4 mr-1" />
                Gửi lại sau {formatTime(countdown)}
              </p>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                disabled={isResending}
                className="text-primary-600 hover:text-primary-700 text-sm font-medium disabled:opacity-50"
              >
                {isResending ? 'Đang gửi...' : 'Gửi lại mã OTP'}
              </button>
            )}
          </div>

          <div className="space-y-3">
            <button
              type="submit"
              disabled={otp.length !== 6}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Xác thực
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-full btn-secondary"
            >
              Hủy
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 