export interface LoanInputData {
  currentLoan: string
  newLoanAmount: string
  loanTerm: string
  desiredRate: string
}

export interface EarlyPaymentData {
  bankName: string
  originalAmount: string
  originalTerm: string
  originalRate: string
  monthlyPayment: string
}

export interface ContactData {
  name: string
  yearOfBirth: string
  phone: string
  email: string
  monthlyIncome: string
  bankTransfer: boolean
  province: string
  district: string
  ward: string
}

// Enhanced Banking Contact Data
export interface BankingContactData extends ContactData {
  // Identity & Verification
  nationalId: string
  nationalIdIssueDate: string
  nationalIdIssuePlace: string
  
  // Employment & Income
  employmentType: 'employee' | 'self_employed' | 'business_owner' | 'retired'
  employerName?: string
  workExperienceYears: number
  incomeVerificationMethod: 'bank_statement' | 'payslip' | 'tax_return' | 'self_declared'
  
  // Banking History
  existingBankRelationships: string[]
  loanHistory: 'first_time' | 'repeat' | 'excellent' | 'previous_default'
  creditCardOwnership: boolean
  
  // Loan Purpose & Preferences
  loanPurpose: 'home_purchase' | 'refinancing' | 'investment' | 'consolidation' | 'other'
  preferredContactMethod: 'email' | 'sms' | 'phone' | 'in_person'
  
  // Consent & Verification
  cisVerificationConsent: boolean
  creditBureauCheckConsent: boolean
  marketingConsent: boolean
}

export interface NewLoanInputData {
  collateralValue: string
  collateralType: string
  loanAmount: string
  desiredRate: string
  loanTerm: string
  selectedBanks: string[]
}

export interface NewLoanContactData {
  name: string
  yearOfBirth: string
  phone: string
  email: string
  monthlyIncome: string
  bankTransfer: boolean
  province: string
  district: string
  ward: string
  streetName: string
  houseNumber: string
}

// Enhanced New Loan Contact Data
export interface BankingNewLoanContactData extends NewLoanContactData {
  // Identity & Verification (same as above)
  nationalId: string
  nationalIdIssueDate: string
  nationalIdIssuePlace: string
  
  // Employment & Income
  employmentType: 'employee' | 'self_employed' | 'business_owner' | 'retired'
  employerName?: string
  workExperienceYears: number
  incomeVerificationMethod: 'bank_statement' | 'payslip' | 'tax_return' | 'self_declared'
  
  // Property & Collateral Details
  propertyUsage: 'primary_residence' | 'investment' | 'vacation_home'
  propertyAge: number
  hasExistingMortgage: boolean
  existingMortgageBalance?: string
  
  // Banking History
  existingBankRelationships: string[]
  loanHistory: 'first_time' | 'repeat' | 'excellent' | 'previous_default'
  creditCardOwnership: boolean
  
  // Risk Assessment Data
  otherDebts: string
  dependentsCount: number
  
  // Consent & Verification
  cisVerificationConsent: boolean
  creditBureauCheckConsent: boolean
  collateralValuationConsent: boolean
  marketingConsent: boolean
}

export interface LoanOffer {
  id: string
  bankName: string
  interestRate: number
  monthlyPayment: number
  totalRepayment: number
  processingFee: number
  loanTerm: number
  loanAmount: number
}

// Enhanced Banking User Profile
export interface BankingUserProfile {
  // Basic Information
  name: string
  email: string
  phone: string
  yearOfBirth: string
  monthlyIncome: number
  
  // Identity & Verification
  nationalId: string
  cisVerified: boolean
  kycStatus: 'pending' | 'verified' | 'rejected' | 'expired'
  kycCompletionDate?: string
  identityVerificationMethod: 'national_id' | 'passport' | 'bank_account'
  documentAuthenticityScore: number // 0-100
  
  // Credit & Financial
  creditScoreRange: 'excellent' | 'good' | 'fair' | 'poor' | 'no_history'
  existingBankRelationships: string[]
  loanHistoryStatus: 'first_time' | 'repeat' | 'excellent' | 'previous_default'
  debtToIncomeRatio?: number
  employmentType: 'employee' | 'self_employed' | 'business_owner' | 'retired'
  incomeVerificationStatus: 'verified' | 'pending' | 'self_declared'
  workExperienceYears: number
  
  // Risk Assessment
  riskCategory: 'low' | 'medium' | 'high'
  fraudRiskScore: number
  amlScreeningStatus: 'clear' | 'flagged' | 'under_review'
  
  // Banking Behavior
  digitalBankingAdoption: 'high' | 'medium' | 'low'
  loanPurpose: 'home_purchase' | 'refinancing' | 'investment' | 'consolidation' | 'other'
  financialLiteracyScore?: number
  preferredContactMethod: 'email' | 'sms' | 'phone' | 'in_person'
  
  // Location
  province: string
  district: string
  ward: string
  
  // Consents
  creditBureauConsent: boolean
  marketingConsent: boolean
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