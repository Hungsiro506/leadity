import { useState, useEffect } from 'react'
import { Building2, AlertCircle } from 'lucide-react'
import { NewLoanInputData, FormErrors } from '../types'
import { formatNumberInput, parseNumberInput, BANKS, COLLATERAL_TYPES } from '../lib/utils'
import { analytics } from '../lib/posthog'

interface NewLoanInputStepProps {
  data: NewLoanInputData
  onDataChange: (data: NewLoanInputData) => void
  onNext: () => void
  onBack: () => void
}

export default function NewLoanInputStep({ data, onDataChange, onNext, onBack }: NewLoanInputStepProps) {
  const [errors, setErrors] = useState<FormErrors>({})
  const [displayValues, setDisplayValues] = useState<{[key: string]: string}>({})

  useEffect(() => {
    analytics.pageView('new_loan_input')
  }, [])

  const handleNumberChange = (field: keyof NewLoanInputData, value: string) => {
    const numericValue = parseNumberInput(value)
    const formattedValue = formatNumberInput(value)
    
    setDisplayValues(prev => ({ ...prev, [field]: formattedValue }))
    onDataChange({ ...data, [field]: numericValue })
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleSelectChange = (field: keyof NewLoanInputData, value: string) => {
    onDataChange({ ...data, [field]: value })
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleBankSelection = (bankValue: string) => {
    const currentBanks = data.selectedBanks || []
    let updatedBanks: string[]
    
    if (currentBanks.includes(bankValue)) {
      updatedBanks = currentBanks.filter(bank => bank !== bankValue)
    } else {
      updatedBanks = [...currentBanks, bankValue]
    }
    
    onDataChange({ ...data, selectedBanks: updatedBanks })
    
    if (errors.selectedBanks) {
      setErrors(prev => ({ ...prev, selectedBanks: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: FormErrors = {}

    if (!data.collateralValue || parseNumberInput(data.collateralValue) <= 0) {
      newErrors.collateralValue = 'Vui lòng nhập giá trị tài sản thế chấp'
    }

    if (!data.collateralType) {
      newErrors.collateralType = 'Vui lòng chọn loại tài sản thế chấp'
    }

    if (!data.loanAmount || parseNumberInput(data.loanAmount) <= 0) {
      newErrors.loanAmount = 'Vui lòng nhập số tiền muốn vay'
    } else if (data.collateralValue && parseNumberInput(data.loanAmount) > parseNumberInput(data.collateralValue) * 0.7) {
      newErrors.loanAmount = 'Số tiền vay không được vượt quá 70% giá trị tài sản thế chấp'
    }

    if (!data.desiredRate || parseNumberInput(data.desiredRate) <= 0) {
      newErrors.desiredRate = 'Vui lòng nhập lãi suất mong muốn'
    } else if (parseNumberInput(data.desiredRate) > 30) {
      newErrors.desiredRate = 'Lãi suất không hợp lệ'
    }

    if (!data.loanTerm || parseNumberInput(data.loanTerm) <= 0) {
      newErrors.loanTerm = 'Vui lòng nhập kỳ hạn vay'
    } else if (parseNumberInput(data.loanTerm) > 360) {
      newErrors.loanTerm = 'Kỳ hạn vay không được vượt quá 360 tháng'
    }

    if (!data.selectedBanks || data.selectedBanks.length === 0) {
      newErrors.selectedBanks = 'Vui lòng chọn ít nhất một ngân hàng để so sánh'
    } else if (data.selectedBanks.length > 4) {
      newErrors.selectedBanks = 'Chỉ được chọn tối đa 4 ngân hàng'
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

    onNext()
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Thông tin vay và tài sản thế chấp
        </h2>
        <p className="text-gray-600">
          Vui lòng cung cấp thông tin về tài sản thế chấp và khoản vay mong muốn
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Collateral Value */}
        <div className="form-group">
          <label className="label flex items-center">
            <Building2 className="w-4 h-4 mr-2" />
            Giá trị tài sản thế chấp (VND) *
          </label>
          <input
            type="text"
            className={`input-field ${errors.collateralValue ? 'border-red-500' : ''}`}
            placeholder="VD: 2,000,000,000"
            value={displayValues.collateralValue || ''}
            onChange={(e) => handleNumberChange('collateralValue', e.target.value)}
          />
          {errors.collateralValue && (
            <div className="flex items-center mt-1 text-red-600 text-sm">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.collateralValue}
            </div>
          )}
        </div>

        {/* Collateral Type */}
        <div className="form-group">
          <label className="label">Loại tài sản thế chấp *</label>
          <select
            className={`input-field ${errors.collateralType ? 'border-red-500' : ''}`}
            value={data.collateralType || ''}
            onChange={(e) => handleSelectChange('collateralType', e.target.value)}
          >
            <option value="">Chọn loại tài sản</option>
            {COLLATERAL_TYPES.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
          {errors.collateralType && (
            <div className="flex items-center mt-1 text-red-600 text-sm">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.collateralType}
            </div>
          )}
        </div>

        {/* Loan Amount */}
        <div className="form-group">
          <label className="label">Số tiền muốn vay (VND) *</label>
          <input
            type="text"
            className={`input-field ${errors.loanAmount ? 'border-red-500' : ''}`}
            placeholder="VD: 1,400,000,000"
            value={displayValues.loanAmount || ''}
            onChange={(e) => handleNumberChange('loanAmount', e.target.value)}
          />
          {data.collateralValue && (
            <p className="text-sm text-gray-500 mt-1">
              Tối đa: {formatNumberInput((parseNumberInput(data.collateralValue) * 0.7).toString())} VND (70% giá trị tài sản)
            </p>
          )}
          {errors.loanAmount && (
            <div className="flex items-center mt-1 text-red-600 text-sm">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.loanAmount}
            </div>
          )}
        </div>

        {/* Desired Interest Rate */}
        <div className="form-group">
          <label className="label">Lãi suất mong muốn (%) *</label>
          <input
            type="number"
            step="0.1"
            className={`input-field ${errors.desiredRate ? 'border-red-500' : ''}`}
            placeholder="VD: 8.5"
            value={data.desiredRate || ''}
            onChange={(e) => handleSelectChange('desiredRate', e.target.value)}
          />
          {errors.desiredRate && (
            <div className="flex items-center mt-1 text-red-600 text-sm">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.desiredRate}
            </div>
          )}
        </div>

        {/* Loan Term */}
        <div className="form-group">
          <label className="label">Kỳ hạn mong muốn (Tháng) *</label>
          <input
            type="number"
            className={`input-field ${errors.loanTerm ? 'border-red-500' : ''}`}
            placeholder="VD: 240"
            value={data.loanTerm || ''}
            onChange={(e) => handleSelectChange('loanTerm', e.target.value)}
          />
          {errors.loanTerm && (
            <div className="flex items-center mt-1 text-red-600 text-sm">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.loanTerm}
            </div>
          )}
        </div>

        {/* Bank Selection */}
        <div className="form-group">
          <label className="label">Ngân hàng tham khảo * (Chọn 1-4 ngân hàng)</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {BANKS.map(bank => (
              <div
                key={bank.value}
                onClick={() => handleBankSelection(bank.value)}
                className={`p-3 border-2 rounded-lg cursor-pointer transition-all duration-200 text-center ${
                  data.selectedBanks?.includes(bank.value)
                    ? 'border-primary-600 bg-primary-50 text-primary-700'
                    : 'border-gray-300 hover:border-primary-300'
                }`}
              >
                <div className="font-medium">{bank.label}</div>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Đã chọn: {data.selectedBanks?.length || 0}/4 ngân hàng
          </p>
          {errors.selectedBanks && (
            <div className="flex items-center mt-1 text-red-600 text-sm">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.selectedBanks}
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
            className="btn-primary"
          >
            Tiếp tục
          </button>
        </div>
      </form>
    </div>
  )
} 