import { useState } from 'react'
import { User, Phone, Mail, MapPin, Shield } from 'lucide-react'
import { ContactData, FormErrors } from '../types'
import { validateEmail, validateVietnamesePhone, generateMockOTP, formatNumberInput, parseNumberInput, PROVINCES } from '../lib/utils'
import OTPModal from './OTPModal'

interface ContactStepProps {
  data: ContactData
  onDataChange: (data: ContactData) => void
  onVerified: () => void
  onBack: () => void
}

export default function ContactStep({ 
  data, 
  onDataChange, 
  onVerified, 
  onBack 
}: ContactStepProps) {
  const [errors, setErrors] = useState<FormErrors>({})
  const [showOTP, setShowOTP] = useState(false)
  const [incomeDisplay, setIncomeDisplay] = useState('')

  const handleChange = (field: keyof ContactData, value: string | number | boolean) => {
    const newData = { ...data, [field]: value }
    onDataChange(newData)
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' })
    }
  }

  const handleIncomeChange = (value: string) => {
    const displayValue = formatNumberInput(value)
    const numValue = parseNumberInput(value)
    
    setIncomeDisplay(displayValue)
    handleChange('monthlyIncome', numValue)
  }

  const getIncomeDisplayValue = (): string => {
    if (incomeDisplay) {
      return incomeDisplay
    }
    return data.monthlyIncome ? formatNumberInput(data.monthlyIncome.toString()) : ''
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!data.name.trim()) {
      newErrors.name = 'Vui lòng nhập họ và tên'
    }

    if (!data.yearOfBirth.trim()) {
      newErrors.yearOfBirth = 'Vui lòng nhập năm sinh'
    } else {
      const year = parseInt(data.yearOfBirth)
      const currentYear = new Date().getFullYear()
      if (year < 1920 || year > currentYear - 18) {
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

    if (!data.monthlyIncome || data.monthlyIncome <= 0) {
      newErrors.monthlyIncome = 'Vui lòng nhập thu nhập hàng tháng'
    }

    if (!data.province.trim()) {
      newErrors.province = 'Vui lòng chọn tỉnh/thành phố'
    }

    if (!data.district.trim()) {
      newErrors.district = 'Vui lòng nhập quận/huyện'
    }

    if (!data.ward.trim()) {
      newErrors.ward = 'Vui lòng nhập phường/xã'
    }

    if (!data.fullAddress.trim()) {
      newErrors.fullAddress = 'Vui lòng nhập địa chỉ đầy đủ'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      setShowOTP(true)
    }
  }

  const handleOTPVerified = () => {
    setShowOTP(false)
    onVerified()
  }

  return (
    <div className="card max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
          <User className="h-8 w-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Thông tin liên hệ
        </h2>
        <p className="text-gray-600">
          Cung cấp thông tin để chúng tôi có thể gửi kết quả so sánh tốt nhất cho bạn
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <User className="h-5 w-5 mr-2" />
            Thông tin cá nhân
          </h3>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="form-group">
              <label className="label">
                Họ và tên <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className={`input-field ${errors.name ? 'border-red-500' : ''}`}
                placeholder="VD: Nguyễn Văn An"
                value={data.name}
                onChange={(e) => handleChange('name', e.target.value)}
              />
              {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
            </div>

            <div className="form-group">
              <label className="label">
                Năm sinh <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className={`input-field ${errors.yearOfBirth ? 'border-red-500' : ''}`}
                placeholder="VD: 1990"
                value={data.yearOfBirth}
                onChange={(e) => handleChange('yearOfBirth', e.target.value)}
              />
              {errors.yearOfBirth && <p className="text-red-600 text-sm mt-1">{errors.yearOfBirth}</p>}
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <Phone className="h-5 w-5 mr-2" />
            Thông tin liên hệ
          </h3>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="form-group">
              <label className="label">
                Số điện thoại <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                className={`input-field ${errors.phone ? 'border-red-500' : ''}`}
                placeholder="VD: 0987654321"
                value={data.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
              />
              {errors.phone && <p className="text-red-600 text-sm mt-1">{errors.phone}</p>}
            </div>

            <div className="form-group">
              <label className="label">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                className={`input-field ${errors.email ? 'border-red-500' : ''}`}
                placeholder="VD: example@email.com"
                value={data.email}
                onChange={(e) => handleChange('email', e.target.value)}
              />
              {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
            </div>
          </div>
        </div>

        {/* Financial Information */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <Mail className="h-5 w-5 mr-2" />
            Thông tin tài chính
          </h3>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="form-group">
              <label className="label">
                Thu nhập hàng tháng <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className={`input-field ${errors.monthlyIncome ? 'border-red-500' : ''}`}
                placeholder="VD: 50,000,000"
                value={getIncomeDisplayValue()}
                onChange={(e) => handleIncomeChange(e.target.value)}
              />
              {errors.monthlyIncome && <p className="text-red-600 text-sm mt-1">{errors.monthlyIncome}</p>}
              <p className="text-sm text-gray-500 mt-1">Đơn vị: VND</p>
            </div>

            <div className="form-group">
              <label className="label">Phương thức nhận lương</label>
              <div className="flex items-center space-x-4 mt-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="bankTransfer"
                    checked={data.bankTransfer === true}
                    onChange={() => handleChange('bankTransfer', true)}
                    className="mr-2"
                  />
                  Chuyển khoản ngân hàng
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="bankTransfer"
                    checked={data.bankTransfer === false}
                    onChange={() => handleChange('bankTransfer', false)}
                    className="mr-2"
                  />
                  Tiền mặt
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Address Information */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <MapPin className="h-5 w-5 mr-2" />
            Địa chỉ
          </h3>
          
          <div className="grid md:grid-cols-3 gap-4 mb-4">
            <div className="form-group">
              <label className="label">
                Tỉnh/Thành phố <span className="text-red-500">*</span>
              </label>
              <select
                className={`input-field ${errors.province ? 'border-red-500' : ''}`}
                value={data.province}
                onChange={(e) => handleChange('province', e.target.value)}
              >
                <option value="">Chọn tỉnh/thành phố</option>
                {PROVINCES.map((province) => (
                  <option key={province} value={province}>
                    {province}
                  </option>
                ))}
              </select>
              {errors.province && <p className="text-red-600 text-sm mt-1">{errors.province}</p>}
            </div>

            <div className="form-group">
              <label className="label">
                Quận/Huyện <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className={`input-field ${errors.district ? 'border-red-500' : ''}`}
                placeholder="VD: Quận 1"
                value={data.district}
                onChange={(e) => handleChange('district', e.target.value)}
              />
              {errors.district && <p className="text-red-600 text-sm mt-1">{errors.district}</p>}
            </div>

            <div className="form-group">
              <label className="label">
                Phường/Xã <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className={`input-field ${errors.ward ? 'border-red-500' : ''}`}
                placeholder="VD: Phường Bến Nghé"
                value={data.ward}
                onChange={(e) => handleChange('ward', e.target.value)}
              />
              {errors.ward && <p className="text-red-600 text-sm mt-1">{errors.ward}</p>}
            </div>
          </div>

          <div className="form-group">
            <label className="label">
              Địa chỉ cụ thể <span className="text-red-500">*</span>
            </label>
            <textarea
              className={`input-field ${errors.fullAddress ? 'border-red-500' : ''}`}
              rows={3}
              placeholder="VD: 123 Đường Nguyễn Huệ"
              value={data.fullAddress}
              onChange={(e) => handleChange('fullAddress', e.target.value)}
            />
            {errors.fullAddress && <p className="text-red-600 text-sm mt-1">{errors.fullAddress}</p>}
          </div>
        </div>

        <div className="flex justify-between pt-6">
          <button
            type="button"
            onClick={onBack}
            className="btn-secondary"
          >
            Quay lại
          </button>
          <button
            type="submit"
            className="btn-primary flex items-center"
          >
            <Shield className="h-5 w-5 mr-2" />
            Xác thực OTP
          </button>
        </div>
      </form>

      {showOTP && (
        <OTPModal
          phoneNumber={data.phone}
          onVerified={handleOTPVerified}
          onClose={() => setShowOTP(false)}
        />
      )}
    </div>
  )
} 