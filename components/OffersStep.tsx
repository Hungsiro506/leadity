import { useState } from 'react'
import { Building2, TrendingDown, Award, CheckCircle } from 'lucide-react'
import { LoanInputData, EarlyPaymentData, LoanOffer } from '../types'
import { formatVND, calculateMonthlyPayment, calculateTotalRepayment } from '../lib/utils'

interface OffersStepProps {
  loanData: LoanInputData
  earlyPaymentData: EarlyPaymentData
  onOfferSelect: (offer: LoanOffer) => void
  onBack: () => void
}

export default function OffersStep({ 
  loanData, 
  earlyPaymentData, 
  onOfferSelect, 
  onBack 
}: OffersStepProps) {
  const [selectedOffers, setSelectedOffers] = useState<string[]>([])

  // Generate mock offers based on loan data
  const generateOffers = (): LoanOffer[] => {
    if (!loanData.newLoanAmount || !loanData.loanTerm) return []

    const baseOffers = [
      {
        id: 'bidv-offer',
        bankName: 'BIDV',
        initialRate: 7.5,
        fixedRate: 8.2,
        earlyRepaymentPenalty: 2.0,
        color: 'blue'
      },
      {
        id: 'vib-offer',
        bankName: 'VIB',
        initialRate: 7.8,
        fixedRate: 8.5,
        earlyRepaymentPenalty: 1.5,
        color: 'purple'
      },
      {
        id: 'vpbank-offer',
        bankName: 'VPBank',
        initialRate: 7.2,
        fixedRate: 7.9,
        earlyRepaymentPenalty: 2.5,
        color: 'green'
      },
      {
        id: 'techcombank-offer',
        bankName: 'Techcombank',
        initialRate: 7.6,
        fixedRate: 8.3,
        earlyRepaymentPenalty: 2.0,
        color: 'red'
      }
    ]

    return baseOffers.map(offer => {
      const monthlyPayment = calculateMonthlyPayment(
        loanData.newLoanAmount!,
        offer.fixedRate,
        loanData.loanTerm!
      )
      const totalRepayment = calculateTotalRepayment(monthlyPayment, loanData.loanTerm!)
      const savings = loanData.desiredRate ? 
        (calculateMonthlyPayment(loanData.newLoanAmount!, loanData.desiredRate, loanData.loanTerm!) - monthlyPayment) * loanData.loanTerm! : 
        0

      return {
        ...offer,
        loanAmount: loanData.newLoanAmount!,
        term: loanData.loanTerm!,
        monthlyPayment,
        totalRepayment,
        savings: Math.max(savings, 0)
      }
    })
  }

  const offers = generateOffers()
  const bestOffer = offers.length > 0 ? 
    offers.reduce((best, current) => 
      current.fixedRate < best.fixedRate ? current : best
    ) : null

  const handleSelectOffer = (offer: LoanOffer) => {
    const isSelected = selectedOffers.includes(offer.id)
    
    if (isSelected) {
      // Deselect offer
      setSelectedOffers(selectedOffers.filter(id => id !== offer.id))
    } else {
      // Select offer
      setSelectedOffers([...selectedOffers, offer.id])
      onOfferSelect(offer)
    }
  }

  const isOfferSelected = (offerId: string): boolean => {
    return selectedOffers.includes(offerId)
  }

  const getBankColor = (bankName: string): string => {
    const colorMap: {[key: string]: string} = {
      'BIDV': 'blue',
      'VIB': 'purple', 
      'VPBank': 'green',
      'Techcombank': 'red'
    }
    return colorMap[bankName] || 'gray'
  }

  if (offers.length === 0) {
    return (
      <div className="card max-w-2xl mx-auto text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Không thể tạo báo giá
        </h2>
        <p className="text-gray-600 mb-6">
          Vui lòng kiểm tra lại thông tin vay đã nhập.
        </p>
        <button onClick={onBack} className="btn-secondary">
          Quay lại
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
          <Building2 className="h-8 w-8 text-green-600" />
        </div>
                 <h2 className="text-3xl font-bold text-gray-900 mb-2">
           Kết quả so sánh lãi suất
         </h2>
         <p className="text-gray-600 mb-2">
           Chúng tôi đã tìm được {offers.length} gói vay phù hợp với yêu cầu của bạn
         </p>
         <div className="flex items-center justify-between">
           <p className="text-sm text-blue-600 font-medium">
             💡 Bạn có thể chọn nhiều gói vay để so sánh chi tiết
           </p>
           {selectedOffers.length > 0 && (
             <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
               {selectedOffers.length} đã chọn
             </div>
           )}
         </div>
      </div>

      {/* Summary Card */}
      <div className="card mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin so sánh</h3>
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Số tiền vay:</span>
            <p className="font-medium">{formatVND(loanData.newLoanAmount!)}</p>
          </div>
          <div>
            <span className="text-gray-600">Thời hạn:</span>
            <p className="font-medium">{loanData.loanTerm} tháng ({Math.round(loanData.loanTerm! / 12)} năm)</p>
          </div>
          <div>
            <span className="text-gray-600">Lãi suất mong muốn:</span>
            <p className="font-medium">{loanData.desiredRate}%/năm</p>
          </div>
        </div>
      </div>

      {/* Offers Grid */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {offers.map((offer, index) => (
          <div
            key={offer.id}
            className={`relative card hover:shadow-lg transition-shadow duration-200 ${
              offer.id === bestOffer?.id ? 'ring-2 ring-green-500' : ''
            }`}
          >
            {offer.id === bestOffer?.id && (
              <div className="absolute -top-3 left-6 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center">
                <Award className="h-4 w-4 mr-1" />
                Ưu đãi tốt nhất
              </div>
            )}

                         <div className="flex items-center justify-between mb-4">
               <div className="flex items-center">
                 <div className={`w-12 h-12 rounded-lg bg-${getBankColor(offer.bankName)}-100 flex items-center justify-center mr-3`}>
                   <Building2 className={`h-6 w-6 text-${getBankColor(offer.bankName)}-600`} />
                 </div>
                 <h3 className="text-xl font-bold text-gray-900">{offer.bankName}</h3>
               </div>
             </div>

            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-gray-600">Lãi suất ban đầu</span>
                  <p className="text-lg font-semibold text-gray-900">{offer.initialRate}%</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Lãi suất cố định</span>
                  <p className="text-lg font-semibold text-gray-900">{offer.fixedRate}%</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Trả hàng tháng:</span>
                    <span className="font-semibold">{formatVND(offer.monthlyPayment)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tổng tiền trả:</span>
                    <span className="font-semibold">{formatVND(offer.totalRepayment)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phí trả trước hạn:</span>
                    <span className="font-semibold">{offer.earlyRepaymentPenalty}%</span>
                  </div>
                  {offer.savings > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Tiết kiệm so với mong muốn:</span>
                      <span className="font-semibold flex items-center">
                        <TrendingDown className="h-4 w-4 mr-1" />
                        {formatVND(offer.savings)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

                         <button
               onClick={() => handleSelectOffer(offer)}
               className={`w-full py-3 px-4 rounded-lg font-medium transition-colors duration-200 ${
                 isOfferSelected(offer.id)
                   ? 'bg-green-600 text-white'
                   : `bg-${getBankColor(offer.bankName)}-600 hover:bg-${getBankColor(offer.bankName)}-700 text-white`
               }`}
             >
               {isOfferSelected(offer.id) ? (
                 <span className="flex items-center justify-center">
                   <CheckCircle className="h-5 w-5 mr-2" />
                   Đã chọn
                 </span>
               ) : (
                 'Chọn để so sánh'
               )}
             </button>
          </div>
        ))}
      </div>

      {/* Comparison Table */}
      <div className="card mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Bảng so sánh chi tiết</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-2 font-medium text-gray-900">Ngân hàng</th>
                <th className="text-center py-3 px-2 font-medium text-gray-900">Lãi suất</th>
                <th className="text-center py-3 px-2 font-medium text-gray-900">Trả hàng tháng</th>
                <th className="text-center py-3 px-2 font-medium text-gray-900">Tổng tiền trả</th>
                <th className="text-center py-3 px-2 font-medium text-gray-900">Phí trả trước</th>
              </tr>
            </thead>
            <tbody>
              {offers.map((offer) => (
                <tr key={offer.id} className="border-b border-gray-100">
                  <td className="py-3 px-2 font-medium">{offer.bankName}</td>
                  <td className="py-3 px-2 text-center">{offer.fixedRate}%</td>
                  <td className="py-3 px-2 text-center">{formatVND(offer.monthlyPayment)}</td>
                  <td className="py-3 px-2 text-center">{formatVND(offer.totalRepayment)}</td>
                  <td className="py-3 px-2 text-center">{offer.earlyRepaymentPenalty}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-between">
        <button onClick={onBack} className="btn-secondary">
          Quay lại
        </button>
                 <div className="text-gray-500 text-sm">
           {selectedOffers.length > 0 ? (
             <span className="text-green-600 font-medium">
               ✓ Đã chọn {selectedOffers.length} gói vay để so sánh
             </span>
           ) : (
             'Chọn một hoặc nhiều gói vay để so sánh chi tiết'
           )}
         </div>
      </div>
    </div>
  )
} 