# Supabase Integration Setup

This is a sample Next.js application demonstrating Supabase integration for a coding terms dictionary.

## Quick Start

### 1. Clone and Install
```bash
npm install
```

### 2. Set Up Supabase
1. Create a new project at [Supabase](https://supabase.com)
2. Copy `.env.example` to `.env.local`
3. Update `.env.local` with your Supabase URL and anon key

### 3. Create Database Schema
In your Supabase SQL Editor, run:
```sql
-- Copy and paste the entire contents of supabase/schema.sql
```

### 4. Populate Database
```bash
npm run migrate
```

### 5. Run the App
```bash
npm run dev
```

## Features Demonstrated

- **Database Operations**: CRUD operations with Supabase
- **TypeScript Integration**: Type-safe database interactions
- **Search Functionality**: Full-text search with PostgreSQL
- **Row Level Security**: Secure data access policies
- **Real-time Ready**: Foundation for real-time features

## Project Structure

```
├── lib/
│   ├── supabase.ts        # Supabase client configuration
│   └── database.ts        # Database service layer
├── types/
│   ├── term.ts           # TypeScript types
│   └── database.ts       # Supabase database types
├── supabase/
│   └── schema.sql        # Database schema and policies
└── scripts/
    └── migrate-data.ts   # Data migration script
```

## Database Schema

- **categories**: Term categories with metadata
- **terms**: Coding terms with descriptions, examples, and relationships

## Next Steps

Extend this foundation with:
- User authentication (Supabase Auth)
- User-generated content
- Real-time subscriptions
- File uploads with Supabase Storage