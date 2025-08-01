# Dealio - Restaurant POS System

A modern, configurable Point of Sale (POS) system built with Tauri and React, designed for restaurants and retail businesses.

## 🚀 Features

### Core POS Features
- **Multi-business Support**: Configure for restaurants, cafes, bookshops, hardware stores, supermarkets, pharmacies, electronics, clothing, and retail
- **Order Management**: Handle dine-in, takeaway, and delivery orders
- **Cart Management**: Add, remove, and modify items with real-time calculations
- **Customer Management**: Track customer information and order history
- **Payment Processing**: Multiple payment methods with receipt generation
- **Table Management**: Assign orders to specific tables
- **Tax & Discount Support**: Automatic tax calculations and discount applications

### Advanced Features
- **Barcode Scanning**: Scan products for quick entry
- **Receipt Printing**: Print receipts using connected printers
- **QR Code Generation**: Generate QR codes for payments
- **Real-time Updates**: Live order queue management
- **Inventory Tracking**: Monitor product stock levels
- **Sales Analytics**: View sales reports and analytics
- **Multi-language Support**: Internationalization ready

### Desktop App Features
- **Cross-platform**: Windows, macOS, and Linux support
- **Offline Capability**: Works without internet connection
- **Auto-start**: Configure to start with system boot
- **Deep Linking**: Handle external URLs and protocols
- **System Integration**: Native OS integration

## 🛠 Technology Stack

### Frontend
- **React 18** - Modern React with hooks
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Beautiful, accessible UI components
- **React Router** - Client-side routing
- **React Hook Form** - Form handling with validation
- **Zod** - Schema validation

### Backend & Desktop
- **Tauri 2** - Cross-platform desktop app framework
- **Rust** - Backend logic and system integration
- **Better Auth** - Authentication system
- **SQLite** - Local database storage

### State Management & Data
- **Zustand** - Lightweight state management
- **TanStack Query** - Server state management
- **Legend State** - Reactive state management
- **Axios** - HTTP client

### Additional Libraries
- **React PDF** - PDF generation for receipts
- **Recharts** - Data visualization
- **Date-fns** - Date manipulation
- **Lucide React** - Icon library
- **Sonner** - Toast notifications

## 📦 Installation

### Prerequisites
- **Node.js** (v18 or higher)
- **Bun** (recommended) or **npm**/**pnpm**
- **Rust** (for Tauri development)
- **Git**

### Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd restaurant-pos
   ```

2. **Install dependencies**
   ```bash
   bun install
   ```

3. **Start development server**
   ```bash
   bun run dev
   ```

4. **Build for production**
   ```bash
   bun run build
   ```

5. **Create desktop executable**
   ```bash
   bun run create:executable
   ```

## 🚀 Usage

### Development Mode
```bash
# Start the development server
bun run dev

# The app will open in your default browser at http://localhost:5173
# Tauri will automatically open the desktop window
```

### Production Build
```bash
# Build the web application
bun run build

# Create desktop executable
bun run create:executable
```

### Available Scripts
- `bun run dev` - Start development server
- `bun run build` - Build for production
- `bun run preview` - Preview production build
- `bun run lint` - Run ESLint
- `bun run create:executable` - Create desktop executable

## 🏗 Project Structure

```
restaurant-pos/
├── src/                    # React application source
│   ├── components/         # Reusable UI components
│   ├── pages/             # Application pages
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utility libraries
│   ├── providers/         # Context providers
│   ├── store/             # State management
│   ├── types/             # TypeScript type definitions
│   └── api/               # API integration
├── src-tauri/             # Tauri desktop app configuration
│   ├── src/               # Rust backend code
│   ├── Cargo.toml         # Rust dependencies
│   └── tauri.conf.json    # Tauri configuration
├── public/                # Static assets
└── dist/                  # Production build output
```

## 🔧 Configuration

### Business Configuration
The system supports multiple business types with configurable settings:
- Restaurant/Cafe
- Bookshop
- Hardware Store
- Supermarket
- Pharmacy
- Electronics Store
- Clothing Store
- Retail Store

### Customization
- Modify `src/lib/business-config-manager.ts` for business-specific settings
- Update `src-tauri/tauri.conf.json` for desktop app configuration
- Customize UI themes in `src/index.css`

## 🔐 Authentication

The application uses Better Auth with Tauri integration for secure authentication:
- Local authentication system
- Session management
- Role-based access control
- Secure storage with Tauri's encrypted store

## 📱 Desktop Features

### System Integration
- **Auto-start**: Configure to launch with system boot
- **Deep linking**: Handle custom URL schemes
- **File system access**: Read/write local files
- **Clipboard management**: Copy/paste functionality
- **Notifications**: System notifications
- **Printing**: Direct printer access

### Hardware Support
- **Barcode scanners**: USB and Bluetooth support
- **Receipt printers**: Thermal printer integration
- **Cash drawers**: Serial/USB cash drawer control
- **Payment terminals**: External payment device integration

## 🧪 Testing

```bash
# Run linting
bun run lint

# Type checking
bun run type-check
```

## 📄 License

[Add your license information here]

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Contact the development team

---

**Dealio** - Modern POS for modern businesses
