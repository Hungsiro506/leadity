# Tracking System Quick Reference

## 🎯 Two Separate Funnels

### Flow 1: Existing Loan (6 steps)
```
$pageview → compare_own_loan → current_loan_input → current_loan_early_input → identified → own_loan_offer_selected
```

### Flow 2: New Loan (5 steps)
```
$pageview → compare_new_loan → new_loan_input → identified → new_loan_offer_selected
```

## 📊 PostHog Setup

### Flow 1 Funnel Filter:
```
separate_funnel_test = true AND flow_type != "new_loan_only"
```

### Flow 2 Funnel Filter:
```
separate_funnel_test = true AND flow_type != "existing_loan_only"
```

## 🔧 Analytics Methods

| Method | Event | Flow |
|--------|-------|------|
| `analytics.compareOwnLoan()` | `compare_own_loan` | Flow 1 |
| `analytics.compareNewLoan()` | `compare_new_loan` | Flow 2 |
| `analytics.currentLoanInput()` | `current_loan_input` | Flow 1 |
| `analytics.currentLoanEarlyInput()` | `current_loan_early_input` | Flow 1 |
| `analytics.newLoanInput()` | `new_loan_input` | Flow 2 |
| `analytics.identified()` | `identified` | Both |
| `analytics.selectOwnLoanOption()` | `own_loan_offer_selected` | Flow 1 |
| `analytics.selectNewLoanOption()` | `new_loan_offer_selected` | Flow 2 |

## 📈 Test Data Generated

- **150 total users**
- **60 users**: Flow 1 only (~32 conversions)
- **80 users**: Flow 2 only (~47 conversions)  
- **10 users**: Dual flow experience

## 🚀 Data Generation

```bash
git checkout feature/analytics-data-generation
npm install posthog-node
node generate-separate-funnels-data.js
```

## 📋 Key Conversion Events

- **Flow 1**: `own_loan_offer_selected`
- **Flow 2**: `new_loan_offer_selected`

---

👉 **For detailed documentation, see [ANALYTICS_TRACKING.md](./ANALYTICS_TRACKING.md)** 