# Hướng dẫn Migration từ shadcn/ui sang MUI

## 1. Tổng quan

Dự án đã được cấu hình MUI (Material-UI) để thay thế shadcn/ui. Các file cấu hình chính:

- `src/theme/muiTheme.ts` - Định nghĩa light theme và dark theme
- `src/theme/MuiThemeProvider.tsx` - Provider component cho MUI
- `src/theme/useThemeMode.ts` - Hook để toggle theme
- `src/main.tsx` - Đã tích hợp CustomMuiThemeProvider

## 2. Packages đã cài đặt

```json
{
  "@mui/material": "^7.3.5",
  "@mui/icons-material": "^7.3.5",
  "@mui/x-date-pickers": "^8.18.0",
  "@emotion/react": "^11.14.0",
  "@emotion/styled": "^11.14.1"
}
```

## 3. So sánh Components: shadcn/ui vs MUI

### Button
```tsx
// shadcn/ui
import { Button } from "@/components/ui/button"
<Button variant="default">Click me</Button>

// MUI
import { Button } from "@mui/material"
<Button variant="contained">Click me</Button>
```

**Mapping variants:**
- `default` → `contained`
- `outline` → `outlined`
- `ghost` → `text`
- `link` → `text` với sx={{ textDecoration: 'underline' }}

### Card
```tsx
// shadcn/ui
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>Content</CardContent>
</Card>

// MUI
import { Card, CardHeader, CardContent, Typography } from "@mui/material"
<Card>
  <CardHeader title="Title" />
  <CardContent>
    <Typography>Content</Typography>
  </CardContent>
</Card>
```

### Input / TextField
```tsx
// shadcn/ui
import { Input } from "@/components/ui/input"
<Input placeholder="Enter text" />

// MUI
import { TextField } from "@mui/material"
<TextField placeholder="Enter text" />
```

### Dialog / Modal
```tsx
// shadcn/ui
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Title</DialogTitle>
    </DialogHeader>
    Content
  </DialogContent>
</Dialog>

// MUI
import { Dialog, DialogTitle, DialogContent } from "@mui/material"
<Dialog open={open} onClose={() => setOpen(false)}>
  <DialogTitle>Title</DialogTitle>
  <DialogContent>Content</DialogContent>
</Dialog>
```

### Avatar
```tsx
// shadcn/ui
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
<Avatar>
  <AvatarImage src="/image.jpg" />
  <AvatarFallback>AB</AvatarFallback>
</Avatar>

// MUI
import { Avatar } from "@mui/material"
<Avatar src="/image.jpg">AB</Avatar>
```

### Badge / Chip
```tsx
// shadcn/ui
import { Badge } from "@/components/ui/badge"
<Badge>New</Badge>

// MUI
import { Chip } from "@mui/material"
<Chip label="New" />
```

### Tabs
```tsx
// shadcn/ui
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
<Tabs value={tab}>
  <TabsList>
    <TabsTrigger value="tab1">Tab 1</TabsTrigger>
    <TabsTrigger value="tab2">Tab 2</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">Content 1</TabsContent>
</Tabs>

// MUI
import { Tabs, Tab, Box } from "@mui/material"
const [tab, setTab] = useState(0)
<Box>
  <Tabs value={tab} onChange={(e, v) => setTab(v)}>
    <Tab label="Tab 1" />
    <Tab label="Tab 2" />
  </Tabs>
  {tab === 0 && <Box>Content 1</Box>}
  {tab === 1 && <Box>Content 2</Box>}
</Box>
```

### Dropdown Menu
```tsx
// shadcn/ui
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"
<DropdownMenu>
  <DropdownMenuTrigger>Open</DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem>Item 1</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>

// MUI
import { Menu, MenuItem, IconButton } from "@mui/material"
const [anchorEl, setAnchorEl] = useState(null)
<>
  <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>Open</IconButton>
  <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
    <MenuItem onClick={() => setAnchorEl(null)}>Item 1</MenuItem>
  </Menu>
</>
```

## 4. Icons

```tsx
// lucide-react (hiện tại)
import { User, Settings, LogOut } from "lucide-react"
<User />

// MUI Icons
import { Person, Settings, Logout } from "@mui/icons-material"
<Person />
```

