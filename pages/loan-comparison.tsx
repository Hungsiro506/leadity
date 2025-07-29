import { useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import LoanInputStep from '../components/LoanInputStep'
import EarlyPaymentStep from '../components/EarlyPaymentStep'
import ContactStep from '../components/ContactStep'
import OffersStep from '../components/OffersStep'
import SuccessModal from '../components/SuccessModal'
import { LoanInputData, EarlyPaymentData, ContactData, BankingContactData, LoanOffer } from '../types'
import { analytics } from '../lib/posthog'

export default function LoanComparison() {
  const router = useRouter()
  const { flow } = router.query
  const flowType = flow === 'new' ? 'new' : 'existing'

  const [currentStep, setCurrentStep] = useState(1)
  const [loanData, setLoanData] = useState<LoanInputData>({
    currentLoan: '',
    newLoanAmount: '',
    loanTerm: '',
    desiredRate: ''
  })
  const [earlyPaymentData, setEarlyPaymentData] = useState<EarlyPaymentData>({
    bankName: '',
    originalAmount: '',
    originalTerm: '',
    originalRate: '',
    monthlyPayment: ''
  })
  const [contactData, setContactData] = useState<BankingContactData | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)

  const handleNext = () => {
    setCurrentStep(prev => prev + 1)
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1)
    } else {
      router.push('/')
    }
  }

  const handleLoanDataChange = (data: LoanInputData) => {
    setLoanData(data)
    analytics.currentLoanInput(data)
  }

  const handleEarlyPaymentDataChange = (data: EarlyPaymentData) => {
    setEarlyPaymentData(data)
    analytics.currentLoanEarlyInput(data)
  }

  const handleContactVerified = (bankingData: BankingContactData) => {
    setContactData(bankingData)
    
    // Create enhanced banking profile
    analytics.createBankingProfile({
      // Basic Information
      name: bankingData.name,
      email: bankingData.email,
      phone: bankingData.phone,
      yearOfBirth: bankingData.yearOfBirth,
      monthlyIncome: parseInt(bankingData.monthlyIncome) || 0,
      
      // Identity & Verification
      nationalId: bankingData.nationalId,
      cisVerified: bankingData.cisVerificationConsent,
      kycStatus: bankingData.cisVerificationConsent ? 'verified' : 'pending',
      identityVerificationMethod: 'national_id',
      documentAuthenticityScore: 85,
      
      // Credit & Financial
      creditScoreRange: bankingData.loanHistory === 'excellent' ? 'excellent' : 
                       bankingData.loanHistory === 'previous_default' ? 'poor' : 'good',
      existingBankRelationships: bankingData.existingBankRelationships,
      loanHistoryStatus: bankingData.loanHistory,
      debtToIncomeRatio: 0.3, // Simplified calculation
      employmentType: bankingData.employmentType,
      incomeVerificationStatus: bankingData.incomeVerificationMethod === 'self_declared' ? 'self_declared' : 'verified',
      workExperienceYears: bankingData.workExperienceYears,
      
      // Risk Assessment
      riskCategory: bankingData.loanHistory === 'previous_default' ? 'high' : 
                   bankingData.employmentType === 'self_employed' ? 'medium' : 'low',
      fraudRiskScore: bankingData.loanHistory === 'previous_default' ? 70 : 25,
      amlScreeningStatus: 'clear',
      
      // Banking Behavior
      digitalBankingAdoption: 'high',
      loanPurpose: bankingData.loanPurpose,
      preferredContactMethod: bankingData.preferredContactMethod,
      
      // Location
      province: bankingData.province,
      district: bankingData.district,
      ward: bankingData.ward,
      
      // Consents
      creditBureauConsent: bankingData.creditBureauCheckConsent,
      marketingConsent: bankingData.marketingConsent,
    })
    
    // Also trigger the traditional identified event
    analytics.identified({
      name: bankingData.name,
      email: bankingData.email,
      phone: bankingData.phone,
      yearOfBirth: bankingData.yearOfBirth,
      monthlyIncome: parseInt(bankingData.monthlyIncome) || 0,
      bankTransfer: bankingData.bankTransfer,
      province: bankingData.province,
      district: bankingData.district,
      ward: bankingData.ward
    })
    
    handleNext()
  }

  const handleOfferSelect = (offer: LoanOffer) => {
    analytics.selectOwnLoanOption({
      bankName: offer.bankName,
      loanAmount: offer.loanAmount,
      term: offer.loanTerm,
      interestRate: offer.interestRate,
      monthlyPayment: offer.monthlyPayment,
      totalRepayment: offer.totalRepayment
    })
    setShowSuccess(true)
  }

  const handleSuccessClose = () => {
    setShowSuccess(false)
    router.push('/')
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <LoanInputStep
            flowType={flowType}
            data={loanData}
            onDataChange={handleLoanDataChange}
            onNext={handleNext}
            onBack={handleBack}
          />
        )
      case 2:
        return (
          <EarlyPaymentStep
            data={earlyPaymentData}
            onDataChange={handleEarlyPaymentDataChange}
            onNext={handleNext}
            onBack={handleBack}
          />
        )
      case 3:
        return (
          <ContactStep
            onNext={handleContactVerified}
            onBack={handleBack}
          />
        )
      case 4:
        return (
          <OffersStep
            loanData={loanData}
            earlyPaymentData={earlyPaymentData}
            onOfferSelect={handleOfferSelect}
            onBack={handleBack}
          />
        )
      default:
        return null
    }
  }

  return (
    <>
      <Head>
        <title>So Sánh Lãi Suất Vay - {flowType === 'existing' ? 'Khoản Vay Hiện Tại' : 'Vay Mua Nhà Mới'}</title>
        <meta name="description" content="So sánh lãi suất vay thế chấp từ các ngân hàng hàng đầu" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {renderStep()}
        </div>

        {showSuccess && (
          <SuccessModal onClose={handleSuccessClose} />
        )}
      </div>
    </>
  )
} 