export interface LoanInputData {
  currentLoan?: number
  newLoanAmount?: number
  loanTerm?: number
  desiredRate?: number
}

export interface EarlyPaymentData {
  bankName?: string
  originalAmount?: number
  originalTerm?: number
  originalRate?: number
  monthlyPayment?: number
  earlyRepaymentPenalty?: number
}

export interface ContactData {
  name: string
  yearOfBirth: string
  phone: string
  email: string
  monthlyIncome: number
  bankTransfer: boolean
  province: string
  district: string
  ward: string
  fullAddress: string
}

// Flow 2: New Loan Types
export interface NewLoanInputData {
  collateralValue?: number
  collateralType?: string
  loanAmount?: number
  desiredRate?: number
  loanTerm?: number
  selectedBanks?: string[]
}

export interface NewLoanContactData {
  name: string
  yearOfBirth: string
  phone: string
  email: string
  monthlyIncome: number
  bankTransfer: boolean
  province: string
  district: string
  ward: string
  streetName: string
  houseNumber: string
  agreeTerms: boolean
}

export interface LoanOffer {
  id: string
  bankName: string
  loanAmount: number
  term: number
  initialRate: number
  fixedRate: number
  monthlyPayment: number
  totalRepayment: number
  earlyRepaymentPenalty: number
  savings: number
}

export interface FormErrors {
  [key: string]: string
}

export type FlowType = 'existing' | 'new'

export interface Bank {
  value: string
  label: string
}

export interface StepProps {
  onNext: () => void
  onBack?: () => void
  data?: any
  onDataChange?: (data: any) => void
} 