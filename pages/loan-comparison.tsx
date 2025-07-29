import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { ArrowLeft, ArrowRight, Check } from 'lucide-react'
import { FlowType, LoanInputData, EarlyPaymentData, ContactData, LoanOffer } from '../types'
import { analytics } from '../lib/posthog'
import LoanInputStep from '../components/LoanInputStep'
import EarlyPaymentStep from '../components/EarlyPaymentStep'
import ContactStep from '../components/ContactStep'
import OffersStep from '../components/OffersStep'
import SuccessModal from '../components/SuccessModal'

export default function LoanComparisonPage() {
  const router = useRouter()
  const { flow } = router.query
  const [currentStep, setCurrentStep] = useState(1)
  const [flowType, setFlowType] = useState<FlowType>('existing')
  const [showSuccess, setShowSuccess] = useState(false)

  // Form data
  const [loanData, setLoanData] = useState<LoanInputData>({})
  const [earlyPaymentData, setEarlyPaymentData] = useState<EarlyPaymentData>({})
  const [contactData, setContactData] = useState<ContactData>({
    name: '',
    yearOfBirth: '',
    phone: '',
    email: '',
    monthlyIncome: 0,
    bankTransfer: false,
    province: '',
    district: '',
    ward: '',
    fullAddress: ''
  })

  useEffect(() => {
    if (flow) {
      setFlowType(flow as FlowType)
    }
  }, [flow])

  const steps = [
    { id: 1, title: 'Thông tin vay', completed: currentStep > 1 },
    { id: 2, title: 'Phí trả trước hạn', completed: currentStep > 2 },
    { id: 3, title: 'Thông tin liên hệ', completed: currentStep > 3 },
    { id: 4, title: 'Kết quả so sánh', completed: currentStep > 4 },
  ]

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
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

  const handleContactDataChange = (data: ContactData) => {
    setContactData(data)
  }

  const handleContactVerified = () => {
    analytics.identified(contactData)
    handleNext()
  }

  const handleOfferSelect = (offer: LoanOffer) => {
    analytics.selectOwnLoanOption({
      bankName: offer.bankName,
      loanAmount: offer.loanAmount,
      term: offer.term,
      interestRate: offer.fixedRate,
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
            data={contactData}
            onDataChange={handleContactDataChange}
            onVerified={handleContactVerified}
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
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-4">
              <button
                onClick={handleBack}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Quay lại
              </button>
              <h1 className="text-xl font-semibold text-gray-900">
                {flowType === 'existing' ? 'So sánh khoản vay hiện tại' : 'Vay mua nhà mới'}
              </h1>
              <div className="w-20"></div>
            </div>
          </div>
        </header>

        {/* Progress Steps */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className="flex items-center">
                    <div className={`
                      w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium
                      ${step.completed 
                        ? 'bg-green-500 text-white' 
                        : currentStep === step.id 
                          ? 'bg-primary-600 text-white' 
                          : 'bg-gray-200 text-gray-600'
                      }
                    `}>
                      {step.completed ? <Check className="h-5 w-5" /> : step.id}
                    </div>
                    <div className="ml-3">
                      <p className={`text-sm font-medium ${
                        currentStep === step.id ? 'text-primary-600' : 'text-gray-600'
                      }`}>
                        {step.title}
                      </p>
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div className="flex-1 mx-4">
                      <div className={`h-0.5 ${
                        step.completed ? 'bg-green-500' : 'bg-gray-200'
                      }`}></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {renderStep()}
        </main>

        {/* Success Modal */}
        {showSuccess && (
          <SuccessModal onClose={handleSuccessClose} />
        )}
      </div>
    </>
  )
} 