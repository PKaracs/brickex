export default function CapstoneFiguresPage() {
  return (
    <div className="min-h-screen bg-black text-white p-8 space-y-24">
      {/* FIGURE 2: Garrett's Five-Plane Model */}
      <section className="max-w-4xl mx-auto">
        <p className="text-xs text-zinc-500 mb-4 font-mono">FIGURE 2</p>
        <GarrettFivePlanes />
        <p className="text-xs text-zinc-500 mt-4 text-center italic max-w-2xl mx-auto">
          Garrett&apos;s five-plane model applied to BrickEx. Each plane
          constrains the one above it: strategic decisions about target users
          and business model determine which features are included (scope),
          which in turn determine how the workflow is organized (structure), how
          the interface is laid out (skeleton), and how it looks and feels
          (surface).
        </p>
      </section>

      {/* FIGURE 3: System Architecture */}
      <section className="max-w-5xl mx-auto">
        <p className="text-xs text-zinc-500 mb-4 font-mono">FIGURE 3</p>
        <SystemArchitecture />
        <p className="text-xs text-zinc-500 mt-4 text-center italic max-w-2xl mx-auto">
          BrickEx system architecture. The frontend communicates with server
          actions that orchestrate AI providers, manage storage, and emit
          analytics events. Every layer is instrumented for behavioral
          measurement.
        </p>
      </section>

      {/* FIGURE 13: AI Generation Pipeline */}
      <section className="max-w-5xl mx-auto">
        <p className="text-xs text-zinc-500 mb-4 font-mono">FIGURE 13</p>
        <GenerationPipeline />
        <p className="text-xs text-zinc-500 mt-4 text-center italic max-w-2xl mx-auto">
          BrickEx&apos;s two-stage generation pipeline. GPT-5-mini analyzes the
          source image and compiles a detailed architectural prompt from
          structured settings. The enhanced prompt and reference image are sent
          to Gemini for generation, with automatic retry and model fallback.
        </p>
      </section>

      {/* FIGURE 14: PostHog Event Map */}
      <section className="max-w-5xl mx-auto">
        <p className="text-xs text-zinc-500 mb-4 font-mono">FIGURE 14</p>
        <PostHogEventMap />
        <p className="text-xs text-zinc-500 mt-4 text-center italic max-w-2xl mx-auto">
          PostHog event instrumentation across the user lifecycle. Over sixty
          events provide granular behavioral telemetry for funnel analysis,
          drop-off diagnostics, and future A/B testing.
        </p>
      </section>

      {/* FIGURE 18: User Journey Flowchart */}
      <section className="max-w-5xl mx-auto">
        <p className="text-xs text-zinc-500 mb-4 font-mono">FIGURE 18</p>
        <UserJourney />
        <p className="text-xs text-zinc-500 mt-4 text-center italic max-w-2xl mx-auto">
          User journey from acquisition to value realization. Each stage
          includes feedback mechanisms, reversibility, and measurable completion
          signals.
        </p>
      </section>

      {/* FIGURE: Information Architecture / Site Map */}
      <section className="max-w-6xl mx-auto">
        <p className="text-xs text-zinc-500 mb-4 font-mono">
          INFORMATION ARCHITECTURE
        </p>
        <InformationArchitecture />
        <p className="text-xs text-zinc-500 mt-4 text-center italic max-w-2xl mx-auto">
          BrickEx information architecture and page hierarchy. Color coding
          indicates page purpose: blue for acquisition, purple for
          authentication, green for onboarding, neutral for core workflow, amber
          for monetization, and red for legal. Arrows show primary navigation
          flows and cross-links between sections.
        </p>
      </section>
    </div>
  );
}

