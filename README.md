# Dealio - Modern Restaurant POS System

A powerful, configurable Point of Sale (POS) system built with Tauri 2 and React 19, designed for restaurants and various retail businesses. Dealio combines the performance of a native desktop application with the flexibility of modern web technologies to deliver a seamless POS experience.

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
- **React 19** - Latest React with modern hooks and patterns
- **TypeScript** - Type-safe development with enhanced developer experience
- **Vite 7** - Ultra-fast build tool and development server
- **Tailwind CSS 4** - Utility-first CSS framework with JIT compilation
- **Radix UI** - Unstyled, accessible UI primitives
- **React Router 7** - Client-side routing with data loading
- **React Hook Form** - Performant form handling with validation
- **Zod 4** - TypeScript-first schema validation

### Backend & Desktop
- **Tauri 2** - Secure, lightweight cross-platform desktop framework
- **Rust** - Safe, concurrent backend logic and system integration
- **Better Auth** - Secure authentication system with Tauri integration
- **Tauri Plugins** - Deep system integration (FS, HID, Printer, Barcode, etc.)

### State Management & Data
- **Zustand 4** - Simple, fast state management
- **TanStack Query 5** - Powerful async state management
- **Legend State** - Fine-grained reactive state management
- **Axios** - Feature-rich HTTP client with Tauri adapter

### Additional Libraries
- **React PDF** - PDF generation for receipts and invoices
- **Recharts 3** - Responsive data visualization components
- **Date-fns 4** - Modern JavaScript date utility library
- **Lucide React** - Beautiful, consistent icon set
- **Sonner 2** - Smooth, stackable toast notifications
- **QR Code** - QR code generation for payments and links
- **Framer Motion** - Animation library for smooth UI transitions

## 📦 Installation

