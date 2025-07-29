import { CheckCircle, X } from 'lucide-react'

interface SuccessModalProps {
  onClose: () => void
}

export default function SuccessModal({ onClose }: SuccessModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 w-full max-w-md mx-4 text-center">
        <div className="flex justify-end mb-4">
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-6">
          <div className="bg-green-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Congratzz! Đăng ký thành công
          </h2>
          <p className="text-gray-600">
            Chúng tôi đã ghi nhận yêu cầu của bạn. Ngân hàng sẽ liên hệ với bạn trong thời gian sớm nhất.
          </p>
        </div>

        <div className="space-y-3">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Các bước tiếp theo:</strong>
            </p>
            <ul className="text-sm text-blue-700 mt-2 space-y-1">
              <li>• Ngân hàng sẽ gọi điện xác thực thông tin</li>
              <li>• Chuẩn bị hồ sơ pháp lý theo yêu cầu</li>
              <li>• Thẩm định và phê duyệt khoản vay</li>
            </ul>
          </div>

          <button
            onClick={onClose}
            className="btn-primary w-full"
          >
            Về trang chủ
          </button>
        </div>
      </div>
    </div>
  )
} 