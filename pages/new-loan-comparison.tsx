import { useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { ArrowLeft, ArrowRight, Check } from 'lucide-react'
import { NewLoanInputData, NewLoanContactData, LoanOffer } from '../types'
import { analytics } from '../lib/posthog'
import NewLoanInputStep from '../components/NewLoanInputStep'
import NewLoanContactStep from '../components/NewLoanContactStep'
import NewLoanOffersStep from '../components/NewLoanOffersStep'

export default function NewLoanComparisonPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)

  // Form data
  const [loanData, setLoanData] = useState<NewLoanInputData>({})
  const [contactData, setContactData] = useState<NewLoanContactData>({
    name: '',
    yearOfBirth: '',
    phone: '',
    email: '',
    monthlyIncome: 0,
    bankTransfer: false,
    province: '',
    district: '',
    ward: '',
    streetName: '',
    houseNumber: '',
    agreeTerms: false
  })

  const steps = [
    { id: 1, title: 'Thông tin vay', completed: currentStep > 1 },
    { id: 2, title: 'Thông tin cá nhân', completed: currentStep > 2 },
    { id: 3, title: 'Kết quả so sánh', completed: currentStep > 3 },
  ]

  const handleNext = () => {
    if (currentStep < 3) {
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

  const handleLoanDataChange = (data: NewLoanInputData) => {
    setLoanData(data)
    analytics.newLoanInput(data)
  }

  const handleContactDataChange = (data: NewLoanContactData) => {
    setContactData(data)
  }

  const handleContactVerified = () => {
    analytics.newLoanIdentified(contactData)
    handleNext()
  }

  const handleOfferSelect = (offer: LoanOffer) => {
    // Track the offer selection
    analytics.selectNewLoanOption({
      bankName: offer.bankName,
      loanAmount: offer.loanAmount,
      term: offer.term,
      interestRate: offer.initialRate,
      monthlyPayment: offer.monthlyPayment,
      totalRepayment: offer.totalRepayment
    })
    
    // Return to home page
    router.push('/')
  }

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <NewLoanInputStep
            data={loanData}
            onDataChange={handleLoanDataChange}
            onNext={handleNext}
            onBack={handleBack}
          />
        )
      case 2:
        return (
          <NewLoanContactStep
            data={contactData}
            onDataChange={handleContactDataChange}
            onNext={handleContactVerified}
            onBack={handleBack}
          />
        )
      case 3:
        return (
          <NewLoanOffersStep
            loanData={loanData}
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
        <title>{`So Sánh Lãi Suất Vay Mua Nhà Mới - Bước ${currentStep}`}</title>
        <meta name="description" content="So sánh lãi suất vay mua nhà mới từ các ngân hàng hàng đầu" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center">
                <button
                  onClick={() => router.push('/')}
                  className="flex items-center text-gray-600 hover:text-primary-600 transition-colors mr-4"
                >
                  <ArrowLeft className="h-5 w-5 mr-2" />
                  Trang chủ
                </button>
                <h1 className="text-2xl font-bold text-gray-900">So sánh vay mua nhà mới</h1>
              </div>
            </div>
          </div>
        </header>

        {/* Progress Steps */}
        <div className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-6">
              <nav aria-label="Progress">
                <ol className="flex items-center justify-center space-x-8">
                  {steps.map((step, stepIdx) => (
                    <li key={step.id} className="flex items-center">
                      <div className="relative flex items-center">
                        <div
                          className={`
                            flex items-center justify-center w-10 h-10 rounded-full border-2 text-sm font-medium
                            ${step.completed
                              ? 'bg-primary-600 border-primary-600 text-white'
                              : currentStep === step.id
                              ? 'border-primary-600 text-primary-600 bg-white'
                              : 'border-gray-300 text-gray-500 bg-white'
                            }
                          `}
                        >
                          {step.completed ? (
                            <Check className="w-5 h-5" />
                          ) : (
                            step.id
                          )}
                        </div>
                        <span
                          className={`
                            ml-3 text-sm font-medium
                            ${step.completed || currentStep === step.id
                              ? 'text-primary-600'
                              : 'text-gray-500'
                            }
                          `}
                        >
                          {step.title}
                        </span>
                      </div>
                      {stepIdx < steps.length - 1 && (
                        <ArrowRight className="w-5 h-5 text-gray-400 ml-8" />
                      )}
                    </li>
                  ))}
                </ol>
              </nav>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:p-8">
            {renderCurrentStep()}
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="text-center text-sm text-gray-500">
              © 2025 Leadity. Tất cả các quyền được bảo lưu.
            </div>
          </div>
        </footer>
      </div>
    </>
  )
} 