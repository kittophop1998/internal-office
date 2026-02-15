# Next.js Boilerplate with MUI & i18n

Next.js boilerplate ที่ใช้ Material-UI (MUI) เป็น UI library หลัก พร้อมรองรับหลายภาษา (i18n)

## 🚀 Features

- ⚡️ **Next.js 16** - React framework ที่ทันสมัย
- 🎨 **Material-UI (MUI)** - UI component library ที่สวยงามและใช้งานง่าย
- 🌍 **i18n** - รองรับหลายภาษา (ไทย/อังกฤษ)
- 📱 **Responsive** - ออกแบบให้รองรับทุกขนาดหน้าจอ
- 🎯 **TypeScript** - Type safety
- 📦 **Common Components** - Components พื้นฐานพร้อมใช้งาน
- 🎭 **Custom Hooks** - Hooks ที่ใช้งานบ่อย

## 📦 Common Components

### UI Components
- **Button** - ปุ่มที่รองรับ loading state
- **Card** - กล่องสำหรับแสดงเนื้อหา
- **Modal** - Dialog สำหรับแสดงข้อมูล
- **TextField** - Input field ที่ทำงานร่วมกับ react-hook-form
- **Loading** - แสดงสถานะการโหลด
- **Notification** - แสดงข้อความแจ้งเตือน
- **ErrorMessage** - แสดงข้อความ error

### Layout Components
- **Header** - Header พร้อม language switcher
- **Footer** - Footer
- **Sidebar** - Sidebar navigation
- **MainLayout** - Layout หลักที่รวม Header, Sidebar, Footer

### Custom Hooks
- **useNotification** - จัดการ notification ง่ายๆ

## 🛠️ การติดตั้ง

```bash
npm install
```

## 🚀 การรันโปรเจค

```bash
# Development mode
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

เปิดเบราว์เซอร์ไปที่ [http://localhost:3000](http://localhost:3000)

## 📂 โครงสร้างโปรเจค

```
src/
├── app/                    # Next.js app directory
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── example/           # Example page
├── components/
│   ├── common/            # Common components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Modal.tsx
│   │   ├── TextField.tsx
│   │   ├── Loading.tsx
│   │   ├── Notification.tsx
│   │   └── ErrorMessage.tsx
│   ├── layouts/           # Layout components
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── Sidebar.tsx
│   │   └── MainLayout.tsx
│   └── ui/                # UI specific components
├── hooks/                 # Custom hooks
│   └── useNotification.ts
├── lib/                   # Libraries & utilities
│   ├── theme.ts          # MUI theme configuration
│   └── i18n/             # i18n configuration
│       ├── config.ts
│       └── locales/      # Translation files
│           ├── th.json
│           └── en.json
├── services/              # API services
├── stores/                # State management
├── styles/                # Global styles
│   └── globals.css
└── types/                 # TypeScript types
```

## 🎨 การใช้งาน Components

### Button with Loading State

```tsx
import { Button } from '@/components/common';

<Button variant="contained" loading={isLoading}>
  บันทึก
</Button>
```

### Modal

```tsx
import { Modal } from '@/components/common';

<Modal
  open={open}
  title="ยืนยันการลบ"
  onClose={handleClose}
  onConfirm={handleConfirm}
>
  คุณต้องการลบข้อมูลนี้หรือไม่?
</Modal>
```

### Notification Hook

```tsx
import { useNotification } from '@/hooks';

const { showSuccess, showError } = useNotification();

// แสดงข้อความสำเร็จ
showSuccess('บันทึกข้อมูลสำเร็จ');

// แสดงข้อความ error
showError('เกิดข้อผิดพลาด');
```

### TextField with react-hook-form

```tsx
import { TextField } from '@/components/common';
import { useForm } from 'react-hook-form';

const { control } = useForm();

<TextField
  name="email"
  control={control}
  label="อีเมล"
  type="email"
  fullWidth
/>
```

### Layout

```tsx
import { MainLayout } from '@/components/layouts';

<MainLayout title="My App" showSidebar>
  <YourContent />
</MainLayout>
```

## 🌍 i18n (Internationalization)

### การเพิ่มคำแปล

แก้ไขไฟล์ใน `src/lib/i18n/locales/`

```json
// th.json
{
  "common": {
    "save": "บันทึก",
    "cancel": "ยกเลิก"
  }
}

// en.json
{
  "common": {
    "save": "Save",
    "cancel": "Cancel"
  }
}
```

### การใช้งาน

```tsx
import { useTranslation } from 'react-i18next';

const { t, i18n } = useTranslation();

// แสดงข้อความ
<p>{t('common.save')}</p>

// เปลี่ยนภาษา
i18n.changeLanguage('en');
```

## 🎨 Theme Customization

แก้ไขไฟล์ `src/lib/theme.ts`

```typescript
export const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#9c27b0',
    },
  },
  typography: {
    fontFamily: 'Noto Sans Thai, sans-serif',
  },
});
```

## 📝 License

MIT
