import { useState, useEffect } from 'react'
import { Building2, TrendingDown, Award, CheckCircle, DollarSign, Calendar, Percent } from 'lucide-react'
import { NewLoanInputData, LoanOffer } from '../types'
import { formatVND, calculateMonthlyPayment, calculateTotalRepayment, BANKS } from '../lib/utils'
import { analytics } from '../lib/posthog'
import SuccessModal from './SuccessModal'

interface NewLoanOffersStepProps {
  loanData: NewLoanInputData
  onOfferSelect: (offer: LoanOffer) => void
  onBack: () => void
}

export default function NewLoanOffersStep({ loanData, onOfferSelect, onBack }: NewLoanOffersStepProps) {
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [selectedOffer, setSelectedOffer] = useState<LoanOffer | null>(null)

  useEffect(() => {
    analytics.pageView('new_loan_offers')
  }, [])

  // Generate offers based on selected banks
  const generateOffers = (): LoanOffer[] => {
    const selectedBankNames = loanData.selectedBanks || []
    
    return selectedBankNames.map((bankValue, index) => {
      const bank = BANKS.find(b => b.value === bankValue)
      const bankName = bank?.label || bankValue
      
      // Generate realistic rates based on bank (some variation)
      const baseRate = Number(loanData.desiredRate) || 8.5
      const initialRate = baseRate + (Math.random() * 1.5 - 0.75) // ±0.75%
      const fixedRate = initialRate + (Math.random() * 0.5 + 0.5) // +0.5-1%
      
      const loanAmount = Number(loanData.loanAmount) || 2000000000
      const term = Number(loanData.loanTerm) || 240
      
      const monthlyPaymentFixed = calculateMonthlyPayment(loanAmount, initialRate, term)
      const monthlyPaymentFloating = calculateMonthlyPayment(loanAmount, fixedRate, term)
      const totalRepayment = calculateTotalRepayment(monthlyPaymentFixed, 60) + 
                           calculateTotalRepayment(monthlyPaymentFloating, term - 60) // 5 years fixed, rest floating
      
      return {
        id: `${bankValue}_${index}`,
        bankName,
        loanAmount,
        term,
        initialRate: Number(initialRate.toFixed(2)),
        fixedRate: Number(fixedRate.toFixed(2)),
        monthlyPayment: Math.round(monthlyPaymentFixed),
        totalRepayment: Math.round(totalRepayment),
        earlyRepaymentPenalty: loanAmount * 0.02, // 2%
        savings: 0 // Will calculate if needed
      }
    }).sort((a, b) => a.initialRate - b.initialRate) // Sort by best rate first
  }

  const offers = generateOffers()

  const getBankColor = (bankName: string) => {
    const colors = {
      'BIDV': 'from-blue-600 to-blue-700',
      'VIB': 'from-purple-600 to-purple-700', 
      'VPBank': 'from-green-600 to-green-700',
      'Techcombank': 'from-red-600 to-red-700',
      'Vietcombank': 'from-indigo-600 to-indigo-700',
      'Agribank': 'from-yellow-600 to-yellow-700',
      'Sacombank': 'from-pink-600 to-pink-700',
      'ACB': 'from-gray-600 to-gray-700'
    }
    return colors[bankName as keyof typeof colors] || 'from-blue-600 to-blue-700'
  }

  const handleSelectOffer = (offer: LoanOffer) => {
    setSelectedOffer(offer)
    setShowSuccessModal(true)
  }

  const handleSuccessClose = () => {
    setShowSuccessModal(false)
    if (selectedOffer) {
      onOfferSelect(selectedOffer)
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Kết quả so sánh
        </h2>
        <p className="text-gray-600">
          Dựa trên thông tin bạn cung cấp, chúng tôi tìm thấy {offers.length} gói vay phù hợp
        </p>
      </div>

      {/* Loan Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">Thông tin vay của bạn</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-blue-600 font-medium">Số tiền vay:</span>
            <p className="text-blue-900 font-bold">{formatVND(loanData.loanAmount || 0)}</p>
          </div>
          <div>
            <span className="text-blue-600 font-medium">Kỳ hạn:</span>
            <p className="text-blue-900 font-bold">{loanData.loanTerm} tháng</p>
          </div>
          <div>
            <span className="text-blue-600 font-medium">Lãi suất mong muốn:</span>
            <p className="text-blue-900 font-bold">{loanData.desiredRate}%</p>
          </div>
          <div>
            <span className="text-blue-600 font-medium">Tài sản thế chấp:</span>
            <p className="text-blue-900 font-bold">{formatVND(loanData.collateralValue || 0)}</p>
          </div>
        </div>
      </div>

      {/* Offers Grid */}
      <div className={`grid gap-6 ${offers.length === 1 ? 'max-w-md mx-auto' : offers.length === 2 ? 'md:grid-cols-2' : offers.length === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2 lg:grid-cols-4'}`}>
        {offers.map((offer, index) => (
          <div
            key={offer.id}
            className={`relative bg-white rounded-xl shadow-lg border-2 transition-all duration-300 hover:shadow-xl ${
              index === 0 ? 'border-green-500 ring-2 ring-green-200' : 'border-gray-200 hover:border-primary-300'
            }`}
          >
            {/* Best Offer Badge */}
            {index === 0 && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                <div className="bg-green-500 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center">
                  <Award className="w-4 h-4 mr-1" />
                  Lãi suất tốt nhất
                </div>
              </div>
            )}

            <div className="p-6">
              {/* Bank Header */}
              <div className="text-center mb-6">
                <div className={`w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-r ${getBankColor(offer.bankName)} flex items-center justify-center`}>
                  <Building2 className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">{offer.bankName}</h3>
              </div>

              {/* Offer Details */}
              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <Percent className="w-4 h-4 text-primary-600 mr-2" />
                    <span className="text-sm font-medium">Lãi suất cố định</span>
                  </div>
                  <span className="text-lg font-bold text-primary-600">{offer.initialRate}%</span>
                </div>

                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <TrendingDown className="w-4 h-4 text-orange-600 mr-2" />
                    <span className="text-sm font-medium">Lãi suất thả nổi</span>
                  </div>
                  <span className="text-lg font-bold text-orange-600">{offer.fixedRate}%</span>
                </div>

                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <DollarSign className="w-4 h-4 text-green-600 mr-2" />
                    <span className="text-sm font-medium">Trả hàng tháng</span>
                  </div>
                  <span className="text-lg font-bold text-green-600">
                    {formatVND(offer.monthlyPayment)}
                  </span>
                </div>

                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 text-purple-600 mr-2" />
                    <span className="text-sm font-medium">Tổng tiền trả</span>
                  </div>
                  <span className="text-lg font-bold text-purple-600">
                    {formatVND(offer.totalRepayment)}
                  </span>
                </div>
              </div>

              {/* Additional Info */}
              <div className="text-xs text-gray-500 mb-6 space-y-1">
                <p>• Lãi suất cố định 5 năm đầu</p>
                <p>• Phí trả nợ trước hạn: 2%</p>
                <p>• Phí thẩm định: Miễn phí</p>
                <p>• Thời gian giải ngân: 7-10 ngày</p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={() => handleSelectOffer(offer)}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                    index === 0
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'bg-primary-600 hover:bg-primary-700 text-white'
                  }`}
                >
                  Chọn gói vay này
                </button>
                <button className="w-full py-2 px-4 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium text-sm">
                  Tìm hiểu thêm
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Actions */}
      <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
        <button
          onClick={onBack}
          className="btn-secondary flex items-center"
        >
          Quay lại
        </button>
        <div className="text-sm text-gray-500">
          Lãi suất có thể thay đổi theo chính sách của từng ngân hàng
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && selectedOffer && (
        <SuccessModal
          onClose={handleSuccessClose}
        />
      )}
    </div>
  )
} 