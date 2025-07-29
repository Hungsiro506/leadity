import { useState, useEffect } from 'react'
import { User, Mail, Phone, MapPin, AlertCircle, Shield } from 'lucide-react'
import { NewLoanContactData, FormErrors } from '../types'
import { validateVietnamesePhone, validateEmail, formatNumberInput, parseNumberInput, PROVINCES } from '../lib/utils'
import { analytics } from '../lib/posthog'
import OTPModal from './OTPModal'

interface NewLoanContactStepProps {
  data: NewLoanContactData
  onDataChange: (data: NewLoanContactData) => void
  onNext: () => void
  onBack: () => void
}

export default function NewLoanContactStep({ data, onDataChange, onNext, onBack }: NewLoanContactStepProps) {
  const [errors, setErrors] = useState<FormErrors>({})
  const [showOTPModal, setShowOTPModal] = useState(false)
  const [incomeDisplay, setIncomeDisplay] = useState('')

  useEffect(() => {
    analytics.pageView('new_loan_contact')
  }, [])

  const handleChange = (field: keyof NewLoanContactData, value: string | boolean) => {
    onDataChange({ ...data, [field]: value })
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleIncomeChange = (value: string) => {
    const numericValue = parseNumberInput(value)
    const formattedValue = formatNumberInput(value)
    
    setIncomeDisplay(formattedValue)
    onDataChange({ ...data, monthlyIncome: numericValue })
    
    if (errors.monthlyIncome) {
      setErrors(prev => ({ ...prev, monthlyIncome: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: FormErrors = {}

    if (!data.name.trim()) {
      newErrors.name = 'Vui lòng nhập họ và tên'
    }

    if (!data.yearOfBirth) {
      newErrors.yearOfBirth = 'Vui lòng nhập năm sinh'
    } else {
      const year = parseInt(data.yearOfBirth)
      const currentYear = new Date().getFullYear()
      if (year < 1940 || year > currentYear - 18) {
        newErrors.yearOfBirth = 'Năm sinh không hợp lệ'
      }
    }

    if (!data.phone.trim()) {
      newErrors.phone = 'Vui lòng nhập số điện thoại'
    } else if (!validateVietnamesePhone(data.phone)) {
      newErrors.phone = 'Số điện thoại không đúng định dạng'
    }

    if (!data.email.trim()) {
      newErrors.email = 'Vui lòng nhập email'
    } else if (!validateEmail(data.email)) {
      newErrors.email = 'Email không đúng định dạng'
    }

    if (!data.monthlyIncome || parseNumberInput(data.monthlyIncome) <= 0) {
      newErrors.monthlyIncome = 'Vui lòng nhập thu nhập hàng tháng'
    } else if (parseNumberInput(data.monthlyIncome) < 5000000) {
      newErrors.monthlyIncome = 'Thu nhập tối thiểu 5,000,000 VND'
    }

    if (!data.province) {
      newErrors.province = 'Vui lòng chọn tỉnh/thành phố'
    }

    if (!data.district.trim()) {
      newErrors.district = 'Vui lòng nhập quận/huyện'
    }

    if (!data.ward.trim()) {
      newErrors.ward = 'Vui lòng nhập phường/xã'
    }

    if (!data.streetName.trim()) {
      newErrors.streetName = 'Vui lòng nhập tên đường'
    }

    if (!data.houseNumber.trim()) {
      newErrors.houseNumber = 'Vui lòng nhập số nhà'
    }

    if (!data.agreeTerms) {
      newErrors.agreeTerms = 'Vui lòng đồng ý với điều khoản'
    }

    return newErrors
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const newErrors = validateForm()
    setErrors(newErrors)

    if (Object.keys(newErrors).length > 0) {
      return
    }

    setShowOTPModal(true)
  }

  const handleOTPVerified = () => {
    setShowOTPModal(false)
    onNext()
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Thông tin cá nhân
        </h2>
        <p className="text-gray-600">
          Vui lòng cung cấp thông tin cá nhân để hoàn tất đăng ký
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name */}
        <div className="form-group">
          <label className="label flex items-center">
            <User className="w-4 h-4 mr-2" />
            Họ và tên *
          </label>
          <input
            type="text"
            className={`input-field ${errors.name ? 'border-red-500' : ''}`}
            placeholder="Nhập họ và tên đầy đủ"
            value={data.name}
            onChange={(e) => handleChange('name', e.target.value)}
          />
          {errors.name && (
            <div className="flex items-center mt-1 text-red-600 text-sm">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.name}
            </div>
          )}
        </div>

        {/* Year of Birth */}
        <div className="form-group">
          <label className="label">Năm sinh *</label>
          <select
            className={`input-field ${errors.yearOfBirth ? 'border-red-500' : ''}`}
            value={data.yearOfBirth}
            onChange={(e) => handleChange('yearOfBirth', e.target.value)}
          >
            <option value="">Chọn năm sinh</option>
            {Array.from({ length: 60 }, (_, i) => {
              const year = new Date().getFullYear() - 18 - i
              return (
                <option key={year} value={year.toString()}>
                  {year}
                </option>
              )
            })}
          </select>
          {errors.yearOfBirth && (
            <div className="flex items-center mt-1 text-red-600 text-sm">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.yearOfBirth}
            </div>
          )}
        </div>

        {/* Phone */}
        <div className="form-group">
          <label className="label flex items-center">
            <Phone className="w-4 h-4 mr-2" />
            Số điện thoại *
          </label>
          <input
            type="tel"
            className={`input-field ${errors.phone ? 'border-red-500' : ''}`}
            placeholder="VD: 0912345678"
            value={data.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
          />
          {errors.phone && (
            <div className="flex items-center mt-1 text-red-600 text-sm">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.phone}
            </div>
          )}
        </div>

        {/* Email */}
        <div className="form-group">
          <label className="label flex items-center">
            <Mail className="w-4 h-4 mr-2" />
            Email *
          </label>
          <input
            type="email"
            className={`input-field ${errors.email ? 'border-red-500' : ''}`}
            placeholder="VD: example@email.com"
            value={data.email}
            onChange={(e) => handleChange('email', e.target.value)}
          />
          {errors.email && (
            <div className="flex items-center mt-1 text-red-600 text-sm">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.email}
            </div>
          )}
        </div>

        {/* Monthly Income */}
        <div className="form-group">
          <label className="label">Thu nhập hàng tháng (VND) *</label>
          <input
            type="text"
            className={`input-field ${errors.monthlyIncome ? 'border-red-500' : ''}`}
            placeholder="VD: 25,000,000"
            value={incomeDisplay}
            onChange={(e) => handleIncomeChange(e.target.value)}
          />
          {errors.monthlyIncome && (
            <div className="flex items-center mt-1 text-red-600 text-sm">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.monthlyIncome}
            </div>
          )}
        </div>

        {/* Income via Bank */}
        <div className="form-group">
          <label className="label">Hình thức nhận thu nhập *</label>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="bankTransfer"
                className="mr-2"
                checked={data.bankTransfer === true}
                onChange={() => handleChange('bankTransfer', true)}
              />
              Chuyển khoản ngân hàng
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="bankTransfer"
                className="mr-2"
                checked={data.bankTransfer === false}
                onChange={() => handleChange('bankTransfer', false)}
              />
              Tiền mặt
            </label>
          </div>
        </div>

        {/* Province */}
        <div className="form-group">
          <label className="label flex items-center">
            <MapPin className="w-4 h-4 mr-2" />
            Tỉnh/Thành phố *
          </label>
          <select
            className={`input-field ${errors.province ? 'border-red-500' : ''}`}
            value={data.province}
            onChange={(e) => handleChange('province', e.target.value)}
          >
            <option value="">Chọn tỉnh/thành phố</option>
            {PROVINCES.map(province => (
              <option key={province} value={province}>
                {province}
              </option>
            ))}
          </select>
          {errors.province && (
            <div className="flex items-center mt-1 text-red-600 text-sm">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.province}
            </div>
          )}
        </div>

        {/* District */}
        <div className="form-group">
          <label className="label">Quận/Huyện *</label>
          <input
            type="text"
            className={`input-field ${errors.district ? 'border-red-500' : ''}`}
            placeholder="VD: Quận 1"
            value={data.district}
            onChange={(e) => handleChange('district', e.target.value)}
          />
          {errors.district && (
            <div className="flex items-center mt-1 text-red-600 text-sm">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.district}
            </div>
          )}
        </div>

        {/* Ward */}
        <div className="form-group">
          <label className="label">Phường/Xã *</label>
          <input
            type="text"
            className={`input-field ${errors.ward ? 'border-red-500' : ''}`}
            placeholder="VD: Phường Bến Nghé"
            value={data.ward}
            onChange={(e) => handleChange('ward', e.target.value)}
          />
          {errors.ward && (
            <div className="flex items-center mt-1 text-red-600 text-sm">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.ward}
            </div>
          )}
        </div>

        {/* Street Name */}
        <div className="form-group">
          <label className="label">Tên đường *</label>
          <input
            type="text"
            className={`input-field ${errors.streetName ? 'border-red-500' : ''}`}
            placeholder="VD: Đường Lê Lợi"
            value={data.streetName}
            onChange={(e) => handleChange('streetName', e.target.value)}
          />
          {errors.streetName && (
            <div className="flex items-center mt-1 text-red-600 text-sm">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.streetName}
            </div>
          )}
        </div>

        {/* House Number */}
        <div className="form-group">
          <label className="label">Số nhà *</label>
          <input
            type="text"
            className={`input-field ${errors.houseNumber ? 'border-red-500' : ''}`}
            placeholder="VD: 123"
            value={data.houseNumber}
            onChange={(e) => handleChange('houseNumber', e.target.value)}
          />
          {errors.houseNumber && (
            <div className="flex items-center mt-1 text-red-600 text-sm">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.houseNumber}
            </div>
          )}
        </div>

        {/* Terms Agreement */}
        <div className="form-group">
          <label className="flex items-start">
            <input
              type="checkbox"
              className="mt-1 mr-3"
              checked={data.agreeTerms}
              onChange={(e) => handleChange('agreeTerms', e.target.checked)}
            />
            <span className="text-sm">
              Tôi đồng ý với{' '}
              <a href="#" className="text-primary-600 hover:underline">
                Điều khoản và Điều kiện
              </a>{' '}
              và{' '}
              <a href="#" className="text-primary-600 hover:underline">
                Chính sách Bảo mật
              </a>{' '}
              của Leadity
            </span>
          </label>
          {errors.agreeTerms && (
            <div className="flex items-center mt-1 text-red-600 text-sm">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.agreeTerms}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between pt-6">
          <button
            type="button"
            onClick={onBack}
            className="btn-secondary flex items-center"
          >
            Quay lại
          </button>
          <button
            type="submit"
            className="btn-primary flex items-center"
          >
            <Shield className="w-4 h-4 mr-2" />
            Xác thực OTP
          </button>
        </div>
      </form>

      {/* OTP Modal */}
      {showOTPModal && (
        <OTPModal
          phoneNumber={data.phone}
          onVerified={handleOTPVerified}
          onClose={() => setShowOTPModal(false)}
        />
      )}
    </div>
  )
} 