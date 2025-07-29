import posthog from 'posthog-js'
import { BankingUserProfile } from '../types'

if (typeof window !== 'undefined') {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
    session_recording: {
      maskAllInputs: false,
      maskInputOptions: {
        password: true,
      },
    },
  })
}

export const analytics = {
  pageView: (pageName: string) => {
    posthog.capture('$pageview', {
      page_name: pageName,
      timestamp: new Date().toISOString(),
    })
  },

  visited: () => {
    posthog.capture('visited', {
      timestamp: new Date().toISOString(),
    })
  },

  compareOwnLoan: () => {
    posthog.capture('compare_own_loan', {
      flow: 'existing_loan',
      timestamp: new Date().toISOString(),
    })
  },

  compareNewLoan: () => {
    posthog.capture('compare_new_loan', {
      flow: 'new_loan',
      timestamp: new Date().toISOString(),
    })
  },

  currentLoanInput: (data: any) => {
    posthog.capture('current_loan_input', {
      currentLoan: data.currentLoan,
      newLoanAmount: data.newLoanAmount,
      loanTerm: data.loanTerm,
      desiredRate: data.desiredRate,
      step: 'loan_details',
      timestamp: new Date().toISOString(),
    })
  },

  currentLoanEarlyInput: (data: any) => {
    posthog.capture('current_loan_early_input', {
      bankName: data.bankName,
      originalAmount: data.originalAmount,
      originalTerm: data.originalTerm,
      originalRate: data.originalRate,
      monthlyPayment: data.monthlyPayment,
      step: 'early_payment',
      timestamp: new Date().toISOString(),
    })
  },

  newLoanInput: (data: any) => {
    posthog.capture('new_loan_input', {
      collateralValue: data.collateralValue,
      collateralType: data.collateralType,
      loanAmount: data.loanAmount,
      desiredRate: data.desiredRate,
      loanTerm: data.loanTerm,
      selectedBanks: data.selectedBanks,
      selected_banks_count: data.selectedBanks?.length || 0,
      step: 'collateral_and_loan',
      timestamp: new Date().toISOString(),
    })
  },

  identified: (userData: any) => {
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
    })

    posthog.capture('identified', {
      verification_method: 'otp',
      step: 'contact_verified',
      timestamp: new Date().toISOString(),
    })
  },

  newLoanIdentified: (userData: any) => {
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
      house_number: userData.houseNumber,
    })

    posthog.capture('identified', {
      verification_method: 'otp',
      step: 'new_loan_contact_verified',
      flow: 'new_loan',
      timestamp: new Date().toISOString(),
    })
  },

  selectOwnLoanOption: (offer: any) => {
    posthog.capture('own_loan_offer_selected', {
      bankName: offer.bankName,
      loanAmount: offer.loanAmount,
      term: offer.loanTerm,
      interestRate: offer.interestRate,
      monthlyPayment: offer.monthlyPayment,
      totalRepayment: offer.totalRepayment,
      flow: 'existing_loan',
      step: 'offer_selected',
      timestamp: new Date().toISOString(),
    })
  },

  selectNewLoanOption: (offer: any) => {
    posthog.capture('new_loan_offer_selected', {
      bankName: offer.bankName,
      loanAmount: offer.loanAmount,
      term: offer.loanTerm,
      interestRate: offer.interestRate,
      monthlyPayment: offer.monthlyPayment,
      totalRepayment: offer.totalRepayment,
      flow: 'new_loan',
      step: 'offer_selected',
      timestamp: new Date().toISOString(),
    })
  },

  // 🏦 ENHANCED BANKING-SPECIFIC ANALYTICS METHODS

  // Identity & Verification
  cisVerificationInitiated: (method: string, documentType: string) => {
    posthog.capture('cis_verification_initiated', {
      verification_method: method,
      document_type: documentType,
      timestamp: new Date().toISOString(),
    })
  },

  cisVerificationCompleted: (success: boolean, score: number, timeTaken: number, issues: string[] = []) => {
    posthog.capture('cis_verification_completed', {
      success,
      verification_score: score,
      time_taken_seconds: timeTaken,
      issues_found: issues,
      timestamp: new Date().toISOString(),
    })
  },

  kycDocumentUploaded: (documentType: 'national_id' | 'passport' | 'driving_license', fileSize: number, qualityScore: number) => {
    posthog.capture('kyc_document_uploaded', {
      document_type: documentType,
      file_size_mb: fileSize,
      quality_score: qualityScore,
      timestamp: new Date().toISOString(),
    })
  },

  kycVerificationPassed: (level: 'basic' | 'enhanced' | 'premium', manualReview: boolean, confidence: number) => {
    posthog.capture('kyc_verification_passed', {
      verification_level: level,
      manual_review_required: manualReview,
      confidence_score: confidence,
      timestamp: new Date().toISOString(),
    })
  },

  // AML & Compliance
  amlScreeningTriggered: (screeningType: 'name_match' | 'sanctions_list' | 'pep_check', provider: string) => {
    posthog.capture('aml_screening_triggered', {
      screening_type: screeningType,
      external_provider: provider,
      timestamp: new Date().toISOString(),
    })
  },

  amlScreeningCompleted: (status: 'clear' | 'potential_match' | 'confirmed_match', riskLevel: 'low' | 'medium' | 'high', manualReview: boolean) => {
    posthog.capture('aml_screening_completed', {
      status,
      risk_level: riskLevel,
      manual_review_required: manualReview,
      timestamp: new Date().toISOString(),
    })
  },

  // Credit Assessment
  creditBureauCheckInitiated: (provider: 'CIC' | 'PCB' | 'FID', checkType: 'basic' | 'comprehensive', consentObtained: boolean) => {
    posthog.capture('credit_bureau_check_initiated', {
      bureau_provider: provider,
      check_type: checkType,
      consent_obtained: consentObtained,
      timestamp: new Date().toISOString(),
    })
  },

  creditScoreRetrieved: (score: number, range: string, historyLength: number, activeLoans: number, pastDue: number) => {
    posthog.capture('credit_score_retrieved', {
      credit_score: score,
      score_range: range,
      credit_history_length_months: historyLength,
      active_loans_count: activeLoans,
      past_due_accounts: pastDue,
      timestamp: new Date().toISOString(),
    })
  },

  incomeVerificationRequested: (method: 'bank_statement' | 'payslip' | 'tax_return', documents: string[], employerCheck: boolean) => {
    posthog.capture('income_verification_requested', {
      verification_method: method,
      requested_documents: documents,
      employer_verification_required: employerCheck,
      timestamp: new Date().toISOString(),
    })
  },

  incomeVerificationCompleted: (verifiedIncome: number, stabilityScore: number, tenure: number, trend: 'increasing' | 'stable' | 'decreasing') => {
    posthog.capture('income_verification_completed', {
      verified_monthly_income: verifiedIncome,
      income_stability_score: stabilityScore,
      employment_tenure_months: tenure,
      income_trend: trend,
      timestamp: new Date().toISOString(),
    })
  },

  affordabilityAssessmentCompleted: (dtiRatio: number, ltvRatio: number, stressTestPassed: boolean, maxAffordable: number, recommendedTerm: number) => {
    posthog.capture('affordability_assessment_completed', {
      debt_to_income_ratio: dtiRatio,
      loan_to_value_ratio: ltvRatio,
      stress_test_passed: stressTestPassed,
      maximum_affordable_amount: maxAffordable,
      recommended_loan_term: recommendedTerm,
      timestamp: new Date().toISOString(),
    })
  },

  // Risk Management
  fraudAlertTriggered: (alertType: 'velocity' | 'device' | 'behavioral' | 'identity', riskScore: number, reason: string, requiresReview: boolean) => {
    posthog.capture('fraud_alert_triggered', {
      alert_type: alertType,
      risk_score: riskScore,
      trigger_reason: reason,
      requires_manual_review: requiresReview,
      timestamp: new Date().toISOString(),
    })
  },

  suspiciousActivityDetected: (activityType: 'unusual_login' | 'multiple_applications' | 'data_inconsistency', confidence: number, action: string) => {
    posthog.capture('suspicious_activity_detected', {
      activity_type: activityType,
      confidence_level: confidence,
      automated_action_taken: action,
      timestamp: new Date().toISOString(),
    })
  },

  // Collateral Assessment
  collateralValuationInitiated: (propertyType: string, method: 'automated' | 'professional_appraisal', location: string) => {
    posthog.capture('collateral_valuation_initiated', {
      property_type: propertyType,
      valuation_method: method,
      property_location: location,
      timestamp: new Date().toISOString(),
    })
  },

  collateralValuationCompleted: (estimatedValue: number, confidence: number, ltvRatio: number, source: string) => {
    posthog.capture('collateral_valuation_completed', {
      estimated_value: estimatedValue,
      confidence_level: confidence,
      loan_to_value_ratio: ltvRatio,
      valuation_source: source,
      timestamp: new Date().toISOString(),
    })
  },

  // Loan Processing
  loanPreQualificationCompleted: (preQualifiedAmount: number, estimatedRate: number, confidence: number, nextSteps: string[]) => {
    posthog.capture('loan_pre_qualification_completed', {
      pre_qualified_amount: preQualifiedAmount,
      estimated_interest_rate: estimatedRate,
      qualification_confidence: confidence,
      next_steps_required: nextSteps,
      timestamp: new Date().toISOString(),
    })
  },

  interestRatePersonalized: (baseRate: number, riskAdjustment: number, finalRate: number, lockPeriod: number, factors: string[]) => {
    posthog.capture('interest_rate_personalized', {
      base_rate: baseRate,
      risk_adjustment: riskAdjustment,
      final_rate: finalRate,
      rate_lock_period_days: lockPeriod,
      factors_considered: factors,
      timestamp: new Date().toISOString(),
    })
  },

  crossSellOpportunityIdentified: (productType: 'insurance' | 'credit_card' | 'savings_account', score: number, segment: string) => {
    posthog.capture('cross_sell_opportunity_identified', {
      product_type: productType,
      recommendation_score: score,
      customer_segment: segment,
      timestamp: new Date().toISOString(),
    })
  },

  // Regulatory & Compliance
  regulatoryDisclosureShown: (disclosureType: 'apr' | 'fees' | 'terms_conditions', acknowledged: boolean, timeSpent: number) => {
    posthog.capture('regulatory_disclosure_shown', {
      disclosure_type: disclosureType,
      acknowledged,
      time_spent_reading_seconds: timeSpent,
      timestamp: new Date().toISOString(),
    })
  },

  consentManagement: (consentType: 'data_processing' | 'credit_check' | 'marketing', granted: boolean, version: string) => {
    posthog.capture('consent_management', {
      consent_type: consentType,
      granted,
      consent_version: version,
      timestamp: new Date().toISOString(),
    })
  },

  // Enhanced User Profile Creation
  createBankingProfile: (profile: BankingUserProfile) => {
    posthog.identify(profile.email, {
      // Basic Information
      name: profile.name,
      email: profile.email,
      phone: profile.phone,
      year_of_birth: profile.yearOfBirth,
      monthly_income: profile.monthlyIncome,
      
      // Identity & Verification
      national_id: profile.nationalId,
      cis_verified: profile.cisVerified,
      kyc_status: profile.kycStatus,
      kyc_completion_date: profile.kycCompletionDate,
      identity_verification_method: profile.identityVerificationMethod,
      document_authenticity_score: profile.documentAuthenticityScore,
      
      // Credit & Financial
      credit_score_range: profile.creditScoreRange,
      existing_bank_relationships: profile.existingBankRelationships,
      loan_history_status: profile.loanHistoryStatus,
      debt_to_income_ratio: profile.debtToIncomeRatio,
      employment_type: profile.employmentType,
      income_verification_status: profile.incomeVerificationStatus,
      work_experience_years: profile.workExperienceYears,
      
      // Risk Assessment
      risk_category: profile.riskCategory,
      fraud_risk_score: profile.fraudRiskScore,
      aml_screening_status: profile.amlScreeningStatus,
      
      // Banking Behavior
      digital_banking_adoption: profile.digitalBankingAdoption,
      loan_purpose: profile.loanPurpose,
      financial_literacy_score: profile.financialLiteracyScore,
      preferred_contact_method: profile.preferredContactMethod,
      
      // Location
      province: profile.province,
      district: profile.district,
      ward: profile.ward,
      
      // Consents
      credit_bureau_consent: profile.creditBureauConsent,
      marketing_consent: profile.marketingConsent,
    })
  },

  // Risk Assessment Event
  riskAssessmentCompleted: (riskCategory: 'low' | 'medium' | 'high', fraudScore: number, factors: string[]) => {
    posthog.capture('risk_assessment_completed', {
      risk_category: riskCategory,
      fraud_risk_score: fraudScore,
      risk_factors: factors,
      timestamp: new Date().toISOString(),
    })
  },
}

export default posthog 