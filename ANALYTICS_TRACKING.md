# Analytics & Funnel Tracking Documentation

## Overview

This document describes the comprehensive analytics and funnel tracking system implemented for the Leadity loan comparison platform. The system uses PostHog for event tracking and provides separate funnel analysis for two distinct user flows.

## 🎯 Tracking Strategy

### Two Separate Funnels Approach

Instead of tracking users across both flows (which creates confusing cross-funnel data), we implement **two completely separate funnels**:

1. **Flow 1: Existing Loan Comparison** - For users with current mortgages seeking better rates
2. **Flow 2: New Loan Comparison** - For users purchasing new properties

### Key Benefits

- **Clean Analytics**: Each funnel has distinct conversion events
- **Clear Attribution**: No confusion between flow types
- **Separate ROI Analysis**: Independent performance metrics per flow
- **User Journey Clarity**: Focused analysis of each customer segment

## 📊 Event Tracking Structure

### Flow 1: Existing Loan Funnel

**Funnel Steps:**
```
1. $pageview (homepage)
2. compare_own_loan (flow selection)
3. current_loan_input (loan details)
4. current_loan_early_input (early payment calculation)
5. identified (contact verification)
6. own_loan_offer_selected (conversion)
```

**Events Details:**

| Event | Description | Properties |
|-------|-------------|------------|
| `$pageview` | User visits homepage | `$current_url`, `$pathname`, `$host` |
| `compare_own_loan` | User clicks "So sánh khoản vay hiện tại" | `flow: 'existing_loan'` |
| `current_loan_input` | User enters loan details | `currentLoan`, `newLoanAmount`, `loanTerm`, `desiredRate` |
| `current_loan_early_input` | User enters early payment info | `bankName`, `originalAmount`, `originalTerm`, `originalRate` |
| `identified` | User completes OTP verification | `verification_method: 'otp'`, `step: 'contact_verified'` |
| `own_loan_offer_selected` | User selects loan offer (CONVERSION) | `bankName`, `loanAmount`, `interestRate`, `monthlyPayment` |

### Flow 2: New Loan Funnel

**Funnel Steps:**
```
1. $pageview (homepage)
2. compare_new_loan (flow selection)
3. new_loan_input (collateral & loan details)
4. identified (contact verification)
5. new_loan_offer_selected (conversion)
```

**Events Details:**

| Event | Description | Properties |
|-------|-------------|------------|
| `$pageview` | User visits homepage | `$current_url`, `$pathname`, `$host` |
| `compare_new_loan` | User clicks "Tôi muốn mua nhà mới" | `flow: 'new_loan'` |
| `new_loan_input` | User enters collateral & loan details | `collateralValue`, `collateralType`, `loanAmount`, `selectedBanks` |
| `identified` | User completes OTP verification | `verification_method: 'otp'`, `step: 'new_loan_contact_verified'` |
| `new_loan_offer_selected` | User selects loan offer (CONVERSION) | `bankName`, `loanAmount`, `interestRate`, `monthlyPayment` |

## 🔧 PostHog Setup Instructions

### Creating Flow 1 Funnel (Existing Loan)

