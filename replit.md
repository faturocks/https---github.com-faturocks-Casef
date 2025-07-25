# Los Santos Penal Code Desktop Application

## Overview

This is an Electron-based desktop application for the Los Santos Penal Code reference system. It provides an interactive legal reference tool for citizens and law enforcement, featuring a comprehensive database of penal codes, fine/jail time calculator, bookmarking system, and PDF export capabilities. The application combines a web-based frontend with native desktop functionality through Electron.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

The application follows a hybrid web-desktop architecture using Electron as the main framework. It combines modern web technologies (HTML, CSS, JavaScript) with native desktop capabilities through Node.js backend services.

### Frontend Architecture
- **Framework**: Pure JavaScript with Electron renderer process
- **UI Framework**: Tailwind CSS for styling with custom CSS variables for theming
- **Font**: Inter font family for consistent typography
- **Icons**: Feather Icons and inline SVG icons
- **Charts**: Chart.js for calculator visualizations
- **Theme System**: CSS custom properties with light/dark mode support

### Backend Architecture
- **Runtime**: Electron main process with Node.js
- **Database**: Better SQLite3 for local data storage
- **PDF Generation**: Puppeteer-core for creating PDF reports
- **IPC**: Electron's Inter-Process Communication for frontend-backend communication

## Key Components

### 1. Main Application (main.js)
- Electron main process controller
- Window management and application lifecycle
- Database initialization and management
- PDF generation services
- Menu system and keyboard shortcuts

### 2. Database Layer (database/db.js)
- SQLite database with Better SQLite3
- Tables: articles, sections, bookmarks, calculations
- Multi-language support (English/Indonesian)
- CRUD operations for all data types

### 3. Frontend Modules
- **App Manager** (js/app.js): Core application initialization and coordination
- **Search Manager** (js/search.js): Advanced search with filtering and highlighting
- **Language Manager** (js/language.js): Multi-language support (EN/ID)
- **Theme Manager** (js/theme.js): Light/dark theme switching with system preference detection
- **TOC Manager** (js/toc.js): Table of contents navigation and rendering

### 4. Feature Components
- **Calculator** (src/calculator/): Fine and jail time calculator with complex punishment parsing
- **Bookmarks** (src/bookmarks/): Article bookmarking system with notes
- **PDF Export** (src/export/): PDF generation with multiple report templates
- **Utilities** (src/utils/): Clipboard operations, punishment parsing, and helper functions

### 5. Security Layer (preload.js)
- Context isolation for secure IPC communication
- Exposed APIs for database operations, file operations, and system integration
- Platform detection and feature availability

## Data Flow

1. **Application Startup**:
   - Main process initializes database and core services
   - Renderer process loads UI and connects to backend via IPC
   - Penal code data is loaded from JSON files and cached in database

2. **User Interactions**:
   - Search queries are processed locally with real-time filtering
   - Calculator operations aggregate selected articles and compute totals
   - Bookmarks are stored in SQLite database with sync capabilities
   - Theme/language changes are persisted to localStorage and database

3. **Data Persistence**:
   - User preferences (theme, language) stored in localStorage
   - Bookmarks and calculation history stored in SQLite database
   - PDF exports generated on-demand and saved to user-selected locations

## External Dependencies

### Production Dependencies
- **Electron** (^37.2.4): Desktop application framework
- **Better SQLite3** (^12.2.0): Fast, synchronous SQLite database
- **Electron Builder** (^26.0.12): Application packaging and distribution
- **Puppeteer Core** (^24.15.0): Headless browser for PDF generation

### CDN Dependencies
- **Tailwind CSS** (2.2.19): Utility-first CSS framework
- **Google Fonts**: Inter font family
- **Feather Icons**: Icon library
- **Chart.js**: Charting library for visualizations

### Development Tools
- **NSIS**: Windows installer generation
- **Service Worker**: Offline functionality for web fallback

## Deployment Strategy

### Desktop Distribution
- **Windows**: NSIS installer with auto-updater support
- **Cross-platform**: Electron Builder handles packaging for multiple platforms
- **Auto-updates**: Built-in update mechanism through Electron Builder

### Database Management
- SQLite database file stored in user data directory
- Automatic schema migration and data initialization
- Backup and restore capabilities through export/import features

### Asset Management
- Local asset bundling for offline operation
- Optimized loading with preloader and lazy loading
- Font and icon preloading for performance

### Security Considerations
- Context isolation enabled for secure IPC
- No remote content loading in production
- Sandboxed renderer processes
- CSP headers for additional security

The application is designed to work both as a standalone desktop application and potentially as a web application, with graceful degradation of features based on the runtime environment.