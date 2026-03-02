# OpenKiosk

A comprehensive retail kiosk application built with React Native and Electron, designed for modern retail environments with seamless e-commerce platform integration.

## 🎯 Project Purpose

OpenKiosk is a full-featured retail kiosk solution that transforms traditional point-of-sale systems into interactive, self-service shopping experiences. The application enables customers to browse products, customize orders, and complete transactions independently while providing retailers with powerful management and analytics capabilities.

### Key Features

- **🛍️ Interactive Product Browsing**: Intuitive category navigation with subcategory support
- **⚙️ Product Customization**: Dynamic variant selection (size, color, storage, etc.)
- **💳 Integrated Payments**: Support for multiple payment processors with PED integration
- **🌐 Multi-Platform Support**: WooCommerce, Shopify, Magento, and more
- **🖥️ Cross-Platform Deployment**: Mobile, Web, and Desktop (Electron)
- **🎨 Customizable Branding**: CMS-driven theming and splash screens
- **📊 Real-time Analytics**: Transaction tracking and reporting

## 🔗 Integration Capabilities

OpenKiosk seamlessly integrates with major e-commerce platforms and payment processors, providing a unified retail experience across different backend systems.

### E-Commerce Platform Integration

#### WooCommerce

- **Catalog Sync**: Real-time product, category, and inventory synchronization
- **Order Management**: Direct order creation and status tracking
- **Customer Data**: Guest checkout with optional account integration
- **Webhook Support**: Real-time inventory and order updates

#### Shopify

- **GraphQL API**: Efficient product queries and mutations
- **Storefront API**: Public catalog access with checkout capabilities
- **Admin API**: Order management and inventory control
- **App Integration**: Certified Shopify app with OAuth authentication

#### Magento

- **REST API**: Comprehensive catalog and order management
- **GraphQL**: Modern API for enhanced performance
- **Multi-store**: Support for multiple store views and websites
- **B2B Features**: Customer groups and pricing rules

### Payment Processor Integration

#### Square Terminal API

- **PED Integration**: Real-time card reading and PIN entry simulation
- **Terminal Management**: Connection status and battery monitoring
- **Transaction Processing**: EMV chip and contactless payment support
- **Receipt Generation**: Digital and printed receipt options

#### Adyen Terminal API

- **Global Coverage**: Support for international payment methods
- **Advanced Security**: PCI DSS compliance and encryption
- **Multi-method Support**: Cards, digital wallets, and local payment methods
- **Risk Management**: Real-time fraud detection and prevention

#### Stripe

- **Cloud Processing**: Secure payment processing without hardware
- **Digital Wallets**: Apple Pay, Google Pay integration
- **Subscription Support**: Recurring payment capabilities
- **Analytics**: Detailed transaction reporting

### Additional Integrations

#### CMS Integration

- **Dynamic Content**: Splash screens, branding, and promotional content
- **Multi-language**: Internationalization with i18next
- **Asset Management**: Image and media content delivery

#### Analytics & Reporting

- **Transaction Tracking**: Sales data and performance metrics
- **Customer Behavior**: Shopping patterns and preferences
- **Inventory Insights**: Product performance and stock levels

## 🚀 Technical Approach

### Architecture Overview

OpenKiosk follows a modular, service-oriented architecture designed for scalability, maintainability, and cross-platform compatibility.

#### Core Architecture Principles

- **Platform Abstraction**: Unified interfaces for different e-commerce platforms
- **Component Reusability**: Modular UI components with consistent theming
- **Type Safety**: Comprehensive TypeScript coverage for reliability
- **Performance Optimization**: Efficient rendering and data management

### Technology Stack

#### Frontend Framework

- **React Native**: Cross-platform mobile development
- **Expo**: Development platform with managed workflow
- **React Navigation**: Declarative navigation with nested routing

#### State Management

- **React Context**: Global state management for platform and basket
- **Custom Hooks**: Encapsulated business logic and API interactions
- **Local Storage**: Persistent data with MMKV for performance

#### UI/UX Framework

- **Custom Theme System**: Consistent styling with light/dark mode support
- **Responsive Design**: Adaptive layouts for different screen sizes
- **Accessibility**: Screen reader support and keyboard navigation
- **Internationalization**: Multi-language support with translation files

#### Backend Integration

##### Service Layer Architecture

```
Platform Services
├── CatalogService    # Product and category management
├── BasketService     # Shopping cart operations
├── CheckoutService   # Order creation and payment
├── PaymentService    # Payment processing
└── CmsService       # Content management
```

##### Platform Abstraction

Each e-commerce platform implements the same service interfaces, allowing seamless switching between WooCommerce, Shopify, Magento, etc.

