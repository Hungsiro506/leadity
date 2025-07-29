import { clsx, type ClassValue } from 'clsx'

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

// Format VND currency
export function formatVND(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

// Format number with thousand separators
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('vi-VN').format(num)
}

// Format number input with commas while typing
export function formatNumberInput(value: string): string {
  // Remove all non-digit characters except decimal point
  const cleanValue = value.replace(/[^\d.]/g, '')
  
  // Split by decimal point
  const parts = cleanValue.split('.')
  
  // Format the integer part with commas
  if (parts[0]) {
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  }
  
  // Return formatted value
  return parts.join('.')
}

// Parse formatted input back to number
export function parseNumberInput(value: string): number {
  const cleanValue = value.replace(/[^\d.]/g, '')
  return cleanValue === '' ? 0 : Number(cleanValue)
}

// Calculate monthly payment for loan
export function calculateMonthlyPayment(
  principal: number,
  annualRate: number,
  termInMonths: number
): number {
  const monthlyRate = annualRate / 100 / 12
  const numerator = principal * monthlyRate * Math.pow(1 + monthlyRate, termInMonths)
  const denominator = Math.pow(1 + monthlyRate, termInMonths) - 1
  return numerator / denominator
}

// Calculate total repayment amount
export function calculateTotalRepayment(
  monthlyPayment: number,
  termInMonths: number
): number {
  return monthlyPayment * termInMonths
}

// Calculate early repayment penalty (default 2%)
export function calculateEarlyRepaymentPenalty(
  remainingPrincipal: number,
  penaltyRate: number = 2
): number {
  return remainingPrincipal * (penaltyRate / 100)
}

// Calculate savings from early repayment
export function calculateEarlyRepaymentSavings(
  remainingPrincipal: number,
  remainingMonths: number,
  currentMonthlyPayment: number,
  penaltyAmount: number
): number {
  const totalRemainingPayments = currentMonthlyPayment * remainingMonths
  const earlyPaymentTotal = remainingPrincipal + penaltyAmount
  return totalRemainingPayments - earlyPaymentTotal
}

// Validate phone number (Vietnamese format)
export function validateVietnamesePhone(phone: string): boolean {
  const phoneRegex = /^(\+84|84|0)(3|5|7|8|9)[0-9]{8}$/
  return phoneRegex.test(phone.replace(/\s/g, ''))
}

// Validate email
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Generate mock OTP (for demo purposes)
export function generateMockOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Mock bank data
export const BANKS = [
  { value: 'bidv', label: 'BIDV' },
  { value: 'vib', label: 'VIB' },
  { value: 'vpbank', label: 'VPBank' },
  { value: 'techcombank', label: 'Techcombank' },
  { value: 'vietcombank', label: 'Vietcombank' },
  { value: 'agribank', label: 'Agribank' },
  { value: 'sacombank', label: 'Sacombank' },
  { value: 'acb', label: 'ACB' },
]

// Collateral types for Flow 2
export const COLLATERAL_TYPES = [
  { value: 'nha_o', label: 'Nhà ở' },
  { value: 'can_ho', label: 'Căn hộ' },
  { value: 'dat_nen', label: 'Đất nền' },
  { value: 'nha_xuong', label: 'Nhà xưởng' },
  { value: 'van_phong', label: 'Văn phòng' },
  { value: 'cua_hang', label: 'Cửa hàng' },
]

// Vietnamese provinces/cities
export const PROVINCES = [
  'Hà Nội',
  'Hồ Chí Minh',
  'Đà Nẵng',
  'Hải Phòng',
  'Cần Thơ',
  'An Giang',
  'Bà Rịa - Vũng Tàu',
  'Bắc Giang',
  'Bắc Kạn',
  'Bạc Liêu',
  'Bắc Ninh',
  'Bến Tre',
  'Bình Định',
  'Bình Dương',
  'Bình Phước',
  'Bình Thuận',
  'Cà Mau',
  'Cao Bằng',
  'Đắk Lắk',
  'Đắk Nông',
  'Điện Biên',
  'Đồng Nai',
  'Đồng Tháp',
  'Gia Lai',
  'Hà Giang',
  'Hà Nam',
  'Hà Tĩnh',
  'Hải Dương',
  'Hậu Giang',
  'Hòa Bình',
  'Hưng Yên',
  'Khánh Hòa',
  'Kiên Giang',
  'Kon Tum',
  'Lai Châu',
  'Lâm Đồng',
  'Lạng Sơn',
  'Lào Cai',
  'Long An',
  'Nam Định',
  'Nghệ An',
  'Ninh Bình',
  'Ninh Thuận',
  'Phú Thọ',
  'Phú Yên',
  'Quảng Bình',
  'Quảng Nam',
  'Quảng Ngãi',
  'Quảng Ninh',
  'Quảng Trị',
  'Sóc Trăng',
  'Sơn La',
  'Tây Ninh',
  'Thái Bình',
  'Thái Nguyên',
  'Thanh Hóa',
  'Thừa Thiên Huế',
  'Tiền Giang',
  'Trà Vinh',
  'Tuyên Quang',
  'Vĩnh Long',
  'Vĩnh Phúc',
  'Yên Bái'
] 