"use client";

import { cn } from "@/lib/utils";
import { PricingCard, type Plan } from "@/components/ui/pricing-card";
import { StaticReveal as BlurFade } from "@/components/landing/StaticReveal";
import { getSignupUrl } from "@/lib/app-url";

export default function PricingGrid() {
  const signupUrl = getSignupUrl();

  const navigate = () => {
    window.location.href = signupUrl;
  };

  const plans: Plan[] = [
    {
      id: "free",
      name: "Subida gratis",
      price: 0,
      currency: "$",
      features: [
        "Crea tu cuenta y sube archivos",
        "Prepara bocetos, planos y modelos",
        "Vista previa del flujo de render",
        "Soporte para SketchUp, AutoCAD y PDF",
        "Generacion disponible en planes de pago",
      ],
      buttonText: "Subir archivo",
      onClick: navigate,
    },
    {
      id: "starter",
      name: "Starter",
      price: "29",
      subText: "/mes",
      currency: "$",
      features: [
        "4,000 bricks al mes",
        "Modos exterior + interior",
        "Todos los estilos arquitectonicos",
        "Todas las variaciones de luz y clima",
        "Exportaciones 4K sin marcas de agua",
        "Licencia de uso comercial incluida",
        "Generacion en 30 segundos",
      ],
      additionalFeatures: ["Todo lo de Subida gratis"],
      buttonText: "Empezar",
      onClick: navigate,
    },
    {
      id: "pro",
      name: "Pro",
      price: "49",
      subText: "/mes",
      currency: "$",
      featured: true,
      features: [
        "12,000 bricks al mes",
        "Generacion de video (recorridos y timelapses)",
        "Edicion y refinamiento por zonas",
        "Procesamiento prioritario",
        "Licencia de uso comercial incluida",
        "Todas las herramientas incluidas",
      ],
      additionalFeatures: ["Todo lo de Starter"],
      buttonText: "Empezar a crear",
      onClick: navigate,
    },
    {
      id: "studio",
      name: "Studio",
      price: "99",
      subText: "/mes",
      currency: "$",
      features: [
        "30,000 bricks al mes",
        "Colaboracion en equipo (hasta 5 plazas)",
        "Renderizado por lotes (hasta 20 a la vez)",
        "Presets de marca personalizados",
        "Acceso API para integraciones",
        "Licencia de uso comercial incluida",
        "Exportaciones white-label",
      ],
      additionalFeatures: ["Todo lo de Pro"],
      buttonText: "Empezar con BrickEx",
      onClick: navigate,
    },
  ];

  return (
    <section className="relative py-16 sm:py-24 overflow-hidden">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <BlurFade inView delay={0.1}>
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight">
              <span className="bg-gradient-to-b from-white via-neutral-100 to-neutral-400 bg-clip-text text-transparent">
                Menos que un solo render de estudio. Cada mes.
              </span>
            </h2>
            <p className="text-zinc-500 mt-3 text-sm sm:text-base max-w-lg mx-auto">
              Sube tu archivo gratis. Desbloquea la generacion cuando quieras
              crear renders listos para clientes, presentaciones y marketing.
              Cancela cuando quieras.
            </p>
          </div>
        </BlurFade>

        <BlurFade inView delay={0.2}>
          <div className={cn(
            "mx-auto grid grid-cols-1 gap-4",
            "max-w-7xl md:grid-cols-2 xl:grid-cols-4",
          )}>
            {plans.map((plan) => (
              <PricingCard key={plan.id} plan={plan} onClick={plan.onClick} />
            ))}
          </div>
        </BlurFade>

        <BlurFade inView delay={0.3}>
          <p className="text-center text-xs text-zinc-600 mt-8">
            Cancela cuando quieras: sin contratos ni permanencia. Todos los
            planes incluyen cifrado SSL, cumplimiento GDPR y 99.9% de uptime.
            Tus renders siempre son tuyos y los planes de pago incluyen uso
            comercial.
          </p>
        </BlurFade>
      </div>
    </section>
  );
}
