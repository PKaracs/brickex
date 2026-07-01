"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-12 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Volver al inicio
        </Link>

        <h1 className="text-3xl sm:text-4xl font-semibold text-white mb-2 tracking-tight">
          Terminos y condiciones
        </h1>
        <p className="text-zinc-500 text-sm mb-10">
          Fecha de entrada en vigor: 14 de marzo de 2026
        </p>

        <p className="text-zinc-400 mb-12 leading-relaxed">
          Bienvenido a Brickex. Al acceder o usar{" "}
          <a
            href="https://brickex.co"
            className="text-white hover:text-zinc-300 transition-colors underline underline-offset-2"
          >
            brickex.co
          </a>
          , aceptas estos terminos. Si no estas de acuerdo, no uses el servicio.
        </p>

        <div className="space-y-10 text-zinc-400 leading-relaxed">
          <section>
            <h2 className="text-lg font-medium text-white mb-4">
              1. Descripcion del servicio
            </h2>
            <p className="mb-2">
              Brickex es una plataforma de marketing inmobiliario con IA que ayuda a crear visuales mejorados de propiedades, staging virtual, mejoras de imagen y materiales de marketing a partir de fotos subidas.
            </p>
            <p className="text-zinc-500">
              Los resultados pueden variar segun los datos de entrada y el uso. No garantizamos resultados concretos.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-white mb-4">
              2. Elegibilidad y cuentas
            </h2>
            <ul className="list-disc list-inside space-y-1 text-zinc-500">
              <li>Debes tener al menos 18 anos para usar Brickex</li>
              <li>Eres responsable de toda actividad en tu cuenta</li>
              <li>Aceptas proporcionar informacion precisa</li>
              <li>No puedes compartir ni revender el acceso al servicio</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-medium text-white mb-4">
              3. Contenido del usuario y consentimiento
            </h2>
            <p className="mb-3">
              Conservas la propiedad de las fotos y contenido que subes. Al subir contenido, confirmas que eres propietario o tienes permiso para usarlo, que cuentas con los derechos necesarios sobre las imagenes de la propiedad y que el contenido no infringe derechos de terceros.
            </p>
            <p className="text-zinc-500">
              Otorgas a Brickex una licencia limitada para procesar el contenido subido solo con el fin de prestar el servicio.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-white mb-4">
              4. Usos prohibidos
            </h2>
            <p className="mb-2">No puedes subir, generar ni intentar crear contenido ilegal, danino, ofensivo, no relacionado con marketing inmobiliario o que no tengas derecho a usar comercialmente.</p>
            <p className="mb-2">Tampoco puedes usar Brickex o el contenido generado para enganar, defraudar, tergiversar materialmente una propiedad, crear anuncios fraudulentos, infringir normas publicitarias inmobiliarias, acosar, causar dano, cometer robo de identidad o fraude.</p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-white mb-4">
              5. Representacion precisa
            </h2>
            <p className="text-zinc-500 mb-3">
              Eres responsable de asegurar que los materiales que crees no tergiversen de forma material la propiedad comercializada.
            </p>
            <p className="text-zinc-500">
              Las mejoras generadas con IA deben mostrar potencial, no enganar a compradores o inquilinos sobre el estado real o las caracteristicas de una propiedad. Cuando la ley lo exija, debes divulgar que las imagenes han sido mejoradas digitalmente o escenificadas virtualmente.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-white mb-4">
              6. Politica de uso razonable
            </h2>
            <p className="mb-3">
              Los planes de Brickex pueden describirse como ilimitados y estan sujetos a uso razonable. El uso normal profesional no tiene un limite diario fijo, pero el uso excesivo, automatizado o abusivo puede ser revisado, limitado temporalmente o restringido.
            </p>
            <p className="text-zinc-500">
              Si necesitas mayor volumen, contacta con{" "}
              <a
                href="mailto:hello@brickex.co"
                className="text-white hover:text-zinc-300 transition-colors underline underline-offset-2"
              >
                hello@brickex.co
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-white mb-4">
              7. Pagos, suscripciones y reembolsos
            </h2>
            <ul className="list-disc list-inside space-y-1 text-zinc-500">
              <li>Los planes de pago se facturan de forma recurrente</li>
              <li>Los precios se muestran claramente en el checkout</li>
              <li>Puedes cancelar tu suscripcion en cualquier momento</li>
              <li>La cancelacion detiene cargos futuros</li>
              <li>Salvo que la ley exija lo contrario, los pagos no son reembolsables</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-medium text-white mb-4">
              8. Responsabilidad por contenido generado
            </h2>
            <p className="text-zinc-500 mb-3">
              Eres responsable de todo contenido que generes con Brickex y de como lo uses, compartas o distribuyas en listados, anuncios u otros materiales de marketing.
            </p>
            <p className="text-zinc-500">
              Brickex no es responsable de reclamaciones, danos o problemas legales derivados de tu uso del contenido generado, incluidos tergiversacion, publicidad enganosa o infraccion de propiedad intelectual. Aceptas indemnizar a Brickex por reclamaciones derivadas de dicho uso.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-white mb-4">
              9. Aviso sobre contenido generado con IA
            </h2>
            <p className="text-zinc-500">
              Las imagenes mejoradas y staging virtual creados mediante Brickex son generados con IA. Pueden contener imprecisiones o artefactos y deben revisarse antes de publicarse.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-white mb-4">
              10. Renuncias, responsabilidad y terminacion
            </h2>
            <p className="text-zinc-500">
              Brickex se proporciona &quot;tal cual&quot;, sin garantias de ningun tipo. En la maxima medida permitida por la ley, Brickex no sera responsable por danos indirectos, incidentales o consecuentes derivados del uso del servicio. Podemos suspender o cancelar cuentas que incumplan estos terminos o hagan mal uso del servicio.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-white mb-4">
              11. Cambios y ley aplicable
            </h2>
            <p className="text-zinc-500">
              Podemos actualizar estos terminos en cualquier momento. El uso continuado del servicio implica la aceptacion de los terminos actualizados. Estos terminos se rigen por las leyes de la UE.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-white mb-4">12. Contacto</h2>
            <p className="text-zinc-500">
              Para preguntas o soporte:{" "}
              <a
                href="mailto:hello@brickex.co"
                className="text-white hover:text-zinc-300 transition-colors underline underline-offset-2"
              >
                hello@brickex.co
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
