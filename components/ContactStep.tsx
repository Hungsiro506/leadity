import React, { useState, useEffect } from 'react'
import { Shield, User, Phone, Mail, MapPin, Building, DollarSign, CreditCard, FileText, Clock, Eye, EyeOff } from 'lucide-react'
import { ContactData, BankingContactData } from '../types'
import { formatNumberInput, parseNumberInput } from '../lib/utils'
import { analytics } from '../lib/posthog'
import OTPModal from './OTPModal'

interface ContactStepProps {
  onNext: (data: BankingContactData) => void
  onBack: () => void
}

const ContactStep: React.FC<ContactStepProps> = ({ onNext, onBack }) => {
  // Basic contact data
  const [contactData, setContactData] = useState<ContactData>({
    name: '',
    yearOfBirth: '',
    phone: '',
    email: '',
    monthlyIncome: '',
    bankTransfer: false,
    province: '',
    district: '',
    ward: ''
  })

  // Enhanced banking data
  const [bankingData, setBankingData] = useState({
    // Identity & Verification
    nationalId: '',
    nationalIdIssueDate: '',
    nationalIdIssuePlace: '',
    
    // Employment & Income
    employmentType: 'employee' as 'employee' | 'self_employed' | 'business_owner' | 'retired',
    employerName: '',
    workExperienceYears: 1,
    incomeVerificationMethod: 'bank_statement' as 'bank_statement' | 'payslip' | 'tax_return' | 'self_declared',
    
    // Banking History
    existingBankRelationships: [] as string[],
    loanHistory: 'first_time' as 'first_time' | 'repeat' | 'excellent' | 'previous_default',
    creditCardOwnership: false,
    
    // Loan Purpose & Preferences
    loanPurpose: 'refinancing' as 'home_purchase' | 'refinancing' | 'investment' | 'consolidation' | 'other',
    preferredContactMethod: 'email' as 'email' | 'sms' | 'phone' | 'in_person',
    
    // Consent & Verification
    cisVerificationConsent: false,
    creditBureauCheckConsent: false,
    marketingConsent: false
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showOTPModal, setShowOTPModal] = useState(false)
  const [incomeDisplay, setIncomeDisplay] = useState('')
  const [otpCode, setOtpCode] = useState('')
  const [otpAttempts, setOtpAttempts] = useState(0)
  const [stepStartTime] = useState(Date.now())
  const [showNationalId, setShowNationalId] = useState(false)
  const [cisVerificationStarted, setCisVerificationStarted] = useState(false)

  // Available banks for selection
  const availableBanks = ['BIDV', 'VPBank', 'Techcombank', 'VIB', 'Vietcombank', 'Agribank', 'ACB', 'MBBank', 'TPBank', 'SHB']
  
  // Vietnamese provinces
  const provinces = ['Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ', 'An Giang', 'Bà Rịa - Vũng Tàu', 'Bắc Giang', 'Bắc Kạn', 'Bạc Liêu', 'Bắc Ninh', 'Bến Tre', 'Bình Định', 'Bình Dương', 'Bình Phước', 'Bình Thuận', 'Cà Mau', 'Cao Bằng', 'Đắk Lắk', 'Đắk Nông', 'Điện Biên', 'Đồng Nai', 'Đồng Tháp', 'Gia Lai', 'Hà Giang', 'Hà Nam', 'Hà Tĩnh', 'Hải Dương', 'Hậu Giang', 'Hòa Bình', 'Hưng Yên', 'Khánh Hòa', 'Kiên Giang', 'Kon Tum', 'Lai Châu', 'Lâm Đồng', 'Lạng Sơn', 'Lào Cai', 'Long An', 'Nam Định', 'Nghệ An', 'Ninh Bình', 'Ninh Thuận', 'Phú Thọ', 'Phú Yên', 'Quảng Bình', 'Quảng Nam', 'Quảng Ngãi', 'Quảng Ninh', 'Quảng Trị', 'Sóc Trăng', 'Sơn La', 'Tây Ninh', 'Thái Bình', 'Thái Nguyên', 'Thanh Hóa', 'Thừa Thiên Huế', 'Tiền Giang', 'Trà Vinh', 'Tuyên Quang', 'Vĩnh Long', 'Vĩnh Phúc', 'Yên Bái']

  useEffect(() => {
    analytics.pageView('contact_step')
    const startTime = Date.now()

    const handleUnload = () => {
      // Track form abandonment with a custom event
      analytics.regulatoryDisclosureShown('terms_conditions', false, 0)
    }

    window.addEventListener('beforeunload', handleUnload)
    return () => {
      window.removeEventListener('beforeunload', handleUnload)
    }
  }, [])

  const handleContactDataChange = (field: keyof ContactData, value: string | boolean) => {
    setContactData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleBankingDataChange = (field: string, value: any) => {
    setBankingData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleIncomeChange = (value: string) => {
    const formatted = formatNumberInput(value)
    setIncomeDisplay(formatted)
    const parsed = parseNumberInput(formatted)
    handleContactDataChange('monthlyIncome', parsed.toString())
  }

  const handleBankSelection = (bankName: string) => {
    const currentBanks = bankingData.existingBankRelationships
    if (currentBanks.includes(bankName)) {
      handleBankingDataChange('existingBankRelationships', currentBanks.filter(b => b !== bankName))
    } else {
      handleBankingDataChange('existingBankRelationships', [...currentBanks, bankName])
    }
  }

  const initiateVirtualCISVerification = () => {
    if (!cisVerificationStarted && contactData.name && bankingData.nationalId) {
      setCisVerificationStarted(true)
      
      // Track CIS verification initiation
      analytics.cisVerificationInitiated('national_id', 'government_id')
      
      // Simulate CIS verification process
      setTimeout(() => {
        const verificationScore = Math.floor(Math.random() * 20) + 80 // 80-100 score
        const success = verificationScore >= 85
        const issues = success ? [] : ['Minor data mismatch detected']
        
        // Track CIS verification completion
        analytics.cisVerificationCompleted(success, verificationScore, 3, issues)
        
        if (success) {
          handleBankingDataChange('cisVerificationConsent', true)
          // Also simulate KYC document upload
          analytics.kycDocumentUploaded('national_id', 2.3, verificationScore)
          analytics.kycVerificationPassed('enhanced', !success, verificationScore)
        }
      }, 3000)
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    // Basic validation
    if (!contactData.name.trim()) newErrors.name = 'Vui lòng nhập họ tên'
    if (!contactData.phone.trim()) newErrors.phone = 'Vui lòng nhập số điện thoại'
    if (!contactData.email.trim()) newErrors.email = 'Vui lòng nhập email'
    if (!contactData.monthlyIncome) newErrors.monthlyIncome = 'Vui lòng nhập thu nhập'
    if (!contactData.province) newErrors.province = 'Vui lòng chọn tỉnh/thành phố'

    // Banking-specific validation
    if (!bankingData.nationalId.trim()) newErrors.nationalId = 'Vui lòng nhập CMND/CCCD'
    if (!bankingData.nationalIdIssueDate) newErrors.nationalIdIssueDate = 'Vui lòng nhập ngày cấp'
    if (!bankingData.nationalIdIssuePlace.trim()) newErrors.nationalIdIssuePlace = 'Vui lòng nhập nơi cấp'
    
    if (bankingData.employmentType === 'employee' && !bankingData.employerName.trim()) {
      newErrors.employerName = 'Vui lòng nhập tên công ty'
    }

    // Consent validation
    if (!bankingData.cisVerificationConsent) {
      newErrors.cisVerificationConsent = 'Vui lòng đồng ý xác thực CIS'
    }
    if (!bankingData.creditBureauCheckConsent) {
      newErrors.creditBureauCheckConsent = 'Vui lòng đồng ý kiểm tra tín dụng'
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (contactData.email && !emailRegex.test(contactData.email)) {
      newErrors.email = 'Email không hợp lệ'
    }

    // Phone validation
    const phoneRegex = /^[0-9]{10,11}$/
    if (contactData.phone && !phoneRegex.test(contactData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Số điện thoại không hợp lệ'
    }

    // National ID validation
    const nationalIdRegex = /^[0-9]{9,12}$/
    if (bankingData.nationalId && !nationalIdRegex.test(bankingData.nationalId)) {
      newErrors.nationalId = 'CMND/CCCD không hợp lệ'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      // Track validation errors
      analytics.fraudAlertTriggered('behavioral', 30, 'form_validation_failed', false)
      return
    }

    // Track income verification request - handle self_declared case
    const verificationMethod = bankingData.incomeVerificationMethod === 'self_declared' 
      ? 'bank_statement' 
      : bankingData.incomeVerificationMethod as 'bank_statement' | 'payslip' | 'tax_return'
    
    analytics.incomeVerificationRequested(
      verificationMethod,
      [verificationMethod],
      bankingData.employmentType === 'employee'
    )

    // Simulate credit bureau check initiation
    if (bankingData.creditBureauCheckConsent) {
      analytics.creditBureauCheckInitiated('CIC', 'basic', true)
    }

    setShowOTPModal(true)
  }

  const handleOTPVerified = () => {
    setShowOTPModal(false)
    
    // Calculate risk assessment
    const riskFactors = []
    let fraudScore = 20 // Base score
    
    if (bankingData.loanHistory === 'previous_default') {
      riskFactors.push('Previous loan default')
      fraudScore += 30
    }
    if (bankingData.employmentType === 'self_employed') {
      riskFactors.push('Self-employed income')
      fraudScore += 10
    }
    if (parseNumberInput(contactData.monthlyIncome) < 20000000) {
      riskFactors.push('Low income')
      fraudScore += 15
    }
    if (bankingData.workExperienceYears < 2) {
      riskFactors.push('Limited work experience')
      fraudScore += 10
    }

    const riskCategory = fraudScore > 60 ? 'high' : fraudScore > 35 ? 'medium' : 'low'
    
    // Track risk assessment
    analytics.riskAssessmentCompleted(riskCategory, fraudScore, riskFactors)

    // Simulate income verification completion
    const verifiedIncome = parseNumberInput(contactData.monthlyIncome)
    const stabilityScore = bankingData.workExperienceYears * 10 + (bankingData.employmentType === 'employee' ? 20 : 0)
    
    analytics.incomeVerificationCompleted(
      verifiedIncome,
      Math.min(stabilityScore, 100),
      bankingData.workExperienceYears * 12,
      'stable'
    )

    // Calculate affordability (simplified)
    const maxAffordable = verifiedIncome * 0.3 * 240 // 30% of income for 20 years
    const ltvRatio = 70 // Assume 70% LTV
    const stressTestPassed = fraudScore < 50
    
    analytics.affordabilityAssessmentCompleted(
      0.3, // Assume 30% DTI
      ltvRatio,
      stressTestPassed,
      maxAffordable,
      240
    )

    // Simulate AML screening
    analytics.amlScreeningTriggered('name_match', 'Vietnam_AML_System')
    setTimeout(() => {
      analytics.amlScreeningCompleted('clear', 'low', false)
    }, 1000)

    const combinedData: BankingContactData = {
      ...contactData,
      ...bankingData
    }
    
    onNext(combinedData)
  }

  const handleBack = () => {
    // Track step navigation
    analytics.regulatoryDisclosureShown('apr', false, 5)
    onBack()
  }

  // Trigger CIS verification when required fields are filled
  useEffect(() => {
    if (contactData.name && bankingData.nationalId && !cisVerificationStarted) {
      const timer = setTimeout(() => {
        initiateVirtualCISVerification()
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [contactData.name, bankingData.nationalId, cisVerificationStarted])

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Thông tin liên hệ & Xác thực</h2>
        <p className="text-gray-600">Vui lòng cung cấp thông tin để hoàn tất quy trình so sánh</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <User className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Thông tin cá nhân</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-group">
              <label className="label">Họ và tên *</label>
              <input
                type="text"
                value={contactData.name}
                onChange={(e) => handleContactDataChange('name', e.target.value)}
                className={`input ${errors.name ? 'border-red-500' : ''}`}
                placeholder="Nguyễn Văn An"
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            <div className="form-group">
              <label className="label">Năm sinh *</label>
              <input
                type="number"
                min="1950"
                max="2005"
                value={contactData.yearOfBirth}
                onChange={(e) => handleContactDataChange('yearOfBirth', e.target.value)}
                className={`input ${errors.yearOfBirth ? 'border-red-500' : ''}`}
                placeholder="1990"
              />
              {errors.yearOfBirth && <p className="text-red-500 text-sm mt-1">{errors.yearOfBirth}</p>}
            </div>

            <div className="form-group">
              <label className="label">Số điện thoại *</label>
              <input
                type="tel"
                value={contactData.phone}
                onChange={(e) => handleContactDataChange('phone', e.target.value)}
                className={`input ${errors.phone ? 'border-red-500' : ''}`}
                placeholder="0901234567"
              />
              {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
            </div>

            <div className="form-group">
              <label className="label">Email *</label>
              <input
                type="email"
                value={contactData.email}
                onChange={(e) => handleContactDataChange('email', e.target.value)}
                className={`input ${errors.email ? 'border-red-500' : ''}`}
                placeholder="email@example.com"
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>
          </div>
        </div>

        {/* Identity Verification Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="h-5 w-5 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">Xác thực danh tính</h3>
            {bankingData.cisVerificationConsent && (
              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">✓ CIS Verified</span>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-group">
              <label className="label">Số CMND/CCCD *</label>
              <div className="relative">
                <input
                  type={showNationalId ? "text" : "password"}
                  value={bankingData.nationalId}
                  onChange={(e) => handleBankingDataChange('nationalId', e.target.value)}
                  className={`input pr-10 ${errors.nationalId ? 'border-red-500' : ''}`}
                  placeholder="123456789012"
                />
                <button
                  type="button"
                  onClick={() => setShowNationalId(!showNationalId)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showNationalId ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.nationalId && <p className="text-red-500 text-sm mt-1">{errors.nationalId}</p>}
            </div>

            <div className="form-group">
              <label className="label">Ngày cấp *</label>
              <input
                type="date"
                value={bankingData.nationalIdIssueDate}
                onChange={(e) => handleBankingDataChange('nationalIdIssueDate', e.target.value)}
                className={`input ${errors.nationalIdIssueDate ? 'border-red-500' : ''}`}
              />
              {errors.nationalIdIssueDate && <p className="text-red-500 text-sm mt-1">{errors.nationalIdIssueDate}</p>}
            </div>

            <div className="form-group md:col-span-2">
              <label className="label">Nơi cấp *</label>
              <input
                type="text"
                value={bankingData.nationalIdIssuePlace}
                onChange={(e) => handleBankingDataChange('nationalIdIssuePlace', e.target.value)}
                className={`input ${errors.nationalIdIssuePlace ? 'border-red-500' : ''}`}
                placeholder="Công an TP. Hồ Chí Minh"
              />
              {errors.nationalIdIssuePlace && <p className="text-red-500 text-sm mt-1">{errors.nationalIdIssuePlace}</p>}
            </div>
          </div>
        </div>

        {/* Employment & Income Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Building className="h-5 w-5 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-900">Thông tin nghề nghiệp & Thu nhập</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-group">
              <label className="label">Loại hình việc làm *</label>
              <select
                value={bankingData.employmentType}
                onChange={(e) => handleBankingDataChange('employmentType', e.target.value)}
                className="input"
              >
                <option value="employee">Nhân viên</option>
                <option value="self_employed">Tự kinh doanh</option>
                <option value="business_owner">Chủ doanh nghiệp</option>
                <option value="retired">Đã nghỉ hưu</option>
              </select>
            </div>

            {bankingData.employmentType === 'employee' && (
              <div className="form-group">
                <label className="label">Tên công ty *</label>
                <input
                  type="text"
                  value={bankingData.employerName}
                  onChange={(e) => handleBankingDataChange('employerName', e.target.value)}
                  className={`input ${errors.employerName ? 'border-red-500' : ''}`}
                  placeholder="Công ty ABC"
                />
                {errors.employerName && <p className="text-red-500 text-sm mt-1">{errors.employerName}</p>}
              </div>
            )}

            <div className="form-group">
              <label className="label">Số năm kinh nghiệm làm việc *</label>
              <input
                type="number"
                min="0"
                max="50"
                value={bankingData.workExperienceYears}
                onChange={(e) => handleBankingDataChange('workExperienceYears', parseInt(e.target.value) || 0)}
                className="input"
              />
            </div>

            <div className="form-group">
              <label className="label">Phương thức xác minh thu nhập *</label>
              <select
                value={bankingData.incomeVerificationMethod}
                onChange={(e) => handleBankingDataChange('incomeVerificationMethod', e.target.value)}
                className="input"
              >
                <option value="bank_statement">Sao kê ngân hàng</option>
                <option value="payslip">Phiếu lương</option>
                <option value="tax_return">Tờ khai thuế</option>
                <option value="self_declared">Tự kê khai</option>
              </select>
            </div>

            <div className="form-group">
              <label className="label">Thu nhập hàng tháng (VND) *</label>
              <input
                type="text"
                value={incomeDisplay}
                onChange={(e) => handleIncomeChange(e.target.value)}
                className={`input ${errors.monthlyIncome ? 'border-red-500' : ''}`}
                placeholder="50,000,000"
              />
              {errors.monthlyIncome && <p className="text-red-500 text-sm mt-1">{errors.monthlyIncome}</p>}
            </div>

            <div className="form-group">
              <label className="label">Mục đích vay *</label>
              <select
                value={bankingData.loanPurpose}
                onChange={(e) => handleBankingDataChange('loanPurpose', e.target.value)}
                className="input"
              >
                <option value="refinancing">Tái cơ cấu khoản vay</option>
                <option value="home_purchase">Mua nhà</option>
                <option value="investment">Đầu tư</option>
                <option value="consolidation">Hợp nhất nợ</option>
                <option value="other">Khác</option>
              </select>
            </div>
          </div>
        </div>

        {/* Banking History Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <CreditCard className="h-5 w-5 text-orange-600" />
            <h3 className="text-lg font-semibold text-gray-900">Lịch sử ngân hàng</h3>
          </div>
          
          <div className="space-y-4">
            <div className="form-group">
              <label className="label">Ngân hàng đang có quan hệ (chọn nhiều)</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {availableBanks.map(bank => (
                  <label key={bank} className="flex items-center space-x-2 p-2 border rounded hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={bankingData.existingBankRelationships.includes(bank)}
                      onChange={() => handleBankSelection(bank)}
                      className="text-blue-600"
                    />
                    <span className="text-sm">{bank}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-group">
                <label className="label">Lịch sử vay *</label>
                <select
                  value={bankingData.loanHistory}
                  onChange={(e) => handleBankingDataChange('loanHistory', e.target.value)}
                  className="input"
                >
                  <option value="first_time">Lần đầu vay</option>
                  <option value="repeat">Đã vay trước đây</option>
                  <option value="excellent">Lịch sử tốt</option>
                  <option value="previous_default">Từng có nợ xấu</option>
                </select>
              </div>

              <div className="form-group">
                <label className="label">Sở hữu thẻ tín dụng</label>
                <select
                  value={bankingData.creditCardOwnership.toString()}
                  onChange={(e) => handleBankingDataChange('creditCardOwnership', e.target.value === 'true')}
                  className="input"
                >
                  <option value="false">Không</option>
                  <option value="true">Có</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Location Information */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="h-5 w-5 text-red-600" />
            <h3 className="text-lg font-semibold text-gray-900">Địa chỉ liên hệ</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="form-group">
              <label className="label">Tỉnh/Thành phố *</label>
              <select
                value={contactData.province}
                onChange={(e) => handleContactDataChange('province', e.target.value)}
                className={`input ${errors.province ? 'border-red-500' : ''}`}
              >
                <option value="">Chọn tỉnh/thành phố</option>
                {provinces.map(province => (
                  <option key={province} value={province}>{province}</option>
                ))}
              </select>
              {errors.province && <p className="text-red-500 text-sm mt-1">{errors.province}</p>}
            </div>

            <div className="form-group">
              <label className="label">Quận/Huyện</label>
              <input
                type="text"
                value={contactData.district}
                onChange={(e) => handleContactDataChange('district', e.target.value)}
                className="input"
                placeholder="Quận 1"
              />
            </div>

            <div className="form-group">
              <label className="label">Phường/Xã</label>
              <input
                type="text"
                value={contactData.ward}
                onChange={(e) => handleContactDataChange('ward', e.target.value)}
                className="input"
                placeholder="Phường Bến Nghé"
              />
            </div>
          </div>

          <div className="form-group mt-4">
            <label className="label">Phương thức liên hệ ưa thích *</label>
            <select
              value={bankingData.preferredContactMethod}
              onChange={(e) => handleBankingDataChange('preferredContactMethod', e.target.value)}
              className="input"
            >
              <option value="email">Email</option>
              <option value="sms">SMS</option>
              <option value="phone">Điện thoại</option>
              <option value="in_person">Trực tiếp</option>
            </select>
          </div>
        </div>

        {/* Consent & Verification */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="h-5 w-5 text-indigo-600" />
            <h3 className="text-lg font-semibold text-gray-900">Đồng ý & Xác thực</h3>
          </div>
          
          <div className="space-y-4">
            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={bankingData.cisVerificationConsent}
                onChange={(e) => handleBankingDataChange('cisVerificationConsent', e.target.checked)}
                className="mt-1 text-blue-600"
              />
              <span className="text-sm text-gray-700">
                Tôi đồng ý cho phép xác thực thông tin qua hệ thống CIS (Customer Information System) *
                {bankingData.cisVerificationConsent && <span className="text-green-600 ml-2">✓ Đã xác thực</span>}
              </span>
            </label>
            {errors.cisVerificationConsent && <p className="text-red-500 text-sm">{errors.cisVerificationConsent}</p>}

            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={bankingData.creditBureauCheckConsent}
                onChange={(e) => handleBankingDataChange('creditBureauCheckConsent', e.target.checked)}
                className="mt-1 text-blue-600"
              />
              <span className="text-sm text-gray-700">
                Tôi đồng ý cho phép kiểm tra thông tin tín dụng qua Trung tâm Thông tin Tín dụng (CIC) *
              </span>
            </label>
            {errors.creditBureauCheckConsent && <p className="text-red-500 text-sm">{errors.creditBureauCheckConsent}</p>}

            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={bankingData.marketingConsent}
                onChange={(e) => handleBankingDataChange('marketingConsent', e.target.checked)}
                className="mt-1 text-blue-600"
              />
              <span className="text-sm text-gray-700">
                Tôi đồng ý nhận thông tin sản phẩm và dịch vụ từ Leadity
              </span>
            </label>

            <div className="form-group">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={contactData.bankTransfer}
                  onChange={(e) => handleContactDataChange('bankTransfer', e.target.checked)}
                  className="text-blue-600"
                />
                <span className="text-sm text-gray-700">Thu nhập qua chuyển khoản ngân hàng</span>
              </label>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="button"
            onClick={handleBack}
            className="flex-1 py-3 px-6 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
          >
            Quay lại
          </button>
          <button
            type="submit"
            className="flex-1 py-3 px-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:opacity-90 transition-opacity"
          >
            Xác thực & Tiếp tục
          </button>
        </div>
      </form>

      {showOTPModal && (
        <OTPModal
          phoneNumber={contactData.phone}
          onVerified={handleOTPVerified}
          onClose={() => setShowOTPModal(false)}
        />
      )}
    </div>
  )
}

export default ContactStep 