**Icon mapping phổ biến:**
- `User` → `Person`
- `LogOut` → `Logout`
- `Settings` → `Settings`
- `Search` → `Search`
- `Send` → `Send`
- `Plus` → `Add`
- `X` → `Close`
- `Check` → `Check`
- `ChevronDown` → `ExpandMore`
- `ChevronUp` → `ExpandLess`
- `ChevronLeft` → `ChevronLeft`
- `ChevronRight` → `ChevronRight`

## 5. Styling với MUI

### Sử dụng sx prop
```tsx
// Thay vì className với Tailwind
<Box className="p-4 bg-gray-100">

// Sử dụng sx prop
<Box sx={{ p: 4, bgcolor: 'background.paper' }}>
```

### Responsive design
```tsx
<Box sx={{
  width: { xs: '100%', sm: '50%', md: '33%' },
  padding: { xs: 2, md: 4 }
}}>
```

### Theme values
```tsx
<Box sx={{
  color: 'primary.main',
  bgcolor: 'background.paper',
  borderColor: 'divider',
  borderRadius: 1, // 8px (theme.shape.borderRadius)
}}>
```

## 6. Theme Toggle

```tsx
// Sử dụng hook để toggle theme
import { useThemeMode } from '@/theme/useThemeMode'

function ThemeToggleButton() {
  const { mode, toggleTheme } = useThemeMode()
  
  return (
    <IconButton onClick={toggleTheme}>
      {mode === 'light' ? <DarkMode /> : <LightMode />}
    </IconButton>
  )
}
```

## 7. Form với React Hook Form

```tsx
// shadcn/ui Form
import { Form, FormField, FormControl } from "@/components/ui/form"
import { Input } from "@/components/ui/input"

<Form {...form}>
  <FormField
    control={form.control}
    name="email"
    render={({ field }) => (
      <FormControl>
        <Input {...field} />
      </FormControl>
    )}
  />
</Form>

// MUI với React Hook Form
import { TextField } from "@mui/material"
import { Controller } from "react-hook-form"

<form>
  <Controller
    name="email"
    control={form.control}
    render={({ field, fieldState: { error } }) => (
      <TextField
        {...field}
        error={!!error}
        helperText={error?.message}
        fullWidth
      />
    )}
  />
</form>
```

## 8. Toast / Notifications

Dự án đang dùng `sonner` cho toast, có thể tiếp tục sử dụng hoặc chuyển sang MUI Snackbar:

```tsx
// sonner (hiện tại)
import { toast } from "sonner"
toast.success("Success!")

// MUI Snackbar
import { Snackbar, Alert } from "@mui/material"
const [open, setOpen] = useState(false)
<Snackbar open={open} autoHideDuration={6000} onClose={() => setOpen(false)}>
  <Alert severity="success">Success!</Alert>
</Snackbar>
```

## 9. Migration Strategy

### Giai đoạn 1: Chuẩn bị
- [x] Cài đặt MUI packages
- [x] Tạo theme configuration
- [x] Setup ThemeProvider
- [ ] Tạo danh sách components cần migrate

### Giai đoạn 2: Migration từng module
1. **Auth pages** (login, register)
2. **Chat components**
3. **Friends components**
4. **Settings & Profile**
5. **Notifications**

### Giai đoạn 3: Cleanup
- Xóa shadcn/ui components không dùng
- Xóa Radix UI dependencies (nếu không cần)
- Xóa Tailwind config (nếu chuyển hoàn toàn sang MUI)

## 10. Tips & Best Practices

1. **Không cần xóa Tailwind ngay lập tức** - Có thể dùng song song
2. **Sử dụng TypeScript** - MUI có type definitions tốt
3. **Tận dụng theme system** - Dùng theme colors thay vì hardcode
4. **Responsive design** - Dùng sx prop với breakpoints
5. **Accessibility** - MUI components đã tích hợp ARIA attributes

## 11. Common Pitfalls

1. **Import paths**: MUI dùng `@mui/material` không phải `@/components/ui`
2. **Event handlers**: `onOpenChange` → `onClose`, `onChange`
3. **Variant names**: `default` → `contained`, `outline` → `outlined`
4. **Styling**: className (Tailwind) → sx prop (MUI)
5. **Form state**: shadcn Form → Controller từ react-hook-form

## 12. Resources

- [MUI Documentation](https://mui.com/material-ui/getting-started/)
- [MUI Components](https://mui.com/material-ui/all-components/)
- [MUI Icons](https://mui.com/material-ui/material-icons/)
- [Emotion Styling](https://emotion.sh/docs/introduction)
