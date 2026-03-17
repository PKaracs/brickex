# PostHog post-wizard report

The wizard has completed a deep integration of your project. PostHog was already installed (`posthog-js` and `posthog-node`) with a solid foundation in place. The integration focused on filling gaps: fixing the reverse proxy configuration, adding user identification at authentication, instrumenting server-side video generation events, and adding client-side engagement tracking for the Explore and Gallery pages.

**Key changes made:**
- Fixed `instrumentation-client.ts` to route events through the `/ingest` reverse proxy (was bypassing it)
- Added `NEXT_PUBLIC_POSTHOG_KEY` and `NEXT_PUBLIC_POSTHOG_HOST` to `.env.local`
- Created `lib/posthog-server.ts` — singleton PostHog Node client for server-side API routes
- Added `posthog.identify()` + login/signup events in both auth forms
- Instrumented the video generation API route with started/completed/failed events
- Added explore engagement and gallery download/delete events

| Event Name | Description | File |
|---|---|---|
| `login_success` | User successfully signed in | `components/auth/login-form.tsx` |
| `login_failed` | Sign-in attempt failed | `components/auth/login-form.tsx` |
| `signup_success` | New user registered | `components/auth/register-form.tsx` |
| `signup_failed` | Registration attempt failed | `components/auth/register-form.tsx` |
| `video_generation_started` | Video generation job submitted (with duration, cost, preset) | `app/api/video/generate/route.ts` |
| `video_generation_completed` | Video generation finished successfully | `app/api/video/generate/route.ts` |
| `video_generation_failed` | Video generation errored out | `app/api/video/generate/route.ts` |
| `explore_category_changed` | User switched category filter in Explore | `app/app/explore/explore-client.tsx` |
| `explore_image_clicked` | User clicked an image in Explore feed | `app/app/explore/explore-client.tsx` |
| `gallery_image_downloaded` | User downloaded an image from their gallery | `app/app/gallery/gallery-client.tsx` |
| `gallery_image_deleted` | User deleted an image from their gallery | `app/app/gallery/gallery-client.tsx` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- **Dashboard — Analytics basics:** https://us.posthog.com/project/346657/dashboard/1371303
- **Auth: Logins & Signups Over Time:** https://us.posthog.com/project/346657/insights/qyuDyApw
- **Conversion Funnel: Signup → Checkout → Purchase:** https://us.posthog.com/project/346657/insights/XsS7av3s
- **Checkout & Generation Activity:** https://us.posthog.com/project/346657/insights/NyjLvzoR
- **Video Generation: Started vs Completed vs Failed:** https://us.posthog.com/project/346657/insights/yvxVYWhL
- **Explore Engagement: Category Filters & Image Clicks:** https://us.posthog.com/project/346657/insights/uYde26Ws

### Agent skill

We've left an agent skill folder in your project. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.
