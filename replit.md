# Investment Portfolio Dashboard

## Overview

This is a full-stack investment portfolio dashboard application built with React, TypeScript, Express, and PostgreSQL. The application provides real-time portfolio tracking, stock data analysis, and investment recommendations for Russian stocks using the Tinkoff API.

## System Architecture

The application follows a modern full-stack architecture with clear separation between client and server components:

- **Frontend**: React with TypeScript, built using Vite
- **Backend**: Express.js server with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **UI Framework**: shadcn/ui components with Tailwind CSS
- **State Management**: TanStack Query for server state management
- **External API**: Tinkoff API for real-time stock data

## Key Components

### Database Layer
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema**: Comprehensive database schema with tables for users, portfolios, stocks, and positions
- **Migration Strategy**: Uses drizzle-kit for database schema management
- **Connection**: Neon Database serverless connection for production scalability

### Backend Services
- **Express Server**: RESTful API with middleware for logging and error handling
- **Tinkoff API Integration**: Service layer for fetching real-time Russian stock data
- **Storage Layer**: Abstracted storage interface for database operations
- **Route Handlers**: Portfolio management, stock data retrieval, and data refresh endpoints

### Frontend Architecture
- **Component Structure**: Modular components using shadcn/ui design system
- **State Management**: TanStack Query for server state with optimistic updates
- **Routing**: Wouter for lightweight client-side routing
- **Charts**: Recharts library for portfolio visualization
- **Responsive Design**: Mobile-first approach with Tailwind CSS

### Key Features
- Real-time portfolio tracking with daily P&L calculations
- Interactive charts for portfolio performance and allocation
- Stock recommendation system with risk analysis
- News sentiment analysis integration
- Portfolio settings management (budget, risk profile)
- Data refresh capabilities with Tinkoff API integration

## Data Flow

1. **Client Requests**: Frontend makes API calls using TanStack Query
2. **Server Processing**: Express routes handle requests and interact with storage layer
3. **External Data**: Tinkoff API provides real-time stock prices and market data
4. **Database Operations**: Drizzle ORM manages PostgreSQL interactions
5. **Response Handling**: Structured JSON responses with error handling
6. **UI Updates**: Optimistic updates and cache invalidation for smooth UX

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL connection for serverless environments
- **drizzle-orm**: Type-safe database operations
- **@tanstack/react-query**: Server state management
- **recharts**: Chart visualization library
- **wouter**: Lightweight routing library

### UI Components
- **@radix-ui/***: Headless UI components for accessibility
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Type-safe component variants
- **lucide-react**: Icon library

### Development Tools
- **vite**: Fast build tool and dev server
- **tsx**: TypeScript execution for development
- **esbuild**: Production bundling for server code

## Deployment Strategy

### Development Environment
- **Runtime**: Node.js 20 with hot reload
- **Database**: PostgreSQL 16 module
- **Port Configuration**: Server runs on port 5000 with external port 80
- **Build Process**: Vite for client, esbuild for server bundling

### Production Deployment
- **Target**: Replit autoscale deployment
- **Build Command**: `npm run build` (builds both client and server)
- **Start Command**: `npm run start` (runs production server)
- **Static Assets**: Client built to `dist/public`, served by Express

### Database Management
- **Schema Push**: `npm run db:push` for schema updates
- **Migrations**: Generated in `./migrations` directory
- **Environment**: Requires `DATABASE_URL` environment variable

## Changelog

```
Changelog:
- June 20, 2025. Initial setup
- June 20, 2025. Интеграция API Тинькофф Инвестиции
  - Подключен реальный API токен для получения актуальных данных
  - Добавлен полнофункциональный дашборд с российскими акциями
  - Реализованы интерактивные графики и аналитика портфеля
  - Добавлены рекомендации и анализ рисков
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```