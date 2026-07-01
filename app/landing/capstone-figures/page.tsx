export default function CapstoneFiguresPage() {
  return (
    <div className="min-h-screen bg-black text-white p-8 space-y-24">
      {/* FIGURE 2: Garrett's Five-Plane Model */}
      <section className="max-w-4xl mx-auto">
        <p className="text-xs text-zinc-500 mb-4 font-mono">FIGURE 2</p>
        <GarrettFivePlanes />
        <p className="text-xs text-zinc-500 mt-4 text-center italic max-w-2xl mx-auto">
          Modelo de cinco planos de Garrett aplicado a BrickEx. Cada plano
          condiciona al superior: las decisiones estrategicas sobre usuarios
          objetivo y modelo de negocio determinan que funciones se incluyen
          (alcance), lo que define como se organiza el flujo (estructura), como
          se dispone la interfaz (esqueleto) y como se ve y se siente
          (superficie).
        </p>
      </section>

      {/* FIGURE 3: System Architecture */}
      <section className="max-w-5xl mx-auto">
        <p className="text-xs text-zinc-500 mb-4 font-mono">FIGURE 3</p>
        <SystemArchitecture />
        <p className="text-xs text-zinc-500 mt-4 text-center italic max-w-2xl mx-auto">
          Arquitectura de sistema de BrickEx. El frontend se comunica con
          server actions que orquestan proveedores de IA, gestionan storage y
          emiten eventos de analitica. Cada capa esta instrumentada para medir
          comportamiento.
        </p>
      </section>

      {/* FIGURE 13: AI Generation Pipeline */}
      <section className="max-w-5xl mx-auto">
        <p className="text-xs text-zinc-500 mb-4 font-mono">FIGURE 13</p>
        <GenerationPipeline />
        <p className="text-xs text-zinc-500 mt-4 text-center italic max-w-2xl mx-auto">
          Pipeline de generacion en dos etapas de BrickEx. GPT-5-mini analiza
          la imagen fuente y compila un prompt arquitectonico detallado desde
          ajustes estructurados. El prompt mejorado y la imagen de referencia se
          envian a Gemini con reintento automatico y fallback de modelo.
        </p>
      </section>

      {/* FIGURE 14: PostHog Event Map */}
      <section className="max-w-5xl mx-auto">
        <p className="text-xs text-zinc-500 mb-4 font-mono">FIGURE 14</p>
        <PostHogEventMap />
        <p className="text-xs text-zinc-500 mt-4 text-center italic max-w-2xl mx-auto">
          Instrumentacion de eventos PostHog a lo largo del ciclo de vida del
          usuario. Mas de sesenta eventos ofrecen telemetria granular para
          analisis de funnel, diagnostico de abandono y futuros tests A/B.
        </p>
      </section>

      {/* FIGURE 18: User Journey Flowchart */}
      <section className="max-w-5xl mx-auto">
        <p className="text-xs text-zinc-500 mb-4 font-mono">FIGURE 18</p>
        <UserJourney />
        <p className="text-xs text-zinc-500 mt-4 text-center italic max-w-2xl mx-auto">
          Recorrido de usuario desde adquisicion hasta realizacion de valor.
          Cada etapa incluye mecanismos de feedback, reversibilidad y senales
          medibles de finalizacion.
        </p>
      </section>

      {/* FIGURE: Information Architecture / Site Map */}
      <section className="max-w-6xl mx-auto">
        <p className="text-xs text-zinc-500 mb-4 font-mono">
          ARQUITECTURA DE INFORMACION
        </p>
        <InformationArchitecture />
        <p className="text-xs text-zinc-500 mt-4 text-center italic max-w-2xl mx-auto">
          Arquitectura de informacion y jerarquia de paginas de BrickEx. El
          color indica el proposito de la pagina: azul para adquisicion, purpura
          para autenticacion, verde para onboarding, neutro para flujo principal
          y ambar para monetizacion. Las flechas muestran flujos de navegacion
          principales y enlaces cruzados entre secciones.
        </p>
      </section>
    </div>
  );
}