### Prerequisites
- **Node.js** (v18 or higher)
- **Bun** (v1.0 or higher, recommended) or **npm**/**pnpm**
- **Rust** (v1.77.2 or higher for Tauri development)
- **Git**
- **OS-specific build tools**:
  - **Windows**: Microsoft Visual C++ Build Tools
  - **macOS**: Xcode Command Line Tools
  - **Linux**: Development packages (build-essential, libwebkit2gtk, etc.)

### Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/dealio.git
   cd dealio
   ```

2. **Install dependencies**
   ```bash
   # Using Bun (recommended)
   bun install
   
   # Or using npm
   npm install
   ```

3. **Start development server**
   ```bash
   # Using Bun
   bun run dev
   
   # Using npm
   npm run dev
   ```
   This will start both the Vite development server and open the Tauri application window.

4. **Build for production**
   ```bash
   # Using Bun
   bun run build
   
   # Using npm
   npm run build
   ```

5. **Create desktop executable**
   ```bash
   # Using Bun
   bun run create:executable
   
   # Using npm
   npm run create:executable
   ```
   This will create platform-specific executables in the `src-tauri/target/release` directory.

## 🚀 Usage

### Development Mode
```bash
# Start the development server
bun run dev

# The app will open in your default browser at http://localhost:5173
# Tauri will automatically open the desktop window with hot-reload enabled
```

During development, you can make changes to both the React frontend and Rust backend code. The application will automatically reload to reflect your changes.

### Production Build
```bash
# Build the web application and Tauri desktop app
bun run build

# Create platform-specific desktop executable
bun run create:executable
```

The production build creates optimized assets and a standalone desktop application that can be distributed to users.

### Available Scripts
- `bun run dev` - Start development server with hot-reload
- `bun run build` - Build optimized production assets
- `bun run preview` - Preview production build locally
- `bun run lint` - Run ESLint to check code quality
- `bun run tauri` - Run Tauri CLI commands
- `bun run create:executable` - Create platform-specific desktop executable
- `bun run start` - Start the Vite server

## 🏗 Project Structure

```
dealio/
├── src/                    # React application source
│   ├── api/                # API service integration
│   ├── components/         # Reusable UI components
│   │   ├── pos/            # POS-specific components
│   │   └── ui/             # General UI components
│   ├── data/               # Mock and sample data
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility libraries and services
│   │   └── services/       # Service implementations
│   ├── pages/              # Application pages/routes
│   ├── providers/          # Context providers
│   ├── store/              # State management (Zustand)
│   └── types/              # TypeScript type definitions
├── src-tauri/              # Tauri desktop app configuration
│   ├── capabilities/       # Tauri capability configurations
│   ├── icons/              # Application icons
│   ├── src/                # Rust backend code
│   ├── Cargo.toml          # Rust dependencies
│   └── tauri.conf.json     # Tauri configuration
├── public/                 # Static assets
│   └── images/             # Image assets
├── .env                    # Environment variables
├── components.json         # UI component configuration
├── package.json            # Node.js dependencies
├── tsconfig.json           # TypeScript configuration
└── vite.config.ts          # Vite configuration
```

## 🔧 Configuration

### Business Configuration
Dealio is designed to be highly configurable for different business types:

- **Restaurant/Cafe**: Table management, kitchen orders, split bills
- **Bookshop**: ISBN scanning, inventory management
- **Hardware Store**: Product categorization, bulk pricing
- **Supermarket**: Fast checkout, weight-based products
- **Pharmacy**: Prescription tracking, customer profiles
- **Electronics Store**: Serial number tracking, warranty management
- **Clothing Store**: Size/color variants, seasonal inventory
- **Retail Store**: General retail operations

### Customization Options
- **Business Settings**: Modify `src/lib/business-config-manager.ts` for business-specific configurations
- **Desktop App**: Update `src-tauri/tauri.conf.json` for desktop application settings
- **UI Theming**: Customize appearance in `src/index.css` with Tailwind CSS
- **Localization**: Support for multiple languages and currencies
- **Payment Methods**: Configure various payment processors and methods

## 🔐 Authentication & Security

Dealio uses Better Auth with Tauri integration for enterprise-grade security:

- **Secure Authentication**: Local authentication with optional cloud sync
- **Role-based Access**: Configurable permissions for staff, managers, and admins
- **Session Management**: Secure session handling with automatic timeouts
- **Encrypted Storage**: Sensitive data stored using Tauri's encrypted store
- **Audit Logging**: Track all system actions for accountability
- **Offline Support**: Authentication works even without internet connection

## 📱 Desktop & Hardware Integration

### System Integration
- **Auto-start**: Configure to launch automatically with system boot using `@tauri-apps/plugin-autostart`
- **Deep Linking**: Handle custom URL schemes with `@tauri-apps/plugin-deep-link`
- **File System Access**: Secure read/write to local files with `@tauri-apps/plugin-fs`
- **Clipboard Management**: Copy/paste functionality with `@tauri-apps/plugin-clipboard-manager`
- **Notifications**: Native system notifications with `@tauri-apps/plugin-notification`
- **Printing**: Direct printer access with `tauri-plugin-printer-v2`
- **Updates**: Automatic updates with `@tauri-apps/plugin-updater`

### Hardware Support
- **Barcode Scanners**: USB and Bluetooth scanner integration with `@tauri-apps/plugin-barcode-scanner`
- **HID Devices**: Support for Human Interface Devices with `@redfernelec/tauri-plugin-hid-api`
- **Receipt Printers**: Thermal printer integration for receipts and kitchen orders
- **Cash Drawers**: Serial/USB cash drawer control
- **Payment Terminals**: Integration with external payment devices
- **Touch Screens**: Optimized interface for touch screen operation
- **Customer Displays**: Secondary display support for customer-facing information

## 🧪 Testing & Quality Assurance

```bash
# Run ESLint for code quality checks
bun run lint

# Run TypeScript type checking
bun tsc --noEmit
```

Dealio follows best practices for code quality and testing:
- **ESLint**: Enforces code style and quality standards
- **TypeScript**: Static type checking prevents common errors
- **Component Testing**: UI components are tested for functionality
- **End-to-End Testing**: Critical user flows are validated

## 📄 License

MIT License

Copyright (c) 2023-2025 Dealio Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

## 🤝 Contributing

We welcome contributions from the community! Here's how to get started:

1. **Fork the repository** on GitHub
2. **Clone your fork** to your local machine
3. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
4. **Make your changes** following our coding standards
5. **Run tests** to ensure quality
6. **Commit your changes** with descriptive messages
7. **Push to your branch** (`git push origin feature/amazing-feature`)
8. **Open a Pull Request** with a detailed description

Please read our [Contributing Guidelines](CONTRIBUTING.md) for more details.

## 📞 Support & Community

For support and questions:
- **GitHub Issues**: Create an issue for bug reports or feature requests
- **Documentation**: Check our [Wiki](https://github.com/larrybwosi/dealio/wiki) for guides
- **Discussions**: Join our community discussions on GitHub
- **Email**: Contact the development team at support@dealio.example.com

---

<p align="center"><strong>Dealio</strong> - Empowering businesses with modern point-of-sale technology</p>
