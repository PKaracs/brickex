This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Auth Rate Limiting

This project includes rate limiting for auth endpoints (using Supabase/Postgres) to prevent bot attacks, credential stuffing, and magic link spam.

### Setup

Run the migration to create the rate limiting tables:

```bash
npx drizzle-kit push
# or apply the migration manually: drizzle/0007_rate_limiting.sql
```

### Rate Limits

| Endpoint                      | Limit       | Window     |
| ----------------------------- | ----------- | ---------- |
| Magic link send (per IP)      | 5 requests  | 1 minute   |
| Magic link send (per email)   | 3 requests  | 15 minutes |
| Auth verify/callback (per IP) | 20 requests | 1 minute   |
| General auth (sign-in)        | 10 requests | 1 minute   |

**Challenge Mode:** After 3 failures in 10 minutes, an IP is blocked for 30 minutes.

### How it Works

- Rate limits are stored in the `rate_limits` table
- Failed auth attempts are tracked in the `auth_challenges` table
- Expired entries are automatically cleaned up
- Real users won't notice; bots get blocked

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
