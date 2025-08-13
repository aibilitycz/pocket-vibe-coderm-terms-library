# Pocket Vibe Coder Terms - Supabase Integration

A sample Next.js application demonstrating Supabase integration for a coding terms dictionary.

## Features

- **Full-stack TypeScript**: Next.js 15 with TypeScript
- **Supabase Integration**: Database operations, Row Level Security
- **Modern UI**: Tailwind CSS with Shadcn/ui components  
- **Search & Filter**: Full-text search with multiple filters
- **Clean Architecture**: Proper separation of concerns

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Supabase
1. Create a new project at [Supabase](https://supabase.com)
2. Copy `.env.example` to `.env.local`
3. Update `.env.local` with your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 3. Create Database Schema
In your Supabase SQL Editor, run the schema from `supabase/schema.sql`

### 4. Populate Database
```bash
npm run migrate
```

### 5. Run the Application
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Architecture

```
├── app/page.tsx           # Main application page
├── components/            # Reusable UI components
├── lib/
│   ├── supabase.ts       # Supabase client configuration
│   └── database.ts       # Database service layer
├── types/                # TypeScript type definitions
├── supabase/schema.sql   # Database schema
└── scripts/migrate-data.ts # Data migration
```

## Database Schema

- **categories**: Term categories with metadata
- **terms**: Coding terms with descriptions, examples, and relationships
- **Row Level Security**: Public read access, controlled write access
- **Full-text Search**: PostgreSQL search capabilities

## Key Technologies

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety
- **Supabase** - Backend-as-a-Service
- **Tailwind CSS** - Utility-first CSS
- **Shadcn/ui** - Modern component library

## Development

This is a clean sample application showing best practices for:
- Supabase integration in Next.js
- Type-safe database operations
- Modern React patterns
- Clean project structure

Perfect as a starting point for building more complex applications with user authentication, real-time features, and advanced database operations.
