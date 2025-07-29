import { useState } from 'react'
import { DollarSign, AlertCircle, Info } from 'lucide-react'
import { EarlyPaymentData, FormErrors } from '../types'
import { formatVND, formatNumber, formatNumberInput, parseNumberInput, calculateEarlyRepaymentPenalty, BANKS } from '../lib/utils'

interface EarlyPaymentStepProps {
  data: EarlyPaymentData
  onDataChange: (data: EarlyPaymentData) => void
  onNext: () => void
  onBack: () => void
}

export default function EarlyPaymentStep({ 
  data, 
  onDataChange, 
  onNext, 
  onBack 
}: EarlyPaymentStepProps) {
  const [errors, setErrors] = useState<FormErrors>({})
  const [displayValues, setDisplayValues] = useState<{[key: string]: string}>({})

  const handleChange = (field: keyof EarlyPaymentData, value: string | number) => {
    const newData = { ...data, [field]: value }
    onDataChange(newData)
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' })
    }
  }

  const handleNumberChange = (field: keyof EarlyPaymentData, value: string) => {
    let numValue: number | undefined
    let displayValue: string
    
    if (field === 'originalRate') {
      // Allow decimal for interest rate - no formatting
      const cleanValue = value.replace(/[^\d.]/g, '')
      numValue = cleanValue === '' ? undefined : Number(cleanValue)
      displayValue = cleanValue
    } else {
      // For amounts, format with commas
      displayValue = formatNumberInput(value)
      numValue = parseNumberInput(value) || undefined
    }
    
    // Update display values
    setDisplayValues(prev => ({ ...prev, [field]: displayValue }))
    
    if (numValue !== undefined) {
      handleChange(field, numValue)
    } else {
      handleChange(field, '')
    }
  }

  // Get display value for input
  const getDisplayValue = (field: keyof EarlyPaymentData): string => {
    if (displayValues[field] !== undefined) {
      return displayValues[field]
    }
    
    if (field === 'originalRate') {
      return data[field] ? data[field].toString() : ''
    } else {
      return data[field] ? formatNumberInput(data[field].toString()) : ''
    }
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!data.bankName) {
      newErrors.bankName = 'Vui lòng chọn ngân hàng'
    }

    if (!data.originalAmount || data.originalAmount <= 0) {
      newErrors.originalAmount = 'Vui lòng nhập số tiền vay ban đầu'
    }

    if (!data.originalTerm || data.originalTerm <= 0) {
      newErrors.originalTerm = 'Vui lòng nhập kỳ hạn vay ban đầu'
    }

    if (!data.originalRate || data.originalRate <= 0) {
      newErrors.originalRate = 'Vui lòng nhập lãi suất ban đầu'
    }

    if (!data.monthlyPayment || data.monthlyPayment <= 0) {
      newErrors.monthlyPayment = 'Vui lòng nhập số tiền trả hàng tháng hiện tại'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      // Calculate early repayment penalty
      const penalty = data.originalAmount ? calculateEarlyRepaymentPenalty(data.originalAmount) : 0
      onDataChange({ ...data, earlyRepaymentPenalty: penalty })
      onNext()
    }
  }

  // Calculate penalty in real-time
  const penalty = data.originalAmount ? calculateEarlyRepaymentPenalty(data.originalAmount) : 0

  return (
    <div className="card max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="bg-warning-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
          <DollarSign className="h-8 w-8 text-warning-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Tính phí trả nợ trước hạn
        </h2>
        <p className="text-gray-600">
          Nhập thông tin khoản vay hiện tại để tính toán phí trả nợ trước hạn
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-start">
          <Info className="h-5 w-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Lưu ý về phí trả nợ trước hạn:</p>
            <ul className="list-disc list-inside space-y-1 text-blue-700">
              <li>Phí trả nợ trước hạn thường dao động từ 1-3% số dư nợ gốc</li>
              <li>Mức phí có thể khác nhau tùy theo ngân hàng và thời điểm trả</li>
              <li>Một số ngân hàng miễn phí sau thời gian nhất định</li>
            </ul>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="form-group">
          <label className="label">
            Ngân hàng hiện tại <span className="text-red-500">*</span>
          </label>
          <select
            className={`input-field ${errors.bankName ? 'border-red-500' : ''}`}
            value={data.bankName || ''}
            onChange={(e) => handleChange('bankName', e.target.value)}
          >
            <option value="">Chọn ngân hàng</option>
            {BANKS.map((bank) => (
              <option key={bank.value} value={bank.value}>
                {bank.label}
              </option>
            ))}
          </select>
          {errors.bankName && (
            <div className="flex items-center mt-2 text-red-600 text-sm">
              <AlertCircle className="h-4 w-4 mr-1" />
              {errors.bankName}
            </div>
          )}
        </div>

        <div className="form-group">
          <label className="label">
            Số tiền vay ban đầu <span className="text-red-500">*</span>
          </label>
                      <input
              type="text"
              className={`input-field ${errors.originalAmount ? 'border-red-500' : ''}`}
              placeholder="VD: 3,000,000,000"
              value={getDisplayValue('originalAmount')}
              onChange={(e) => handleNumberChange('originalAmount', e.target.value)}
            />
          {errors.originalAmount && (
            <div className="flex items-center mt-2 text-red-600 text-sm">
              <AlertCircle className="h-4 w-4 mr-1" />
              {errors.originalAmount}
            </div>
          )}
          <p className="text-sm text-gray-500 mt-1">Đơn vị: VND</p>
        </div>

        <div className="form-group">
          <label className="label">
            Kỳ hạn vay ban đầu <span className="text-red-500">*</span>
          </label>
                      <input
              type="text"
              className={`input-field ${errors.originalTerm ? 'border-red-500' : ''}`}
              placeholder="VD: 300"
              value={getDisplayValue('originalTerm')}
              onChange={(e) => handleNumberChange('originalTerm', e.target.value)}
            />
          {errors.originalTerm && (
            <div className="flex items-center mt-2 text-red-600 text-sm">
              <AlertCircle className="h-4 w-4 mr-1" />
              {errors.originalTerm}
            </div>
          )}
          <p className="text-sm text-gray-500 mt-1">Đơn vị: Tháng</p>
        </div>

        <div className="form-group">
          <label className="label">
            Lãi suất vay ban đầu <span className="text-red-500">*</span>
          </label>
                      <input
              type="text"
              className={`input-field ${errors.originalRate ? 'border-red-500' : ''}`}
              placeholder="VD: 9.5"
              value={getDisplayValue('originalRate')}
              onChange={(e) => handleNumberChange('originalRate', e.target.value)}
            />
          {errors.originalRate && (
            <div className="flex items-center mt-2 text-red-600 text-sm">
              <AlertCircle className="h-4 w-4 mr-1" />
              {errors.originalRate}
            </div>
          )}
          <p className="text-sm text-gray-500 mt-1">Đơn vị: %/năm</p>
        </div>

        <div className="form-group">
          <label className="label">
            Số tiền trả hàng tháng hiện tại <span className="text-red-500">*</span>
          </label>
                      <input
              type="text"
              className={`input-field ${errors.monthlyPayment ? 'border-red-500' : ''}`}
              placeholder="VD: 25,000,000"
              value={getDisplayValue('monthlyPayment')}
              onChange={(e) => handleNumberChange('monthlyPayment', e.target.value)}
            />
          {errors.monthlyPayment && (
            <div className="flex items-center mt-2 text-red-600 text-sm">
              <AlertCircle className="h-4 w-4 mr-1" />
              {errors.monthlyPayment}
            </div>
          )}
          <p className="text-sm text-gray-500 mt-1">Đơn vị: VND</p>
        </div>

        {/* Penalty Calculation Result */}
        {data.originalAmount && penalty > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-medium text-yellow-900 mb-2">Ước tính phí trả nợ trước hạn</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-yellow-800">Số dư nợ gốc:</span>
                <span className="font-medium text-yellow-900">{formatVND(data.originalAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-yellow-800">Phí trả nợ trước hạn (2%):</span>
                <span className="font-medium text-yellow-900">{formatVND(penalty)}</span>
              </div>
              <div className="border-t border-yellow-300 pt-2 flex justify-between">
                <span className="text-yellow-800 font-medium">Tổng tiền cần trả:</span>
                <span className="font-bold text-yellow-900">{formatVND(data.originalAmount + penalty)}</span>
              </div>
            </div>
            <p className="text-xs text-yellow-700 mt-2">
              * Đây chỉ là ước tính. Mức phí thực tế có thể khác nhau tùy theo chính sách của từng ngân hàng.
            </p>
          </div>
        )}

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
            className="btn-primary"
          >
            Tiếp tục
          </button>
        </div>
      </form>
    </div>
  )
} 