/* ─── Garrett Five Planes ─── */
function GarrettFivePlanes() {
  const planes = [
    {
      name: "Surface",
      subtitle: "Sensory Design",
      color: "from-white/20 to-white/5",
      border: "border-white/30",
      items: [
        "Pure black theme (0 0% 0%)",
        "DM Sans — 10 weights",
        "Neutral monochromatic palette",
        "Shimmer / pulse-ring / confetti animations",
        "Geometric SaaS logo",
        "Texture swatch photography",
        "Video preset .mp4 previews",
      ],
    },
    {
      name: "Skeleton",
      subtitle: "Interface & Navigation Design",
      color: "from-zinc-400/20 to-zinc-400/5",
      border: "border-zinc-400/30",
      items: [
        "Canvas + sidebar dashboard layout",
        "MobileBottomBar for touch devices",
        "Angle slot accordion (5 slots)",
        "3-column texture picker popover",
        "Video PresetSlotMachine",
        "Gallery grid with type filter tabs",
        "Pricing comparison cards",
      ],
    },
    {
      name: "Structure",
      subtitle: "Interaction Design & Information Architecture",
      color: "from-zinc-500/20 to-zinc-500/5",
      border: "border-zinc-500/30",
      items: [
        "4-stage workflow: Upload → Configure → Generate → Export",
        "5-section navigation: Create | Video | Tools | Explore | Gallery",
        "Project → Workspace hierarchy",
        "Toast notifications + disabled states",
        "Region/global edit with undo/redo",
        "Two-phase upload (setup → confirm)",
      ],
    },
    {
      name: "Scope",
      subtitle: "Functional Specifications & Content",
      color: "from-zinc-600/20 to-zinc-600/5",
      border: "border-zinc-600/30",
      items: [
        "Exterior + interior rendering",
        "Multi-angle generation (up to 5)",
        "Video generation with motion/scene presets",
        "8 specialized tools (separate catalog)",
        "Visual texture picker (12 materials)",
        "Region edit + global edit (20 bricks)",
        "Explore gallery + Ideas SEO pages + Blog",
      ],
      excluded: [
        "CAD/BIM integration",
        "Parametric controls",
        "Raw prompt as primary input",
      ],
    },
    {
      name: "Strategy",
      subtitle: "Product Objectives & User Needs",
      color: "from-zinc-700/20 to-zinc-700/5",
      border: "border-zinc-700/30",
      items: [
        "ICP 1: Real estate agents & developers",
        "ICP 2: Architecture students",
        "ICP 3: Architecture professionals",
        "Freemium model — 100 free bricks (wow moment first)",
        'Brand: "BrickEx" — see your project before it\'s built',
        "Acquisition: Programmatic SEO + Meta static ads",
        "North star: Revenue per Visitor (RPV)",
      ],
    },
  ];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Garrett&apos;s Five-Plane Model
          </h2>
          <p className="text-sm text-zinc-400">Applied to BrickEx</p>
        </div>
        <div className="flex flex-col items-end text-xs text-zinc-500">
          <span>← Most Concrete</span>
          <span className="mt-1">↓</span>
          <span>Most Abstract →</span>
        </div>
      </div>

      {planes.map((plane, i) => (
        <div
          key={plane.name}
          className={`bg-gradient-to-r ${plane.color} border ${plane.border} rounded-xl p-5 transition-all`}
          style={{ marginLeft: `${i * 16}px`, marginRight: `${i * 16}px` }}
        >
          <div className="flex items-baseline gap-3 mb-3">
            <span className="text-lg font-bold tracking-tight">
              {plane.name}
            </span>
            <span className="text-xs text-zinc-400 uppercase tracking-widest">
              {plane.subtitle}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {plane.items.map((item) => (
              <span
                key={item}
                className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-md text-xs text-zinc-300"
              >
                {item}
              </span>
            ))}
            {plane.excluded?.map((item) => (
              <span
                key={item}
                className="px-2.5 py-1 bg-red-500/5 border border-red-500/20 rounded-md text-xs text-red-400 line-through"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── System Architecture ─── */
function SystemArchitecture() {
  const layers = [
    {
      label: "Client Application",
      tech: "Next.js 15 · App Router · Tailwind · shadcn/ui · Radix · Framer Motion",
      items: [
        "Project Dashboard",
        "Video Generator",
        "Tools Catalog",
        "Explore",
        "Gallery",
        "Pricing",
        "Landing + Ideas + Blog",
      ],
    },
    {
      label: "Application Backend",
      tech: "Next.js Server Actions · API Routes · Better Auth · Polar",
      items: [
        "Generation Orchestration",
        "Upload Handler",
        "Prompt Compilation (GPT → Gemini)",
        "Credit System",
        "Auth + Sessions",
        "Webhook Handlers",
      ],
    },
    {
      label: "Persistence Layer",
      tech: "Supabase · PostgreSQL · Drizzle ORM · Row-Level Security",
      items: [
        "22 Tables · 20 Enums",
        "4 Storage Buckets",
        "Signed URL Access",
        "Asset Lineage Tracking",
        "Upload Sessions",
        "Multi-Tenant Isolation",
      ],
    },
  ];

  const external = [
    {
      label: "AI Providers",
      items: [
        "Gemini 3.1 Flash (image)",
        "GPT-5-mini (vision + prompts)",
        "Grok Video (xAI)",
        "fal.ai Trellis-2 (3D)",
      ],
    },
    {
      label: "Analytics & Attribution",
      items: [
        "PostHog (60+ events)",
        "Seline (UTM attribution)",
        "Meta Pixel + CAPI",
        "Resend (email sequences)",
      ],
    },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold tracking-tight mb-1">
        System Architecture
      </h2>
      <p className="text-sm text-zinc-400 mb-6">BrickEx Technical Stack</p>

      <div className="space-y-3">
        {layers.map((layer, i) => (
          <div
            key={layer.label}
            className="border border-zinc-800 rounded-xl p-5 bg-zinc-900/50"
          >
            <div className="flex items-baseline gap-3 mb-3">
              <span className="text-sm font-bold text-white">
                {layer.label}
              </span>
              <span className="text-xs text-zinc-500 font-mono">
                {layer.tech}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {layer.items.map((item) => (
                <span
                  key={item}
                  className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-md text-xs text-zinc-300"
                >
                  {item}
                </span>
              ))}
            </div>
            {i < layers.length - 1 && (
              <div className="flex justify-center mt-3 text-zinc-600">
                <ArrowDown />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 mt-3">
        {external.map((group) => (
          <div
            key={group.label}
            className="border border-zinc-800 rounded-xl p-5 bg-zinc-900/50"
          >
            <span className="text-sm font-bold text-white mb-3 block">
              {group.label}
            </span>
            <div className="flex flex-wrap gap-2">
              {group.items.map((item) => (
                <span
                  key={item}
                  className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-md text-xs text-zinc-300"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Generation Pipeline ─── */
function GenerationPipeline() {
  const steps = [
    {
      stage: "1",
      label: "Source Upload",
      detail: "Blueprint, sketch, photo, or text",
      tech: "Supabase Storage · Two-phase upload",
    },
    {
      stage: "2",
      label: "GPT Vision Analysis",
      detail: "Analyzes image → structured architectural description",
      tech: "GPT-5-mini · System prompt: arch. consultant",
    },
    {
      stage: "3",
      label: "Per-Slot Prompt Enhancement",
      detail: "Settings + analysis → ~500-word optimized prompt per angle",
      tech: "GPT-5-mini · Shot type, lighting, materials, environment",
    },
    {
      stage: "4",
      label: "Image Generation",
      detail: "Enhanced prompt + reference image → photorealistic render",
      tech: "Gemini 3.1 Flash · Fallback: Gemini 3 Pro · Retry + backoff",
    },
    {
      stage: "5",
      label: "Quality Check & Storage",
      detail: "Validate output → upload to bucket → create asset record",
      tech: "Supabase Storage · Asset lineage · Deliverable record",
    },
    {
      stage: "6",
      label: "Gallery & Export",
      detail: "Preview → download (watermark if free) → share",
      tech: "Canvas watermark · Signed URL · PostHog events",
    },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold tracking-tight mb-1">
        AI Generation Pipeline
      </h2>
      <p className="text-sm text-zinc-400 mb-6">Two-Stage Prompt Compilation</p>

      <div className="space-y-1">
        {steps.map((step, i) => (
          <div key={step.stage}>
            <div className="flex items-start gap-4 border border-zinc-800 rounded-xl p-4 bg-zinc-900/50">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-sm font-bold">
                {step.stage}
              </div>
              <div className="flex-1">
                <div className="font-semibold text-sm">{step.label}</div>
                <div className="text-xs text-zinc-400 mt-0.5">
                  {step.detail}
                </div>
                <div className="text-xs text-zinc-600 font-mono mt-1">
                  {step.tech}
                </div>
              </div>
            </div>
            {i < steps.length - 1 && (
              <div className="flex justify-center py-0.5 text-zinc-700">
                <ArrowDown />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 border border-dashed border-zinc-700 rounded-xl p-4 bg-zinc-950/50">
        <div className="text-xs text-zinc-500 font-mono">
          Parallel execution: GPT analysis runs once → all 5 angle slots
          generate simultaneously via generateExteriorBatch /
          generateInteriorBatch
        </div>
      </div>
    </div>
  );
}

/* ─── PostHog Event Map ─── */
function PostHogEventMap() {
  const groups = [
    {
      name: "Auth",
      count: 8,
      events: [
        "login_started",
        "login_success",
        "login_failed",
        "signup_started",
        "signup_success",
        "logout",
        "magic_link_sent",
        "oauth_started",
      ],
    },
    {
      name: "Onboarding",
      count: 5,
      events: [
        "onboarding_started",
        "onboarding_photo_added",
        "onboarding_photo_removed",
        "onboarding_completed",
        "onboarding_failed",
      ],
    },
    {
      name: "Dashboard",
      count: 7,
      events: [
        "dashboard_viewed",
        "avatar_source_selected",
        "template_selected",
        "template_cleared",
        "objects_selected",
        "settings_changed",
        "custom_prompt_entered",
      ],
    },
    {
      name: "Generation",
      count: 5,
      events: [
        "generation_started",
        "generation_completed",
        "generation_failed",
        "generation_blocked_limit",
        "generation_blocked_uploading",
      ],
    },
    {
      name: "Output",
      count: 3,
      events: ["image_downloaded", "image_shared", "new_project_created"],
    },
    {
      name: "Gallery",
      count: 7,
      events: [
        "gallery_viewed",
        "gallery_image_clicked",
        "gallery_image_downloaded",
        "gallery_image_deleted",
        "gallery_image_shared",
        "gallery_sort_changed",
        "gallery_view_mode_changed",
      ],
    },
    {
      name: "Subscription",
      count: 5,
      events: [
        "upgrade_modal_opened",
        "upgrade_modal_closed",
        "checkout_started",
        "checkout_completed",
        "subscription_portal_opened",
      ],
    },
    {
      name: "A/B & Pricing",
      count: 3,
      events: [
        "ab_variant_assigned",
        "pricing_page_viewed",
        "subscription_modal_viewed",
      ],
    },
    {
      name: "Landing",
      count: 3,
      events: [
        "landing_cta_clicked",
        "landing_pricing_viewed",
        "landing_faq_expanded",
      ],
    },
    {
      name: "Explore",
      count: 2,
      events: ["explore_category_changed", "explore_image_clicked"],
    },
    {
      name: "Errors & Upload",
      count: 3,
      events: ["error_occurred", "upload_failed", "images_uploaded"],
    },
    {
      name: "UI",
      count: 3,
      events: ["modal_opened", "modal_closed", "toast_shown"],
    },
  ];

  const total = groups.reduce((sum, g) => sum + g.count, 0);

  return (
    <div>
      <div className="flex items-baseline gap-3 mb-6">
        <h2 className="text-2xl font-bold tracking-tight">PostHog Event Map</h2>
        <span className="text-sm text-zinc-400">
          {total} events across {groups.length} lifecycle stages
        </span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {groups.map((group) => (
          <div
            key={group.name}
            className="border border-zinc-800 rounded-xl p-4 bg-zinc-900/50"
          >
            <div className="flex items-baseline justify-between mb-2">
              <span className="text-sm font-bold">{group.name}</span>
              <span className="text-xs text-zinc-500 font-mono">
                {group.count}
              </span>
            </div>
            <div className="space-y-1">
              {group.events.map((event) => (
                <div
                  key={event}
                  className="text-xs text-zinc-400 font-mono truncate"
                >
                  {event}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── User Journey ─── */
function UserJourney() {
  const stages = [
    {
      phase: "Acquisition",
      steps: [
        { label: "Google Search / Meta Ad / Direct", type: "entry" as const },
        { label: "Landing Page / Ideas Page / Blog", type: "page" as const },
      ],
    },
    {
      phase: "Activation",
      steps: [
        {
          label: "Sign Up (Google / Magic Link / Email)",
          type: "action" as const,
        },
        { label: "Welcome Onboarding", type: "page" as const },
        { label: "Create Project + Upload Source", type: "action" as const },
        {
          label: "Configure Settings (style, lighting, materials)",
          type: "action" as const,
        },
        {
          label: "Generate → First Render (wow moment)",
          type: "milestone" as const,
        },
      ],
    },
    {
      phase: "Engagement",
      steps: [
        { label: "Review Variants → Select Best", type: "action" as const },
        { label: "Region / Global Edit (refine)", type: "action" as const },
        { label: "Add Angle Slots (multi-angle set)", type: "action" as const },
        {
          label: "Video Generation (motion + scene presets)",
          type: "action" as const,
        },
        {
          label: "Tools (exploded diagram, floorplan, 3D...)",
          type: "action" as const,
        },
        {
          label: "Gallery: Download / Share / Manage",
          type: "action" as const,
        },
      ],
    },
    {
      phase: "Monetization",
      steps: [
        { label: "Credits Exhausted → Pricing Page", type: "page" as const },
        { label: "Select Plan → Checkout (Polar)", type: "action" as const },
        {
          label: "Purchase Confirmed → Meta CAPI event",
          type: "milestone" as const,
        },
      ],
    },
  ];

  const typeStyles = {
    entry: "bg-blue-500/10 border-blue-500/20 text-blue-300",
    page: "bg-purple-500/10 border-purple-500/20 text-purple-300",
    action: "bg-white/5 border-white/10 text-zinc-300",
    milestone:
      "bg-emerald-500/10 border-emerald-500/20 text-emerald-300 font-semibold",
  };

  return (
    <div>
      <h2 className="text-2xl font-bold tracking-tight mb-1">User Journey</h2>
      <p className="text-sm text-zinc-400 mb-6">
        From Acquisition to Value Realization
      </p>

      <div className="space-y-4">
        {stages.map((stage, si) => (
          <div key={stage.phase}>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">
                {stage.phase}
              </span>
              <div className="flex-1 h-px bg-zinc-800" />
            </div>
            <div className="flex flex-wrap gap-2 ml-4">
              {stage.steps.map((step, i) => (
                <div key={step.label} className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1.5 border rounded-lg text-xs ${typeStyles[step.type]}`}
                  >
                    {step.label}
                  </span>
                  {i < stage.steps.length - 1 && (
                    <span className="text-zinc-700">→</span>
                  )}
                </div>
              ))}
            </div>
            {si < stages.length - 1 && (
              <div className="flex justify-center mt-3 text-zinc-700">
                <ArrowDown />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 flex gap-4 text-xs text-zinc-500">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded border bg-blue-500/10 border-blue-500/20" />
          Entry Point
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded border bg-purple-500/10 border-purple-500/20" />
          Page View
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded border bg-white/5 border-white/10" />
          User Action
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded border bg-emerald-500/10 border-emerald-500/20" />
          Milestone
        </span>
      </div>
    </div>
  );
}

/* ─── Information Architecture (Tree Sitemap) ─── */
function InformationArchitecture() {
  const branches = [
    {
      label: "Public",
      color: "border-blue-400 bg-blue-500/20 text-blue-200",
      children: [
        "Landing Page",
        "Ideas (×40 SEO)",
        "AI Photos",
        "Blog",
        "Terms",
        "Privacy",
      ],
      childColor: "border-blue-500/30 bg-blue-500/10 text-blue-300",
    },
    {
      label: "Auth",
      color: "border-purple-400 bg-purple-500/20 text-purple-200",
      children: [
        "Login / Signup",
        "Google OAuth",
        "Magic Link",
        "Email + Password",
      ],
      childColor: "border-purple-500/30 bg-purple-500/10 text-purple-300",
    },
    {
      label: "Onboarding",
      color: "border-green-400 bg-green-500/20 text-green-200",
      children: [
        "Welcome Flow",
        "Playground Assigned",
        "100 Free Bricks",
      ],
      childColor: "border-green-500/30 bg-green-500/10 text-green-300",
    },
    {
      label: "Create",
      color: "border-white/60 bg-white/10 text-white",
      children: [
        "New Project",
        "Project Dashboard",
        "Mode (Ext / Int)",
        "Angle Slots (×5)",
        "Settings Sidebar",
        "Region / Global Edit",
      ],
      childColor: "border-white/20 bg-white/5 text-zinc-300",
    },
    {
      label: "Video",
      color: "border-white/60 bg-white/10 text-white",
      children: [
        "Video Generator",
        "Motion Presets (11)",
        "Scene Presets (6)",
        "Duration / Ratio",
      ],
      childColor: "border-white/20 bg-white/5 text-zinc-300",
    },
    {
      label: "Tools",
      color: "border-white/60 bg-white/10 text-white",
      children: [
        "Tools Catalog (8)",
        "Tool Page",
        "Exploded Diagram",
        "Floorplan → Interior",
        "Image → 3D",
        "Moodboard → Render",
        "Isometric View",
        "Landscape Gen",
      ],
      childColor: "border-white/20 bg-white/5 text-zinc-300",
    },
    {
      label: "Explore",
      color: "border-white/60 bg-white/10 text-white",
      children: [
        "Masonry Grid",
        "Category Cards",
        '"Generate Yours"',
      ],
      childColor: "border-white/20 bg-white/5 text-zinc-300",
    },
    {
      label: "Gallery",
      color: "border-white/60 bg-white/10 text-white",
      children: [
        "Ext / Int / Video / Tool",
        "Sort & Filter",
        "Download / Share",
        "Preview Modal",
      ],
      childColor: "border-white/20 bg-white/5 text-zinc-300",
    },
    {
      label: "Pricing",
      color: "border-amber-400 bg-amber-500/20 text-amber-200",
      children: [
        "Starter ($29)",
        "Pro ($49)",
        "Studio ($99)",
        "Polar Checkout",
      ],
      childColor: "border-amber-500/30 bg-amber-500/10 text-amber-300",
    },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold tracking-tight mb-1">
        Information Architecture
      </h2>
      <p className="text-sm text-zinc-400 mb-8">
        BrickEx Page Hierarchy &amp; Navigation Flows
      </p>

      <div className="flex flex-col items-center">
        {/* Root node */}
        <div className="px-8 py-3 rounded-full border-2 border-white bg-white/10 text-white font-bold text-lg tracking-tight">
          brickex.co
        </div>

        {/* Vertical line from root */}
        <div className="w-px h-8 bg-zinc-600" />

        {/* Horizontal connector spanning all branches */}
        <div className="w-full h-px bg-zinc-600" />

        {/* Branches */}
        <div className="w-full grid gap-0" style={{ gridTemplateColumns: `repeat(${branches.length}, 1fr)` }}>
          {branches.map((branch) => (
            <div key={branch.label} className="flex flex-col items-center">
              {/* Vertical line down to section node */}
              <div className="w-px h-6 bg-zinc-600" />

              {/* Section node */}
              <div
                className={`px-3 py-1.5 rounded-lg border text-xs font-bold text-center whitespace-nowrap ${branch.color}`}
              >
                {branch.label}
              </div>

              {/* Vertical line down to children */}
              <div className="w-px h-4 bg-zinc-700" />

              {/* Child pages */}
              <div className="flex flex-col items-center gap-1">
                {branch.children.map((child, ci) => (
                  <div key={child} className="flex flex-col items-center">
                    <div
                      className={`px-2 py-1 rounded-md border text-center whitespace-nowrap ${branch.childColor}`}
                      style={{ fontSize: "10px" }}
                    >
                      {child}
                    </div>
                    {ci < branch.children.length - 1 && (
                      <div className="w-px h-1 bg-zinc-800" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-5 text-xs text-zinc-500 mt-10 pt-4 border-t border-zinc-800">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded border-2 border-blue-400 bg-blue-500/20" />
          Acquisition
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded border-2 border-purple-400 bg-purple-500/20" />
          Authentication
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded border-2 border-green-400 bg-green-500/20" />
          Onboarding
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded border-2 border-white/60 bg-white/10" />
          Core Workflow
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded border-2 border-amber-400 bg-amber-500/20" />
          Monetization
        </span>
      </div>
    </div>
  );
}

function ArrowDown() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path
        d="M8 3v10m0 0l-3-3m3 3l3-3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
