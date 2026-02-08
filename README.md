# Dance & Arts UK 🚀

Dance & Arts UK is a comprehensive management system for extracurricular clubs, teacher scheduling, and cover management. Built with a modern, high-performance tech stack, it provides zero-visibility solutions for teacher availability, schedule conflicts, and communication bottlenecks.

## ✨ Key Features

- **Teacher Cover Management**: Seamlessly track and manage teacher substitutions (`src/features/covers`).
- **Club Scheduling**: Efficient organization and conflict-free scheduling for extracurricular activities (`src/features/clubs`).
- **Broadcast System**: Integrated messaging and notification system for real-time updates (`src/features/broadcast`).
- **Teacher Database**: Comprehensive management of teacher profiles and 
- **Secure Authentication**: Robust user management backed by Supabase Auth (`src/features/auth`).

## 🛠️ Tech Stack

- **Framework**: [TanStack Start](https://tanstack.com/start) (Full-stack React)
- **Routing**: [TanStack Router](https://tanstack.com/router) (Type-safe file-based routing)
- **Database & Auth**: [Supabase](https://supabase.com/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Hugeicons](https://hugeicons.com/) (Premium, modern visual system)
- **UI Components**: [Shadcn UI](https://ui.shadcn.com/)
- **State Management**: [TanStack Store](https://tanstack.com/store/latest) & [TanStack Query](https://tanstack.com/query)
- **AI Integration**: [Anthropic Claude 3.5 Sonnet](https://www.anthropic.com/claude)

## 📂 Project Structure

The project follows a modular, feature-based architecture:

```text
src/
├── components/          # Reusable UI components
│   ├── ui/              # Base primitive components (shadcn)
│   └── common/          # Shared application-level components
├── features/            # Domain-driven modules
│   ├── auth/            # Authentication and session management
│   ├── broadcast/       # Communication and messaging
│   ├── clubs/           # Club management and scheduling
│   ├── covers/          # Teacher cover and substitution tracking
│   ├── dashboard/       # Dashboard views and stats
│   └── teachers/        # Teacher profiles and availability
├── routes/              # File-based routing (TanStack Router)
├── hooks/               # Global custom React hooks
├── services/            # Business logic and external API services
├── integrations/        # Third-party configurations (Supabase, Resend)
├── lib/                 # Utility functions and shared helpers
├── types/               # Global TypeScript type definitions
└── styles.css           # Global Tailwind CSS entry point
```

## 🚀 Getting Started

### Prerequisites

- Node.js (Latest LTS)
- pnpm (Recommended)

### Installation

```bash
pnpm install
```

### Development

```bash
pnpm dev
```

The application will be available at `http://localhost:3000`.

### Building for Production

```bash
pnpm build
```

### Testing

```bash
pnpm test
```

## 🎨 Styling & Icons

- **Tailwind CSS**: We use the latest Tailwind CSS v4 for styling. Configurations can be found in `src/styles.css` and `vite.config.ts`.
- **Hugeicons**: All icons in the project use the `hugeicons` library for a sleek, consistent, and premium look. 
  - Usage Example:
    ```tsx
    import { Calendar01Icon } from '@hugeicons/react';
    // ...
    <Calendar01Icon className="size-5" />
    ```

## 🔐 Environment Variables

Ensure you have a `.env.local` file with the following keys:

```env
ANTHROPIC_API_KEY=your_key
VITE_SUPABASE_URL=your_url
VITE_SUPABASE_ANON_KEY=your_key
```

## 📖 Documentation

- [TanStack Router Docs](https://tanstack.com/router/latest/docs/framework/react/overview)
- [TanStack Start Docs](https://tanstack.com/start/latest/docs/framework/react/overview)
- [Hugeicons Documentation](https://hugeicons.com/docs)
- [Supabase Documentation](https://supabase.com/docs)

---

Built with ❤️ by the ClubConnect UK Team.