#### Payment Processing

##### PED Integration

- **Terminal Simulation**: Realistic payment terminal behavior
- **Card Processing**: EMV chip, contactless, and magnetic stripe support
- **Security**: PCI DSS compliant transaction handling
- **Error Recovery**: Robust error handling with retry mechanisms

##### Transaction Flow

```
1. Card Detection → 2. Card Reading → 3. PIN Entry (if required) → 4. Authorization → 5. Receipt
```

#### Cross-Platform Deployment

##### Mobile (React Native)

- **iOS Support**: Native iOS compilation with Xcode
- **Android Support**: APK generation with Android Studio
- **Expo Go**: Rapid development and testing

##### Web (React Native Web)

- **Browser Compatibility**: Modern browser support with fallbacks
- **Progressive Web App**: Installable web application
- **Responsive Design**: Mobile and desktop web layouts

##### Desktop (Electron)

- **Native Performance**: Direct OS integration
- **File System Access**: Local data persistence and configuration
- **System Tray**: Background operation capabilities

### Development Workflow

#### Code Organization

```
src/
├── components/       # Reusable UI components
│   ├── common/      # Generic components (Button, Input, etc.)
│   ├── screens/     # Screen-specific components
│   └── index.ts     # Component exports
├── contexts/         # React Context providers
├── hooks/           # Custom React hooks
├── navigation/      # Navigation configuration
├── screens/         # Application screens
├── services/        # API and business logic
│   ├── interfaces/  # Service contracts
│   ├── implementations/  # Service implementations
│   └── payment/     # Payment processing
├── theme/           # Styling and theming
├── types/           # TypeScript definitions
└── utils/           # Utility functions
```

#### Development Tools

- **TypeScript**: Type-safe development with comprehensive interfaces
- **ESLint**: Code quality and consistency enforcement
- **Prettier**: Automatic code formatting
- **Jest**: Unit and integration testing
- **React DevTools**: Development debugging and profiling

#### Build Pipeline

- **Expo Build**: Managed build process for mobile platforms
- **Electron Builder**: Desktop application packaging
- **CI/CD**: Automated testing and deployment pipelines

### Performance Optimization

#### Rendering Performance

- **Memoization**: React.memo for expensive components
- **Virtualization**: FlatList for large product catalogs
- **Lazy Loading**: On-demand component and data loading

#### Data Management

- **Caching**: Intelligent caching of catalog and user data
- **Background Sync**: Offline capability with data synchronization
- **Optimistic Updates**: Immediate UI feedback for user actions

#### Bundle Optimization

- **Code Splitting**: Dynamic imports for route-based splitting
- **Asset Optimization**: Compressed images and optimized bundles
- **Tree Shaking**: Removal of unused code and dependencies

### Security Considerations

#### Data Protection

- **Encryption**: Sensitive data encryption at rest and in transit
- **Token Management**: Secure authentication token handling
- **PCI Compliance**: Payment data handling following PCI DSS standards

#### Platform Security

- **Input Validation**: Comprehensive input sanitization
- **API Security**: Secure API communication with authentication
- **Code Security**: Regular security audits and dependency updates

### Future Extensibility

#### Plugin Architecture

- **Service Extensions**: Custom service implementations
- **UI Extensions**: Pluggable UI components
- **Payment Extensions**: Additional payment processor support

#### API Evolution

- **Versioning**: Backward-compatible API evolution
- **Feature Flags**: Gradual feature rollout capabilities
- **Configuration Management**: Runtime configuration updates

This technical approach ensures OpenKiosk remains maintainable, scalable, and adaptable to evolving retail technology requirements while providing a superior user experience across all deployment platforms.

## Getting Started

### Prerequisites

- Node.js (v16+)
- Yarn or npm
- Expo CLI
- React Native development environment
- Electron (for desktop development)

### Installation

```bash
# Install dependencies
yarn install
```

### Running the Application

#### Mobile Development

```bash
# Start the Expo development server
yarn start

# Run on iOS simulator
yarn ios

# Run on Android device/emulator
yarn android
```

#### Web Development

```bash
# Start web version
yarn web
```

#### Desktop Development (Electron)

```bash
# Start Electron development (automatically starts web server)
yarn electron:dev
```

### Building for Production

#### Desktop (Electron)

```bash
# Build the desktop application
yarn electron:build
```

## Technologies

- React Native
- Expo
- React Navigation
- i18next for internationalization
- Electron for desktop platforms

## License

See the LICENSE file for details.

## Get in touch

- 🌐 **Website**: [N17](https://n17.foo)
- 📧 **Email**: [hello@n17.foo](mailto:hello@n17.foo)
