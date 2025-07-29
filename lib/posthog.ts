import posthog from 'posthog-js'

if (typeof window !== 'undefined') {
  posthog.init('HZBtaekGJEiDcyzo76Cx6mlYO-Iwi8HpckRLB-PhRLY', {
    api_host: 'https://us.i.posthog.com',
    defaults: '2025-05-24',
    person_profiles: 'identified_only'
  })
}

export const analytics = {
  // Track when user lands on homepage
  visited: () => {
    posthog.capture('visited', {
      page: 'homepage',
      timestamp: new Date().toISOString()
    })
  },

  // Track Flow 2: Compare new loan (starting point for Flow 2 funnel)
  compareNewLoan: () => {
    posthog.capture('compare_new_loan', {
      flow: 'new_loan',
      timestamp: new Date().toISOString()
    })
  },

  // Track Flow 1: Compare own loan (starting point for Flow 1 funnel)
  compareOwnLoan: () => {
    posthog.capture('compare_own_loan', {
      flow: 'existing_loan',
      timestamp: new Date().toISOString()
    })
  },

  // Track current loan input step
  currentLoanInput: (data: {
    currentLoan?: number
    newLoanAmount?: number
    loanTerm?: number
    desiredRate?: number
  }) => {
    posthog.capture('current_loan_input', {
      ...data,
      step: 'loan_details',
      timestamp: new Date().toISOString()
    })
  },

  // Track early payment input step
  currentLoanEarlyInput: (data: {
    bankName?: string
    originalAmount?: number
    originalTerm?: number
    originalRate?: number
    monthlyPayment?: number
  }) => {
    posthog.capture('current_loan_early_input', {
      ...data,
      step: 'early_payment',
      timestamp: new Date().toISOString()
    })
  },

  // Track user identification after OTP verification
  identified: (userData: {
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
  }) => {
    // Create person profile in PostHog
    posthog.identify(userData.email, {
      name: userData.name,
      email: userData.email,
      phone: userData.phone,
      year_of_birth: userData.yearOfBirth,
      monthly_income: userData.monthlyIncome,
      bank_transfer: userData.bankTransfer,
      province: userData.province,
      district: userData.district,
      ward: userData.ward
    })

    posthog.capture('identified', {
      verification_method: 'otp',
      step: 'contact_verified',
      timestamp: new Date().toISOString()
    })
  },

  // Track Flow 1 loan option selection (existing loan)
  selectOwnLoanOption: (data: {
    bankName: string
    loanAmount: number
    term: number
    interestRate: number
    monthlyPayment: number
    totalRepayment: number
  }) => {
    posthog.capture('own_loan_offer_selected', {
      ...data,
      flow: 'existing_loan',
      step: 'offer_selected',
      timestamp: new Date().toISOString()
    })
  },

  // Track Flow 2 loan option selection (new loan)
  selectNewLoanOption: (data: {
    bankName: string
    loanAmount: number
    term: number
    interestRate: number
    monthlyPayment: number
    totalRepayment: number
  }) => {
    posthog.capture('new_loan_offer_selected', {
      ...data,
      flow: 'new_loan',
      step: 'offer_selected',
      timestamp: new Date().toISOString()
    })
  },

  // Track page views
  pageView: (pageName: string) => {
    posthog.capture('$pageview', {
      page: pageName,
      timestamp: new Date().toISOString()
    })
  },

  // Track Flow 2: New loan input step
  newLoanInput: (data: {
    collateralValue?: number
    collateralType?: string
    loanAmount?: number
    desiredRate?: number
    loanTerm?: number
    selectedBanks?: string[]
  }) => {
    posthog.capture('new_loan_input', {
      ...data,
      step: 'collateral_and_loan',
      selected_banks_count: data.selectedBanks?.length || 0,
      timestamp: new Date().toISOString()
    })
  },

  // Track Flow 2: New loan contact identification
  newLoanIdentified: (userData: {
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
  }) => {
    // Create person profile in PostHog
    posthog.identify(userData.email, {
      name: userData.name,
      email: userData.email,
      phone: userData.phone,
      year_of_birth: userData.yearOfBirth,
      monthly_income: userData.monthlyIncome,
      bank_transfer: userData.bankTransfer,
      province: userData.province,
      district: userData.district,
      ward: userData.ward,
      street_name: userData.streetName,
      house_number: userData.houseNumber
    })

    posthog.capture('identified', {
      verification_method: 'otp',
      step: 'new_loan_contact_verified',
      flow: 'new_loan',
      timestamp: new Date().toISOString()
    })
  }
}

export default posthog 