"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPolicyPage() {
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
          Politica de privacidad
        </h1>
        <p className="text-zinc-500 text-sm mb-10">
          Fecha de entrada en vigor: 14 de marzo de 2026
        </p>

        <p className="text-zinc-400 mb-12 leading-relaxed">
          Esta politica explica como Brickex (&quot;nosotros&quot;) recopila y usa
          informacion cuando utilizas{" "}
          <a
            href="https://brickex.co"
            className="text-white hover:text-zinc-300 transition-colors underline underline-offset-2"
          >
            brickex.co
          </a>
          , nuestra plataforma de marketing inmobiliario con IA.
        </p>

        <div className="space-y-10 text-zinc-400 leading-relaxed">
          <section>
            <h2 className="text-lg font-medium text-white mb-4">
              1. Informacion que recopilamos
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-zinc-300 font-medium mb-2">
                  Informacion personal
                </h3>
                <ul className="list-disc list-inside space-y-1 text-zinc-500">
                  <li>Correo electronico</li>
                  <li>Nombre y datos relacionados con la cuenta</li>
                  <li>Informacion de negocio o agencia</li>
                </ul>
              </div>
              <div>
                <h3 className="text-zinc-300 font-medium mb-2">
                  Contenido subido
                </h3>
                <ul className="list-disc list-inside space-y-1 text-zinc-500">
                  <li>Fotos de propiedades, planos y otras imagenes que subas</li>
                  <li>Detalles y descripciones de propiedades que proporciones</li>
                </ul>
              </div>
              <div>
                <h3 className="text-zinc-300 font-medium mb-2">
                  Pagos
                </h3>
                <ul className="list-disc list-inside space-y-1 text-zinc-500">
                  <li>Los pagos se procesan mediante proveedores externos</li>
                  <li>No almacenamos datos de tarjetas de credito</li>
                </ul>
              </div>
              <div>
                <h3 className="text-zinc-300 font-medium mb-2">
                  Uso, analitica y seguimiento
                </h3>
                <ul className="list-disc list-inside space-y-1 text-zinc-500">
                  <li>Paginas visitadas y acciones realizadas</li>
                  <li>Datos de dispositivo y navegador</li>
                  <li>Cookies y pixeles para analitica y publicidad</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-medium text-white mb-4">
              2. Como usamos la informacion
            </h2>
            <p className="mb-2">Usamos la informacion para:</p>
            <ul className="list-disc list-inside space-y-1 text-zinc-500">
              <li>Proporcionar y operar nuestras herramientas inmobiliarias</li>
              <li>Generar imagenes y materiales de marketing con IA</li>
              <li>Gestionar suscripciones y pagos</li>
              <li>Mejorar rendimiento y experiencia de usuario</li>
              <li>Comunicar actualizaciones relacionadas con el servicio</li>
              <li>Ejecutar analitica y campanas publicitarias</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-medium text-white mb-4">
              3. Imagenes de propiedades y privacidad
            </h2>
            <ul className="list-disc list-inside space-y-1 text-zinc-500">
              <li>Las imagenes subidas se usan solo para prestar el servicio</li>
              <li>No vendemos tus imagenes subidas</li>
              <li>No mostramos tus imagenes publicamente sin permiso</li>
              <li>Las imagenes pueden almacenarse temporalmente para procesarlas</li>
              <li>No usamos tus imagenes subidas para entrenar modelos de IA</li>
              <li>Las imagenes se eliminan automaticamente tras 30 dias de inactividad</li>
              <li>
                Puedes solicitar la eliminacion inmediata escribiendo a{" "}
                <a
                  href="mailto:hello@brickex.co"
                  className="text-white hover:text-zinc-300 transition-colors underline underline-offset-2"
                >
                  hello@brickex.co
                </a>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-medium text-white mb-4">
              4. Servicios de terceros
            </h2>
            <p className="mb-2">Usamos proveedores de confianza para pagos, analitica, publicidad, procesamiento de imagenes con IA, hosting e infraestructura.</p>
            <p className="text-zinc-500">
              Estos proveedores procesan datos bajo sus propias politicas de privacidad.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-white mb-4">
              5. Seguridad de datos
            </h2>
            <p className="text-zinc-500">
              Tomamos medidas razonables para proteger tus datos, pero ningun sistema es 100% seguro.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-white mb-4">
              6. Tus derechos
            </h2>
            <p className="mb-2">Segun tu ubicacion, puedes tener derecho a acceder a tus datos, solicitar su eliminacion o darte de baja de correos de marketing.</p>
            <p className="text-zinc-500">
              Para solicitudes, contacta con{" "}
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
              7. Cambios en esta politica
            </h2>
            <p className="text-zinc-500">
              Podemos actualizar esta politica de vez en cuando. Los cambios se publicaran en esta pagina.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-white mb-4">8. Contacto</h2>
            <p className="text-zinc-500">
              Para preguntas sobre privacidad:{" "}
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
