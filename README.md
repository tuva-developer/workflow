# Workflow UI (React + TypeScript + Vite)

Giao diện đồ họa cho nền tảng workflow/BPMN, xây dựng bằng React 18, TypeScript và Vite 5. Dự án tích hợp trình thiết kế/hiển thị BPMN, quản trị biểu mẫu, i18n, theming, và hệ sinh thái Material UI.

## Tính năng chính
- BPMN modeler/viewer tùy biến (context pad, palette, properties panel, renderer, replace menu, translate provider)
- Quản lý template, form, schedule, task, instance (mock và service abstraction)
- UI dựa trên MUI v6, DataGrid, Date Pickers, và các tiện ích như React Query, React Router
- Đa ngôn ngữ (i18next), dark/light theme, toast notification
- Build tối ưu với gzip (vite-plugin-compression) và copy tài nguyên tĩnh cần thiết

## Yêu cầu hệ thống
- Node.js >= 18
- npm >= 9 (hoặc pnpm/yarn tương đương)
- Hệ điều hành: Windows, macOS, Linux

## Bắt đầu
```bash
# Cài đặt phụ thuộc
npm install

# Chạy dev (HMR)
npm run dev

# Kiểm tra lint
npm run lint

# Build production
npm run build

# Xem trước build
npm run preview
```

## Scripts
- `dev`: khởi chạy Vite dev server với HMR
- `build`: biên dịch TypeScript và build Vite (kèm nén gzip, copy worker)
- `preview`: phục vụ thư mục build `dist` ở môi trường cục bộ
- `lint`: chạy ESLint cho `ts/tsx`

## Cấu hình Vite quan trọng
```startLine:endLine:vite.config.ts
// xem file để biết đầy đủ
```
- **Plugin**: `@vitejs/plugin-react`, `vite-plugin-compression` (gzip `.gz`), `vite-plugin-static-copy` (copy `ace/worker-javascript.js` vào `dist/ace`)
- **Alias**: `@ -> src`
- **Proxy dev**: chuyển tiếp `/api` và `/oauth` tới `https://gisonline.vietbando.vn` (đã `rewrite` bỏ prefix)

## Cấu trúc thư mục chính
```text
src/
  api/                 # axios client
  auth/                # auth api, lưu token
  bpmnProvider/        # tùy biến BPMN: palette, properties, renderer, parts, components
  components/          # common, dialogs, layout, pages, tables
  config/              # env.ts
  contexts/            # App/Theme/Language/User context & provider
  hooks/               # react-query hooks, custom hooks
  mockData/            # dữ liệu giả lập
  routes/              # định tuyến ứng dụng
  services/            # lớp dịch vụ (forms, models, tasks, ...)
  styles/              # theme, styles
  types/               # khai báo type, augment
  utils/               # hằng số, xử lý lỗi, guards
public/
  env/config.js        # cấu hình môi trường runtime (đọc ở client)
  icons/, images/, ... # tài nguyên tĩnh
```

## Cấu hình môi trường (runtime)
- File: `public/env/config.js` (được copy sang `dist/env/config.js` khi build)
- Dùng để cấu hình URL API, khóa, hoặc biến runtime mà không cần rebuild. Ví dụ:
```javascript
window.__ENV__ = {
  API_BASE_URL: "https://example.com",
  MAP_TOKEN: "",
};
```
- Ứng dụng có thể đọc qua `window.__ENV__` hoặc wrapper tại `src/config/env.ts`.

## Phát triển
- **HMR**: chạy `npm run dev`, truy cập `http://localhost:5173`
- **Proxy API**: gọi tới `/api/...` hoặc `/oauth/...` trong dev sẽ được proxy đến `https://gisonline.vietbando.vn`
- **Alias**: import với `@/` thay cho đường dẫn tương đối dài
- **Query/Mutation**: sử dụng `@tanstack/react-query` với `src/queryClient.ts` và hooks trong `src/hooks`
- **i18n**: cấu hình tại `src/i18n.ts`, context tại `contexts/LanguageProvider.tsx`
- **Theme**: `src/styles/theme.ts` và `contexts/ThemeProvider.tsx`

## Build & Deploy
- `npm run build` sẽ tạo thư mục `dist/`:
  - Nén gzip `.js`/`.css` (đồng thời giữ file gốc)
  - Copy `ace/worker-javascript.js` vào `dist/ace`
  - Copy `public/` sang `dist/` (bao gồm `env/config.js`, icons, images)
- Deploy `dist/` lên bất kỳ static host nào (Nginx, Apache, S3/CloudFront, Vercel, Netlify, IIS, v.v.)
- Với IIS, sử dụng `dist/web.config` đã cung cấp

## Lưu ý về BPMN
- Tài nguyên và biểu tượng BPMN được đóng gói trong `public/icons/bpmn` và fonts trong `dist/assets`
- Các nhóm thuộc tính mở rộng: xem `src/bpmnProvider/parts/` và `components/`
- Tùy biến dịch: `src/bpmnProvider/translations/translations.js`

## Chất lượng mã
- ESLint đã được cấu hình cơ bản cho TypeScript + React
- Khuyến nghị bổ sung rule `type-checked` nếu dự án sản xuất

## License
Mã nguồn trong repo này thuộc sở hữu của tác giả. Nếu bạn muốn sử dụng lại, vui lòng liên hệ chủ sở hữu dự án.