1. **Go to PostHog**: [https://us.posthog.com/project/sTMFPsFhdP1Ssg/insights](https://us.posthog.com/project/sTMFPsFhdP1Ssg/insights)
2. **Click**: "New insight" → "Funnel"
3. **Add Events** in this exact order:
   - `$pageview`
   - `compare_own_loan`
   - `current_loan_input`
   - `current_loan_early_input`
   - `identified`
   - `own_loan_offer_selected`
4. **Add Filter**: `separate_funnel_test = true AND flow_type != "new_loan_only"`
5. **Set Time Range**: Last 30 days
6. **Save** as "Flow 1: Existing Loan Funnel"

### Creating Flow 2 Funnel (New Loan)

1. **Go to PostHog**: [https://us.posthog.com/project/sTMFPsFhdP1Ssg/insights](https://us.posthog.com/project/sTMFPsFhdP1Ssg/insights)
2. **Click**: "New insight" → "Funnel"
3. **Add Events** in this exact order:
   - `$pageview`
   - `compare_new_loan`
   - `new_loan_input`
   - `identified`
   - `new_loan_offer_selected`
4. **Add Filter**: `separate_funnel_test = true AND flow_type != "existing_loan_only"`
5. **Set Time Range**: Last 30 days
6. **Save** as "Flow 2: New Loan Funnel"

## 💻 Implementation Details

### Analytics Library (`lib/posthog.ts`)

**Key Methods:**

```typescript
// Flow selection tracking
analytics.compareOwnLoan()    // Triggers: compare_own_loan
analytics.compareNewLoan()    // Triggers: compare_new_loan

// Input tracking
analytics.currentLoanInput(data)      // Triggers: current_loan_input
analytics.currentLoanEarlyInput(data) // Triggers: current_loan_early_input
analytics.newLoanInput(data)          // Triggers: new_loan_input

// User identification
analytics.identified(userData)        // Triggers: identified
analytics.newLoanIdentified(userData) // Triggers: identified (Flow 2)

// Conversion tracking
analytics.selectOwnLoanOption(offer)  // Triggers: own_loan_offer_selected
analytics.selectNewLoanOption(offer)  // Triggers: new_loan_offer_selected

// Page tracking
analytics.pageView(pageName)          // Triggers: $pageview
```

### User Identification

When users complete contact verification, we create detailed PostHog profiles:

```typescript
posthog.identify(email, {
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
```

## 📈 Test Data Generation

### Data Distribution (150 Users)

- **60 users**: Flow 1 only (existing loan) - ~53% conversion rate
- **80 users**: Flow 2 only (new loan) - ~59% conversion rate
- **10 users**: Dual flow experience (try both flows)

### Realistic User Profiles

Generated data includes authentic Vietnamese user profiles:
- Vietnamese names and addresses
- Realistic income ranges (45M - 80M VND)
- Proper phone number formats
- Varied provinces across Vietnam

### Running Data Generation

```bash
# Switch to analytics branch
git checkout feature/analytics-data-generation

# Install dependencies
npm install posthog-node

# Generate test data
node generate-separate-funnels-data.js
```

## 🎯 Key Metrics to Track

### Conversion Metrics

- **Flow 1 Conversion Rate**: `own_loan_offer_selected` / `compare_own_loan`
- **Flow 2 Conversion Rate**: `new_loan_offer_selected` / `compare_new_loan`
- **Overall Conversion Rate**: Total conversions / Total flow selections

### Drop-off Analysis

- **Homepage → Flow Selection**: Users who visit but don't select a flow
- **Flow Selection → Input**: Users who select flow but don't input data
- **Input → Verification**: Users who input data but don't verify contact
- **Verification → Conversion**: Users who verify but don't select offers

### Business Intelligence

- **Popular Banks**: Which banks are selected most frequently
- **Loan Amounts**: Average loan amounts by flow
- **User Demographics**: Income ranges, locations, age groups
- **Session Patterns**: Time spent on each step

## 🔍 Analyzing Cross-Flow Users

Some users experience both flows (dual-journey users). To analyze them:

### Dual Flow Filter
```
Properties where user_id appears in both:
- Events with flow = 'existing_loan'
- Events with flow = 'new_loan'
```

### Cross-Flow Insights
- Which flow do users try first?
- Do users who try both flows have higher conversion rates?
- What's the time gap between trying different flows?

## 🚨 Troubleshooting

### Common Issues

1. **No Data in Funnels**: Check the filter `separate_funnel_test = true`
2. **Events Missing**: Verify PostHog API key and connection
3. **Incorrect Conversion Rates**: Ensure using correct event names
4. **Time Range Issues**: Generated data spans 24 hours, adjust accordingly

### Debugging Steps

1. **Check PostHog Debug Mode**: Add `?__posthog_debug=true` to URL
2. **Verify Events**: Go to PostHog → Events → Live Events
3. **Check Properties**: Ensure `separate_funnel_test` property exists
4. **Test Locally**: Use PostHog debugging tools in browser console

## 📋 Event Properties Reference

### Standard Properties (All Events)

| Property | Type | Description |
|----------|------|-------------|
| `timestamp` | ISO String | Event timestamp |
| `separate_funnel_test` | Boolean | Filter for test data |
| `user_id` | Number | Unique user identifier |
| `$current_url` | String | Current page URL |
| `$host` | String | Domain name |

### Flow-Specific Properties

#### Flow 1 Properties
- `flow: 'existing_loan'`
- `currentLoan: number` (VND)
- `newLoanAmount: number` (VND)
- `originalAmount: number` (VND)
- `bankName: string`

#### Flow 2 Properties
- `flow: 'new_loan'`
- `collateralValue: number` (VND)
- `collateralType: string`
- `selectedBanks: array`
- `selected_banks_count: number`

### User Profile Properties
- `name: string`
- `email: string`
- `phone: string`
- `monthly_income: number` (VND)
- `province: string`
- `district: string`
- `ward: string`
- `year_of_birth: string`
- `bank_transfer: boolean`

## 🔄 Maintenance & Updates

### Adding New Events

1. **Define Event**: Add to `lib/posthog.ts`
2. **Implement Tracking**: Call from appropriate components
3. **Update Documentation**: Add to this file
4. **Test**: Generate test data to verify

### Modifying Funnels

1. **Update PostHog Funnels**: Modify in PostHog UI
2. **Update Code**: Modify event names if needed
3. **Regenerate Test Data**: Run data generation script
4. **Update Documentation**: Reflect changes here

---

**Last Updated**: January 2025  
**PostHog Project**: Leadity Loan Comparison Platform  
**Contact**: Analytics Team 