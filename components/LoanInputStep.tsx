import { useState } from 'react'
import { Calculator, AlertCircle } from 'lucide-react'
import { FlowType, LoanInputData, FormErrors } from '../types'
import { formatVND, formatNumber, formatNumberInput, parseNumberInput } from '../lib/utils'

interface LoanInputStepProps {
  flowType: FlowType
  data: LoanInputData
  onDataChange: (data: LoanInputData) => void
  onNext: () => void
  onBack: () => void
}

export default function LoanInputStep({ 
  flowType, 
  data, 
  onDataChange, 
  onNext, 
  onBack 
}: LoanInputStepProps) {
  const [errors, setErrors] = useState<FormErrors>({})
  const [displayValues, setDisplayValues] = useState<{[key: string]: string}>({})

  const handleChange = (field: keyof LoanInputData, value: string) => {
    let numValue: number | undefined
    let displayValue: string
    
    if (field === 'desiredRate') {
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
    
    const newData = { ...data, [field]: numValue }
    onDataChange(newData)
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' })
    }
  }

  // Get display value for input
  const getDisplayValue = (field: keyof LoanInputData): string => {
    if (displayValues[field] !== undefined) {
      return displayValues[field]
    }
    
    if (field === 'desiredRate') {
      return data[field] ? data[field].toString() : ''
    } else {
      return data[field] ? formatNumberInput(data[field].toString()) : ''
    }
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (flowType === 'existing') {
      if (!data.currentLoan || parseNumberInput(data.currentLoan) <= 0) {
        newErrors.currentLoan = 'Vui lòng nhập dư nợ khoản vay hiện tại'
      }
    }

    if (!data.newLoanAmount || parseNumberInput(data.newLoanAmount) <= 0) {
      newErrors.newLoanAmount = 'Vui lòng nhập số tiền vay mới'
    }

    if (!data.loanTerm || parseNumberInput(data.loanTerm) <= 0) {
      newErrors.loanTerm = 'Vui lòng nhập kỳ hạn vay'
    } else if (parseNumberInput(data.loanTerm) > 360) {
      newErrors.loanTerm = 'Kỳ hạn vay không được vượt quá 360 tháng'
    }

    if (!data.desiredRate || parseNumberInput(data.desiredRate) <= 0) {
      newErrors.desiredRate = 'Vui lòng nhập lãi suất mong muốn'
    } else if (parseNumberInput(data.desiredRate) > 30) {
      newErrors.desiredRate = 'Lãi suất không hợp lệ'
    }

    // Validation for existing loan flow
    if (flowType === 'existing' && data.currentLoan && data.newLoanAmount) {
      if (parseNumberInput(data.newLoanAmount) > parseNumberInput(data.currentLoan)) {
        newErrors.newLoanAmount = `Khoản vay mới không được vượt quá ${formatVND(parseNumberInput(data.currentLoan))}`
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      onNext()
    }
  }

  return (
    <div className="card max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
          <Calculator className="h-8 w-8 text-primary-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {flowType === 'existing' ? 'Thông tin khoản vay hiện tại' : 'Thông tin khoản vay mới'}
        </h2>
        <p className="text-gray-600">
          {flowType === 'existing' 
            ? 'Nhập thông tin về khoản vay thế chấp hiện tại của bạn'
            : 'Nhập thông tin về khoản vay bạn muốn so sánh'
          }
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {flowType === 'existing' && (
          <div className="form-group">
            <label className="label">
              Dư nợ khoản vay thế chấp hiện tại <span className="text-red-500">*</span>
            </label>
                          <input
                type="text"
                className={`input-field ${errors.currentLoan ? 'border-red-500' : ''}`}
                placeholder="VD: 2,000,000,000"
                value={getDisplayValue('currentLoan')}
                onChange={(e) => handleChange('currentLoan', e.target.value)}
              />
            {errors.currentLoan && (
              <div className="flex items-center mt-2 text-red-600 text-sm">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.currentLoan}
              </div>
            )}
            <p className="text-sm text-gray-500 mt-1">Đơn vị: VND</p>
          </div>
        )}

        <div className="form-group">
          <label className="label">
            {flowType === 'existing' ? 'Khoản vay mới để so sánh' : 'Số tiền vay'} <span className="text-red-500">*</span>
          </label>
                      <input
              type="text"
              className={`input-field ${errors.newLoanAmount ? 'border-red-500' : ''}`}
              placeholder="VD: 1,500,000,000"
              value={getDisplayValue('newLoanAmount')}
              onChange={(e) => handleChange('newLoanAmount', e.target.value)}
            />
          {errors.newLoanAmount && (
            <div className="flex items-center mt-2 text-red-600 text-sm">
              <AlertCircle className="h-4 w-4 mr-1" />
              {errors.newLoanAmount}
            </div>
          )}
          <p className="text-sm text-gray-500 mt-1">
            Đơn vị: VND
            {flowType === 'existing' && data.currentLoan && (
              <span className="ml-2">
                (Không được vượt quá {formatVND(parseNumberInput(data.currentLoan))})
              </span>
            )}
          </p>
        </div>

        <div className="form-group">
          <label className="label">
            Kỳ hạn vay mới <span className="text-red-500">*</span>
          </label>
                      <input
              type="text"
              className={`input-field ${errors.loanTerm ? 'border-red-500' : ''}`}
              placeholder="VD: 240"
              value={getDisplayValue('loanTerm')}
              onChange={(e) => handleChange('loanTerm', e.target.value)}
            />
          {errors.loanTerm && (
            <div className="flex items-center mt-2 text-red-600 text-sm">
              <AlertCircle className="h-4 w-4 mr-1" />
              {errors.loanTerm}
            </div>
          )}
          <p className="text-sm text-gray-500 mt-1">
            Đơn vị: Tháng (Tối đa 360 tháng)
            {flowType === 'existing' && (
              <span className="block">Không được lớn hơn kỳ hạn còn lại của khoản vay hiện tại</span>
            )}
          </p>
        </div>

        <div className="form-group">
          <label className="label">
            Lãi suất mong muốn <span className="text-red-500">*</span>
          </label>
                      <input
              type="text"
              className={`input-field ${errors.desiredRate ? 'border-red-500' : ''}`}
              placeholder="VD: 8.5"
              value={getDisplayValue('desiredRate')}
              onChange={(e) => handleChange('desiredRate', e.target.value)}
            />
          {errors.desiredRate && (
            <div className="flex items-center mt-2 text-red-600 text-sm">
              <AlertCircle className="h-4 w-4 mr-1" />
              {errors.desiredRate}
            </div>
          )}
          <p className="text-sm text-gray-500 mt-1">Đơn vị: %/năm</p>
        </div>

        {/* Summary Box */}
        {data.newLoanAmount && data.loanTerm && data.desiredRate && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Tóm tắt thông tin</h4>
            <div className="space-y-1 text-sm text-blue-800">
              {flowType === 'existing' && data.currentLoan && (
                <p>Dư nợ hiện tại: <span className="font-medium">{formatVND(parseNumberInput(data.currentLoan))}</span></p>
              )}
              <p>Số tiền vay mới: <span className="font-medium">{formatVND(parseNumberInput(data.newLoanAmount))}</span></p>
              <p>Kỳ hạn: <span className="font-medium">{data.loanTerm} tháng ({Math.round(parseNumberInput(data.loanTerm) / 12)} năm)</span></p>
              <p>Lãi suất mong muốn: <span className="font-medium">{data.desiredRate}%/năm</span></p>
            </div>
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