/* ─── Garrett Five Planes ─── */
function GarrettFivePlanes() {
  const planes = [
    {
      name: "Superficie",
      subtitle: "Diseno sensorial",
      color: "from-white/20 to-white/5",
      border: "border-white/30",
      items: [
        "Tema negro puro (0 0% 0%)",
        "DM Sans - 10 pesos",
        "Paleta monocromatica neutral",
        "Animaciones shimmer, pulse-ring y confetti",
        "Logo SaaS geometrico",
        "Fotografia de swatches de textura",
        "Previews .mp4 de presets de video",
      ],
    },
    {
      name: "Esqueleto",
      subtitle: "Diseno de interfaz y navegacion",
      color: "from-zinc-400/20 to-zinc-400/5",
      border: "border-zinc-400/30",
      items: [
        "Layout de lienzo + sidebar de dashboard",
        "MobileBottomBar para dispositivos tactiles",
        "Acordeon de angulos (5 slots)",
        "Popover de texturas en 3 columnas",
        "Slot machine de presets de video",
        "Grid de galeria con tabs de filtro",
        "Cards comparativas de precios",
      ],
    },
    {
      name: "Estructura",
      subtitle: "Diseno de interaccion y arquitectura de informacion",
      color: "from-zinc-500/20 to-zinc-500/5",
      border: "border-zinc-500/30",
      items: [
        "Flujo en 4 etapas: subir -> configurar -> generar -> exportar",
        "Navegacion de 5 secciones: Crear | Video | Herramientas | Explorar | Galeria",
        "Jerarquia proyecto -> workspace",
        "Toasts + estados deshabilitados",
        "Edicion regional/global con deshacer/rehacer",
        "Subida en dos fases (setup -> confirmar)",
      ],
    },
    {
      name: "Alcance",
      subtitle: "Especificaciones funcionales y contenido",
      color: "from-zinc-600/20 to-zinc-600/5",
      border: "border-zinc-600/30",
      items: [
        "Render exterior + interior",
        "Generacion multiangulo (hasta 5)",
        "Generacion de video con presets de movimiento/escena",
        "8 herramientas especializadas (catalogo separado)",
        "Selector visual de texturas (12 materiales)",
        "Edicion regional + global (20 bricks)",
        "Galeria Explore + paginas SEO de ideas + blog",
      ],
      excluded: [
        "Integracion CAD/BIM",
        "Controles parametricos",
        "Prompt crudo como entrada principal",
      ],
    },
    {
      name: "Estrategia",
      subtitle: "Objetivos de producto y necesidades de usuario",
      color: "from-zinc-700/20 to-zinc-700/5",
      border: "border-zinc-700/30",
      items: [
        "ICP 1: agentes y promotoras inmobiliarias",
        "ICP 2: estudiantes de arquitectura",
        "ICP 3: profesionales de arquitectura",
        "Modelo freemium - 100 bricks gratis (wow moment primero)",
        'Marca: "BrickEx" - ve tu proyecto antes de construirlo',
        "Adquisicion: SEO programatico + anuncios estaticos Meta",
        "North star: ingresos por visitante (RPV)",
      ],
    },
  ];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Modelo de cinco planos de Garrett
          </h2>
          <p className="text-sm text-zinc-400">Aplicado a BrickEx</p>
        </div>
        <div className="flex flex-col items-end text-xs text-zinc-500">
          <span>Mas concreto</span>
          <span className="mt-1">↓</span>
          <span>Mas abstracto</span>
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
      label: "Aplicacion cliente",
      tech: "Next.js 15 · App Router · Tailwind · shadcn/ui · Radix · Framer Motion",
      items: [
        "Dashboard de proyecto",
        "Generador de video",
        "Catalogo de herramientas",
        "Explorar",
        "Galeria",
        "Precios",
        "Landing + ideas + blog",
      ],
    },
    {
      label: "Backend de aplicacion",
      tech: "Next.js Server Actions · API Routes · Better Auth · Polar",
      items: [
        "Orquestacion de generacion",
        "Handler de subida",
        "Compilacion de prompt (GPT -> Gemini)",
        "Sistema de creditos",
        "Auth + sesiones",
        "Handlers de webhooks",
      ],
    },
    {
      label: "Capa de persistencia",
      tech: "Supabase · PostgreSQL · Drizzle ORM · Row-Level Security",
      items: [
        "22 tablas · 20 enums",
        "4 buckets de storage",
        "Acceso por URL firmada",
        "Trazabilidad de assets",
        "Sesiones de subida",
        "Aislamiento multi-tenant",
      ],
    },
  ];

  const external = [
    {
      label: "Proveedores de IA",
      items: [
        "Gemini 3.1 Flash (imagen)",
        "GPT-5-mini (vision + prompts)",
        "Grok Video (xAI)",
        "fal.ai Trellis-2 (3D)",
      ],
    },
    {
      label: "Analitica y atribucion",
      items: [
        "PostHog (60+ eventos)",
        "Seline (atribucion UTM)",
        "Meta Pixel + CAPI",
        "Resend (secuencias de correo)",
      ],
    },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold tracking-tight mb-1">
        Arquitectura del sistema
      </h2>
      <p className="text-sm text-zinc-400 mb-6">Stack tecnico de BrickEx</p>

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
      label: "Subida de fuente",
      detail: "Plano, boceto, foto o texto",
      tech: "Supabase Storage · Subida en dos fases",
    },
    {
      stage: "2",
      label: "Analisis visual GPT",
      detail: "Analiza imagen -> descripcion arquitectonica estructurada",
      tech: "GPT-5-mini · System prompt: consultor arquitectonico",
    },
    {
      stage: "3",
      label: "Mejora de prompt por slot",
      detail: "Ajustes + analisis -> prompt optimizado de ~500 palabras por angulo",
      tech: "GPT-5-mini · Toma, luz, materiales, entorno",
    },
    {
      stage: "4",
      label: "Generacion de imagen",
      detail: "Prompt mejorado + imagen de referencia -> render fotorrealista",
      tech: "Gemini 3.1 Flash · Fallback: Gemini 3 Pro · Reintento + backoff",
    },
    {
      stage: "5",
      label: "Control de calidad y storage",
      detail: "Validar salida -> subir a bucket -> crear registro de asset",
      tech: "Supabase Storage · Linaje de asset · Registro de entregable",
    },
    {
      stage: "6",
      label: "Galeria y exportacion",
      detail: "Preview -> descargar (marca de agua si es gratis) -> compartir",
      tech: "Marca de agua en canvas · URL firmada · Eventos PostHog",
    },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold tracking-tight mb-1">
        Pipeline de generacion con IA
      </h2>
      <p className="text-sm text-zinc-400 mb-6">Compilacion de prompt en dos etapas</p>

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
          Ejecucion paralela: el analisis GPT corre una vez y despues los 5 slots de
          angulo generan simultaneamente via generateExteriorBatch /
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
      name: "Autenticacion",
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
      name: "Generacion",
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
      name: "Salida",
      count: 3,
      events: ["image_downloaded", "image_shared", "new_project_created"],
    },
    {
      name: "Galeria",
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
      name: "Suscripcion",
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
      name: "A/B y precios",
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
      name: "Explorar",
      count: 2,
      events: ["explore_category_changed", "explore_image_clicked"],
    },
    {
      name: "Errores y subida",
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
        <h2 className="text-2xl font-bold tracking-tight">Mapa de eventos PostHog</h2>
        <span className="text-sm text-zinc-400">
          {total} eventos en {groups.length} etapas del ciclo de vida
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
      phase: "Adquisicion",
      steps: [
        { label: "Busqueda Google / anuncio Meta / directo", type: "entry" as const },
        { label: "Landing / pagina de ideas / blog", type: "page" as const },
      ],
    },
    {
      phase: "Activacion",
      steps: [
        {
          label: "Registro (Google / magic link / correo)",
          type: "action" as const,
        },
        { label: "Onboarding de bienvenida", type: "page" as const },
        { label: "Crear proyecto + subir fuente", type: "action" as const },
        {
          label: "Configurar ajustes (estilo, luz, materiales)",
          type: "action" as const,
        },
        {
          label: "Generar -> primer render (wow moment)",
          type: "milestone" as const,
        },
      ],
    },
    {
      phase: "Uso recurrente",
      steps: [
        { label: "Revisar variantes -> elegir la mejor", type: "action" as const },
        { label: "Edicion regional / global (refinar)", type: "action" as const },
        { label: "Anadir slots de angulo (set multiangulo)", type: "action" as const },
        {
          label: "Generacion de video (presets de movimiento + escena)",
          type: "action" as const,
        },
        {
          label: "Herramientas (diagrama explotado, plano, 3D...)",
          type: "action" as const,
        },
        {
          label: "Galeria: descargar / compartir / gestionar",
          type: "action" as const,
        },
      ],
    },
    {
      phase: "Monetizacion",
      steps: [
        { label: "Creditos agotados -> pagina de precios", type: "page" as const },
        { label: "Elegir plan -> checkout (Polar)", type: "action" as const },
        {
          label: "Compra confirmada -> evento Meta CAPI",
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
      <h2 className="text-2xl font-bold tracking-tight mb-1">Recorrido de usuario</h2>
      <p className="text-sm text-zinc-400 mb-6">
        De adquisicion a realizacion de valor
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
          Punto de entrada
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded border bg-purple-500/10 border-purple-500/20" />
          Vista de pagina
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded border bg-white/5 border-white/10" />
          Accion de usuario
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded border bg-emerald-500/10 border-emerald-500/20" />
          Hito
        </span>
      </div>
    </div>
  );
}

/* ─── Information Architecture (Tree Sitemap) ─── */
function InformationArchitecture() {
  const branches = [
    {
      label: "Publico",
      color: "border-blue-400 bg-blue-500/20 text-blue-200",
      children: [
        "Landing",
        "Ideas (x40 SEO)",
        "Fotos IA",
        "Blog",
        "Terminos",
        "Privacidad",
      ],
      childColor: "border-blue-500/30 bg-blue-500/10 text-blue-300",
    },
    {
      label: "Autenticacion",
      color: "border-purple-400 bg-purple-500/20 text-purple-200",
      children: [
        "Login / registro",
        "Google OAuth",
        "Magic Link",
        "Correo + contrasena",
      ],
      childColor: "border-purple-500/30 bg-purple-500/10 text-purple-300",
    },
    {
      label: "Onboarding",
      color: "border-green-400 bg-green-500/20 text-green-200",
      children: [
        "Flujo de bienvenida",
        "Playground asignado",
        "100 bricks gratis",
      ],
      childColor: "border-green-500/30 bg-green-500/10 text-green-300",
    },
    {
      label: "Crear",
      color: "border-white/60 bg-white/10 text-white",
      children: [
        "Nuevo proyecto",
        "Dashboard de proyecto",
        "Modo (ext / int)",
        "Slots de angulo (x5)",
        "Sidebar de ajustes",
        "Edicion regional / global",
      ],
      childColor: "border-white/20 bg-white/5 text-zinc-300",
    },
    {
      label: "Video",
      color: "border-white/60 bg-white/10 text-white",
      children: [
        "Generador de video",
        "Presets de movimiento (11)",
        "Presets de escena (6)",
        "Duracion / ratio",
      ],
      childColor: "border-white/20 bg-white/5 text-zinc-300",
    },
    {
      label: "Herramientas",
      color: "border-white/60 bg-white/10 text-white",
      children: [
        "Catalogo de herramientas (8)",
        "Pagina de herramienta",
        "Diagrama explotado",
        "Plano -> interior",
        "Imagen -> 3D",
        "Moodboard -> render",
        "Vista isometrica",
        "Paisajismo",
      ],
      childColor: "border-white/20 bg-white/5 text-zinc-300",
    },
    {
      label: "Explorar",
      color: "border-white/60 bg-white/10 text-white",
      children: [
        "Grid masonry",
        "Cards de categoria",
        '"Genera el tuyo"',
      ],
      childColor: "border-white/20 bg-white/5 text-zinc-300",
    },
    {
      label: "Galeria",
      color: "border-white/60 bg-white/10 text-white",
      children: [
        "Ext / int / video / herramienta",
        "Ordenar y filtrar",
        "Descargar / compartir",
        "Modal de preview",
      ],
      childColor: "border-white/20 bg-white/5 text-zinc-300",
    },
    {
      label: "Precios",
      color: "border-amber-400 bg-amber-500/20 text-amber-200",
      children: [
        "Starter ($29)",
        "Pro ($49)",
        "Studio ($99)",
        "Checkout Polar",
      ],
      childColor: "border-amber-500/30 bg-amber-500/10 text-amber-300",
    },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold tracking-tight mb-1">
        Arquitectura de informacion
      </h2>
      <p className="text-sm text-zinc-400 mb-8">
        Jerarquia de paginas y flujos de navegacion de BrickEx
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
          Adquisicion
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded border-2 border-purple-400 bg-purple-500/20" />
          Autenticacion
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded border-2 border-green-400 bg-green-500/20" />
          Onboarding
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded border-2 border-white/60 bg-white/10" />
          Flujo principal
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded border-2 border-amber-400 bg-amber-500/20" />
          Monetizacion
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
