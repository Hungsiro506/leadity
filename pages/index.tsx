import { useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { Calculator, Home, TrendingUp } from 'lucide-react'
import { analytics } from '../lib/posthog'

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    analytics.visited()
  }, [])

  const handleExistingLoan = () => {
    analytics.compareOwnLoan()
    router.push('/loan-comparison?flow=existing')
  }

  const handleNewLoan = () => {
    analytics.compareNewLoan()
    router.push('/new-loan-comparison')
  }

  return (
    <>
      <Head>
        <title>So Sánh Lãi Suất Vay - Tìm Gói Vay Tốt Nhất</title>
        <meta name="description" content="So sánh lãi suất vay thế chấp từ các ngân hàng hàng đầu Việt Nam. Tìm gói vay phù hợp nhất cho bạn." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* Modern Header */}
        <header className="bg-white/80 backdrop-blur-md shadow-lg border-b border-white/20 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center">
                <div className="bg-gradient-to-r from-primary-600 to-purple-600 p-2 rounded-xl mr-3">
                  <Calculator className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
                    Leadity
                  </h1>
                  <p className="text-xs text-gray-500">Smart Loan Comparison</p>
                </div>
              </div>
              <nav className="hidden md:flex items-center space-x-8">
                <a href="#" className="text-gray-600 hover:text-primary-600 transition-all duration-300 font-medium">Trang chủ</a>
                <a href="#" className="text-gray-600 hover:text-primary-600 transition-all duration-300 font-medium">So sánh</a>
                <a href="#" className="text-gray-600 hover:text-primary-600 transition-all duration-300 font-medium">Về chúng tôi</a>
                <a href="#" className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md transition-all duration-200 font-medium text-sm">
                  Liên hệ
                </a>
              </nav>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              So Sánh Lãi Suất Vay
              <span className="text-primary-600 block">Thế Chấp</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Tìm kiếm và so sánh các gói vay thế chấp tốt nhất từ các ngân hàng hàng đầu Việt Nam. 
              Tiết kiệm thời gian và chi phí với công cụ so sánh miễn phí của chúng tôi.
            </p>
            <div className="flex items-center justify-center space-x-8 text-sm text-gray-500">
              <div className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-green-500" />
                <span>Miễn phí 100%</span>
              </div>
              <div className="flex items-center">
                <Calculator className="h-5 w-5 mr-2 text-blue-500" />
                <span>So sánh nhanh chóng</span>
              </div>
              <div className="flex items-center">
                <Home className="h-5 w-5 mr-2 text-purple-500" />
                <span>Đa dạng ngân hàng</span>
              </div>
            </div>
          </div>

          {/* Flow Selection Cards */}
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Flow 1: Compare Current Loan */}
            <div className="card hover:shadow-lg transition-shadow duration-300 cursor-pointer" onClick={handleExistingLoan}>
              <div className="text-center">
                <div className="bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                  <Calculator className="h-8 w-8 text-primary-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  So sánh khoản vay hiện tại
                </h3>
                <p className="text-gray-600 mb-6">
                  Bạn đã có khoản vay thế chấp và muốn tìm kiếm các gói vay khác với lãi suất tốt hơn?
                </p>
                <ul className="text-left text-gray-600 mb-8 space-y-2">
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-primary-600 rounded-full mr-3"></span>
                    So sánh với khoản vay hiện tại
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-primary-600 rounded-full mr-3"></span>
                    Tính toán phí trả nợ trước hạn
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-primary-600 rounded-full mr-3"></span>
                    Tìm gói vay tốt hơn
                  </li>
                </ul>
                <button className="btn-primary w-full">
                  Bắt đầu so sánh
                </button>
              </div>
            </div>

            {/* Flow 2: New Loan */}
            <div className="card hover:shadow-lg transition-shadow duration-300 cursor-pointer" onClick={handleNewLoan}>
              <div className="text-center">
                <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                  <Home className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Tôi muốn mua nhà mới
                </h3>
                <p className="text-gray-600 mb-6">
                  Bạn đang có kế hoạch mua nhà và cần tìm gói vay thế chấp phù hợp nhất?
                </p>
                <ul className="text-left text-gray-600 mb-8 space-y-2">
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-green-600 rounded-full mr-3"></span>
                    So sánh lãi suất các ngân hàng
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-green-600 rounded-full mr-3"></span>
                    Tính toán khả năng tài chính
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-green-600 rounded-full mr-3"></span>
                    Tìm gói vay phù hợp
                  </li>
                </ul>
                <button className="btn-primary w-full bg-green-600 hover:bg-green-700 focus:ring-green-500">
                  Bắt đầu tìm kiếm
                </button>
              </div>
            </div>
          </div>

          {/* Features Section */}
          <div className="mt-24">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-16">
              Tại sao chọn chúng tôi?
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Miễn phí hoàn toàn</h3>
                <p className="text-gray-600">Không thu phí sử dụng, không có chi phí ẩn nào</p>
              </div>
              <div className="text-center">
                <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Calculator className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">So sánh chính xác</h3>
                <p className="text-gray-600">Công cụ tính toán chính xác, cập nhật lãi suất real-time</p>
              </div>
              <div className="text-center">
                <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Home className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Đa dạng ngân hàng</h3>
                <p className="text-gray-600">Hợp tác với các ngân hàng lớn nhất Việt Nam</p>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-gray-900 text-white mt-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center">
              <div className="flex items-center justify-center mb-4">
                <Calculator className="h-8 w-8 text-primary-400 mr-3" />
                <h3 className="text-2xl font-bold">Leadity</h3>
              </div>
              <p className="text-gray-400 mb-8">
                Nền tảng so sánh lãi suất vay thế chấp hàng đầu Việt Nam
              </p>
              <div className="border-t border-gray-800 pt-8">
                <p className="text-gray-500">
                  © 2025 Leadity. Tất cả các quyền được bảo lưu.
                </p>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
} 