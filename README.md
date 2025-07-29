# Leadity - Nền tảng So sánh Lãi suất Vay Thế chấp

Một ứng dụng web hiện đại cho phép người dùng so sánh lãi suất vay thế chấp từ các ngân hàng hàng đầu Việt Nam, được xây dựng với Next.js, TypeScript, và Tailwind CSS.

## ✨ Tính năng chính

- **🏠 Hai luồng so sánh:**
  - So sánh khoản vay hiện tại với các gói vay khác
  - Tìm kiếm gói vay cho việc mua nhà mới

- **💰 Tính toán chính xác:**
  - Phí trả nợ trước hạn
  - Số tiền trả hàng tháng
  - Tổng tiền phải trả
  - Tiết kiệm chi phí

- **📊 So sánh đa ngân hàng:**
  - BIDV, VIB, VPBank, Techcombank
  - Hiển thị bảng so sánh chi tiết
  - Gợi ý gói vay tốt nhất

- **🔐 Xác thực OTP demo:**
  - Mô phỏng quy trình xác thực
  - Thu thập thông tin khách hàng

- **📈 Tích hợp PostHog Analytics:**
  - Theo dõi hành vi người dùng
  - Phân tích funnel conversion
  - Báo cáo chi tiết

## 🚀 Công nghệ sử dụng

- **Frontend:** Next.js 14, React 18, TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** Lucide React (icons)
- **Analytics:** PostHog
- **Responsive:** Mobile-first design

## 📋 Yêu cầu hệ thống

- Node.js 18.0 hoặc cao hơn
- npm hoặc yarn
- Git

## ⚡ Cài đặt và chạy

### 1. Clone repository

```bash
git clone <repository-url>
cd loan-comparison-website
```

### 2. Cài đặt dependencies

```bash
npm install
# hoặc
yarn install
```

### 3. Chạy development server

```bash
npm run dev
# hoặc
yarn dev
```

### 4. Mở trình duyệt

Truy cập [http://localhost:3000](http://localhost:3000) để xem ứng dụng.

## 🏗️ Cấu trúc dự án

```
loan-comparison-website/
├── components/          # React components
│   ├── ContactStep.tsx
│   ├── EarlyPaymentStep.tsx
│   ├── LoanInputStep.tsx
│   ├── OffersStep.tsx
│   ├── OTPModal.tsx
│   └── SuccessModal.tsx
├── lib/                # Utilities và helpers
│   ├── posthog.ts      # PostHog configuration
│   └── utils.ts        # Utility functions
├── pages/              # Next.js pages
│   ├── _app.tsx        # App component
│   ├── index.tsx       # Landing page
│   └── loan-comparison.tsx # Main flow
├── styles/
│   └── globals.css     # Global styles
├── types/
│   └── index.ts        # TypeScript definitions
└── public/            # Static assets
```

## 🎯 Quy trình sử dụng

### 1. Trang chủ
- Chọn một trong hai luồng so sánh
- Hiển thị thông tin về dịch vụ

### 2. Nhập thông tin vay
- **Luồng 1:** Dư nợ hiện tại, khoản vay mới, kỳ hạn, lãi suất mong muốn
- **Luồng 2:** Số tiền vay, kỳ hạn, lãi suất mong muốn

### 3. Tính phí trả nợ trước hạn
- Chọn ngân hàng hiện tại
- Nhập thông tin khoản vay ban đầu
- Tự động tính phí 2% (có thể tùy chỉnh)

### 4. Thu thập thông tin liên hệ
- Thông tin cá nhân và liên hệ
- Xác thực OTP demo (sử dụng mã hiển thị hoặc 123456)

### 5. Hiển thị kết quả so sánh
- So sánh 4 ngân hàng với lãi suất khác nhau
- Hiển thị gói vay tốt nhất
- Bảng so sánh chi tiết

### 6. Chọn gói vay và hoàn tất
- Modal thông báo thành công
- Quay về trang chủ

## 📊 PostHog Analytics

Ứng dụng tích hợp sẵn các sự kiện tracking:

- `visited` - Người dùng truy cập trang chủ
- `compare_new_loan` - Chọn luồng vay mua nhà mới
- `compare_own_loan` - Chọn luồng so sánh khoản vay hiện tại
- `current_loan_input` - Nhập thông tin vay
- `current_loan_early_input` - Nhập thông tin phí trả trước hạn
- `identified` - Xác thực OTP thành công
- `select_loan_option` - Chọn gói vay

## 🎨 Demo OTP

Để test tính năng OTP, sử dụng một trong các mã sau:
- Mã hiển thị trong modal (tự động tạo)
- `123456` (mã demo cố định)

## 🔧 Tùy chỉnh

### Thay đổi ngân hàng
Chỉnh sửa file `lib/utils.ts` trong mảng `BANKS`:

```typescript
export const BANKS = [
  { value: 'bidv', label: 'BIDV' },
  { value: 'vib', label: 'VIB' },
  // Thêm ngân hàng mới
]
```

### Cập nhật PostHog key
Thay đổi API key trong `lib/posthog.ts`:

```typescript
posthog.init('YOUR_POSTHOG_API_KEY', {
  api_host: 'https://us.i.posthog.com',
  // ...
})
```

### Thay đổi tỉnh/thành phố
Chỉnh sửa mảng `PROVINCES` trong `lib/utils.ts`.

## 🚀 Deployment

### Build production

```bash
npm run build
npm start
```

### Deploy lên Vercel

1. Push code lên GitHub
2. Kết nối repository với Vercel
3. Deploy tự động

### Deploy lên Netlify

```bash
npm run build
# Upload folder .next/out
```

## 🧪 Testing

Để test các tính năng:

1. **Flow 1 (So sánh khoản vay hiện tại):**
   - Dư nợ: 2,000,000,000 VND
   - Khoản vay mới: 1,500,000,000 VND
   - Kỳ hạn: 240 tháng
   - Lãi suất: 8.5%

2. **Flow 2 (Vay mua nhà mới):**
   - Số tiền vay: 3,000,000,000 VND
   - Kỳ hạn: 300 tháng
   - Lãi suất: 7.8%

3. **OTP Testing:**
   - Số điện thoại: 0987654321
   - OTP: 123456 hoặc mã hiển thị

## 🤝 Đóng góp

1. Fork repository
2. Tạo feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Mở Pull Request

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.

## 📞 Liên hệ

- Website: [Leadity](http://localhost:3000)
- Email: contact@leadity.vn

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [PostHog](https://posthog.com/)
- [Lucide React](https://lucide.dev/)

---

**Lưu ý:** Đây là phiên bản demo với dữ liệu giả lập. Trong production, cần tích hợp API thực từ các ngân hàng và hệ thống SMS thật. 