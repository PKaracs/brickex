"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowRight,
  CheckCircle2,
  KeyRound,
  Mail,
} from "lucide-react";

import GoogleOAuthForm from "@/components/auth/google-oauth-form";
import { authClient } from "@/lib/auth-client";
import { assetUrl } from "@/lib/assets";
import { BlurFade } from "@/components/ui/blur-fade";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const VILLA_IMAGES = [
  {
    src: assetUrl("real-estate-presets/maldives-overwater.png"),
    label: "Villa sobre el agua en Maldivas",
  },
  {
    src: assetUrl("real-estate-presets/tuscan-hilltop-villa.png"),
    label: "Villa toscana en colina",
  },
  {
    src: assetUrl("real-estate-presets/cape-town-clifftop.png"),
    label: "Acantilado en Ciudad del Cabo",
  },
  {
    src: assetUrl("real-estate-presets/miami-penthouse.png"),
    label: "Penthouse en Miami",
  },
  {
    src: assetUrl("real-estate-presets/mykonos-cycladic.png"),
    label: "Casa cicladica en Mykonos",
  },
  {
    src: assetUrl("real-estate-presets/scandinavian-lakehouse.png"),
    label: "Casa escandinava junto al lago",
  },
];

const IMAGE_CYCLE_MS = 4000;

interface LoginPageClientProps {
  authError?: string;
  magicLinkEnabled: boolean;
}

function toErrorMessage(error?: string | null) {
  switch (error) {
    case "INVALID_TOKEN":
      return "Ese enlace de acceso no es valido. Solicita uno nuevo.";
    case "EXPIRED_TOKEN":
      return "Ese enlace de acceso ha caducado. Solicita uno nuevo.";
    case "new_user_signup_disabled":
      return "El acceso de nuevos usuarios esta desactivado.";
    default:
      return error ? "No se pudo iniciar sesion. Solicita un enlace nuevo." : null;
  }
}

function getMarketingSiteUrl() {
  if (typeof window === "undefined") return "/";

  const { protocol, hostname, port } = window.location;

  if (hostname === "app.localhost") {
    return `${protocol}//localhost${port ? `:${port}` : ""}`;
  }

  if (hostname.startsWith("app.")) {
    return `${protocol}//${hostname.slice(4)}${port ? `:${port}` : ""}`;
  }

  return "/";
}

type AuthMode = "magic" | "password";
type PasswordIntent = "signin" | "signup";

export default function LoginPageClient({
  authError,
  magicLinkEnabled,
}: LoginPageClientProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);
  const [error, setError] = useState<string | null>(toErrorMessage(authError));
  const [marketingSiteUrl, setMarketingSiteUrl] = useState("/");
  const [mode, setMode] = useState<AuthMode>(
    magicLinkEnabled ? "magic" : "password",
  );
  const [passwordIntent, setPasswordIntent] =
    useState<PasswordIntent>("signin");

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % VILLA_IMAGES.length);
    }, IMAGE_CYCLE_MS);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setError(toErrorMessage(authError));
  }, [authError]);

  useEffect(() => {
    setMarketingSiteUrl(getMarketingSiteUrl());
  }, []);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsPasswordLoading(true);
    setError(null);

    try {
      if (passwordIntent === "signup") {
        const result = await authClient.signUp.email({
          email,
          password,
          name: name.trim() || email.split("@")[0],
          callbackURL: "/app/dashboard/new",
        });

        if (result.error) {
          throw new Error(result.error.message || "No se pudo crear la cuenta");
        }
      } else {
        const result = await authClient.signIn.email({
          email,
          password,
          callbackURL: "/app/dashboard/new",
        });

        if (result.error) {
          throw new Error(result.error.message || "Correo o contrasena incorrectos");
        }
      }

      window.location.assign("/app/dashboard/new");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : passwordIntent === "signup"
            ? "No se pudo crear la cuenta"
            : "No se pudo iniciar sesion",
      );
    } finally {
      setIsPasswordLoading(false);
    }
  };

  const handleMagicLinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    setError(null);

    try {
      if (!magicLinkEnabled) {
        throw new Error("El acceso por email no esta configurado");
      }

      const result = await authClient.signIn.magicLink({
        email,
        ...(name.trim() ? { name: name.trim() } : {}),
        callbackURL: "/app/dashboard/new",
        newUserCallbackURL: "/app/dashboard/new",
        errorCallbackURL: "/app/login",
      });

      if (result.error) {
        throw new Error(result.error.message || "No se pudo enviar el enlace");
      }

      setIsSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Algo salio mal");
    } finally {
      setIsLoading(false);
    }
  };

  const villa = VILLA_IMAGES[currentImage];

  return (
    <div className="flex min-h-screen bg-[#0a0a0a]">
      <div className="relative hidden overflow-hidden lg:block lg:w-1/2">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentImage}
            className="absolute inset-0"
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <img
              src={villa.src}
              alt={villa.label}
              className="absolute inset-0 h-full w-full object-cover"
            />
          </motion.div>
        </AnimatePresence>

        <div className="absolute inset-0 z-10 bg-gradient-to-r from-transparent via-transparent to-[#0a0a0a]/80" />
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-[#0a0a0a]/60 via-transparent to-[#0a0a0a]/30" />

        <div className="absolute bottom-8 left-8 z-20">
          <AnimatePresence mode="wait">
            <motion.div
              key={villa.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.5 }}
              className="flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-4 py-2 backdrop-blur-xl"
            >
              <div className="h-2 w-2 animate-pulse rounded-full bg-white/60" />
              <span className="text-sm font-medium text-white/80">
                {villa.label}
              </span>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="absolute bottom-8 right-8 z-20 flex items-center gap-1.5">
          {VILLA_IMAGES.map((_, i) => (
            <div
              key={i}
              className={`h-1 rounded-full transition-all duration-700 ${
                i === currentImage ? "w-6 bg-white/70" : "w-1.5 bg-white/20"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="relative flex w-full items-center justify-center p-6 sm:p-12 lg:w-1/2">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        <div className="relative z-10 w-full max-w-md">
          <BlurFade delay={0.1}>
            <a href={marketingSiteUrl} className="mb-14 flex items-center gap-2.5">
              <Image
                src="/brickex-logo.png"
                alt="BrickEx"
                width={40}
                height={40}
                className="h-10 w-10"
                priority
              />
              <span className="text-xl font-semibold text-white">BrickEx</span>
            </a>
          </BlurFade>

          <BlurFade delay={0.15}>
            <div className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-8 backdrop-blur-sm">
              <div className="mb-6 space-y-2">
                <h1 className="text-2xl font-semibold text-white">
                  Inicia sesion en BrickEx
                </h1>
                <p className="text-sm text-neutral-500">
                  {magicLinkEnabled
                    ? "Continua con Google, email o contrasena."
                    : "Continua con Google o contrasena."}
                </p>
              </div>

              {!isSubmitted ? (
                <>
                  <GoogleOAuthForm />

                  <div className="my-6 flex items-center gap-3">
                    <div className="h-px flex-1 bg-neutral-800" />
                    <span className="text-xs uppercase tracking-[0.18em] text-neutral-500">
                      O
                    </span>
                    <div className="h-px flex-1 bg-neutral-800" />
                  </div>
                </>
              ) : null}

              {magicLinkEnabled && !isSubmitted ? (
                <div className="mb-4 flex rounded-xl border border-neutral-800 bg-black/20 p-1">
                  <button
                    type="button"
                    onClick={() => {
                      setMode("magic");
                      setError(null);
                    }}
                    className={`flex-1 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                      mode === "magic"
                        ? "bg-neutral-800 text-white"
                        : "text-neutral-400 hover:text-white"
                    }`}
                  >
                    <Mail className="mr-1.5 inline h-3.5 w-3.5" />
                    Correo
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMode("password");
                      setError(null);
                    }}
                    className={`flex-1 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                      mode === "password"
                        ? "bg-neutral-800 text-white"
                        : "text-neutral-400 hover:text-white"
                    }`}
                  >
                    <KeyRound className="mr-1.5 inline h-3.5 w-3.5" />
                    Contrasena
                  </button>
                </div>
              ) : null}

              {magicLinkEnabled && isSubmitted ? (
                <div className="space-y-6">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10">
                    <CheckCircle2 className="h-8 w-8 text-emerald-400" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-3xl font-semibold text-white">
                      Revisa tu bandeja
                    </h2>
                    <p className="text-base leading-relaxed text-neutral-400">
                      Enviamos un enlace seguro de acceso a BrickEx a{" "}
                      <span className="font-medium text-white">{email}</span>.
                    </p>
                    <p className="text-sm text-neutral-500">
                      Si es tu primer acceso, crearemos tu cuenta y tu espacio
                      de trabajo automaticamente.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className="border-neutral-800 bg-transparent text-white hover:bg-neutral-900 hover:text-white"
                    onClick={() => setIsSubmitted(false)}
                  >
                    Enviar otro enlace
                  </Button>
                </div>
              ) : null}

              {magicLinkEnabled && !isSubmitted && mode === "magic" ? (
                <form onSubmit={handleMagicLinkSubmit} className="space-y-4">
                  <div className="rounded-xl border border-neutral-800 bg-black/20 p-3 text-sm text-neutral-300">
                    <div className="flex items-start gap-2">
                      <Mail className="mt-0.5 h-4 w-4 flex-shrink-0 text-neutral-400" />
                      <p>
                        Te enviaremos un enlace a tu email. Si es tu primer
                        acceso, tambien crearemos tu cuenta automaticamente.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Input
                      type="text"
                      placeholder="Tu nombre (opcional en el primer acceso)"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="h-11 border-neutral-800 bg-neutral-900 text-white placeholder:text-neutral-600 focus:border-neutral-600 focus:ring-0"
                    />
                  </div>

                  <div className="space-y-2">
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-11 border-neutral-800 bg-neutral-900 text-white placeholder:text-neutral-600 focus:border-neutral-600 focus:ring-0"
                      required
                    />
                  </div>

                  {error && (
                    <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">
                      {error}
                    </div>
                  )}

                  <Button
                    type="submit"
                    variant="white"
                    size="default"
                    className="w-full"
                    isLoading={isLoading}
                  >
                    Enviar enlace al email
                    <Mail className="ml-2 h-4 w-4" />
                  </Button>
                </form>
              ) : null}

              {!isSubmitted && mode === "password" ? (
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  <div className="rounded-xl border border-neutral-800 bg-black/20 p-3 text-sm text-neutral-300">
                    <div className="flex items-start gap-2">
                      <KeyRound className="mt-0.5 h-4 w-4 flex-shrink-0 text-neutral-400" />
                      <p>
                        {passwordIntent === "signup"
                          ? "Crea una cuenta con tu email y una contrasena. Tu espacio de trabajo se configurara automaticamente."
                          : "Inicia sesion con tu email y contrasena. La cuenta ya debe existir."}
                      </p>
                    </div>
                  </div>

                  {passwordIntent === "signup" ? (
                    <div className="space-y-2">
                      <Input
                        type="text"
                        placeholder="Tu nombre (opcional)"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="h-11 border-neutral-800 bg-neutral-900 text-white placeholder:text-neutral-600 focus:border-neutral-600 focus:ring-0"
                        autoComplete="name"
                      />
                    </div>
                  ) : null}

                  <div className="space-y-2">
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-11 border-neutral-800 bg-neutral-900 text-white placeholder:text-neutral-600 focus:border-neutral-600 focus:ring-0"
                      required
                      autoComplete="email"
                    />
                  </div>

                  <div className="space-y-2">
                    <Input
                      type="password"
                      placeholder={
                        passwordIntent === "signup"
                          ? "Elige una contrasena (min. 8 caracteres)"
                          : "Contrasena"
                      }
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-11 border-neutral-800 bg-neutral-900 text-white placeholder:text-neutral-600 focus:border-neutral-600 focus:ring-0"
                      required
                      minLength={passwordIntent === "signup" ? 8 : undefined}
                      autoComplete={
                        passwordIntent === "signup"
                          ? "new-password"
                          : "current-password"
                      }
                    />
                  </div>

                  {error && (
                    <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">
                      {error}
                    </div>
                  )}

                  <Button
                    type="submit"
                    variant="white"
                    size="default"
                    className="w-full"
                    isLoading={isPasswordLoading}
                  >
                    {passwordIntent === "signup"
                      ? "Crear cuenta"
                      : "Iniciar sesion"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>

                  <div className="pt-1 text-center text-xs text-neutral-500">
                    {passwordIntent === "signup" ? (
                      <>
                        Ya tienes cuenta?{" "}
                        <button
                          type="button"
                          onClick={() => {
                            setPasswordIntent("signin");
                            setError(null);
                          }}
                          className="font-medium text-white hover:underline"
                        >
                          Iniciar sesion
                        </button>
                      </>
                    ) : (
                      <>
                        Aun no tienes cuenta?{" "}
                        <button
                          type="button"
                          onClick={() => {
                            setPasswordIntent("signup");
                            setError(null);
                          }}
                          className="font-medium text-white hover:underline"
                        >
                          Crear una
                        </button>
                      </>
                    )}
                  </div>
                </form>
              ) : null}

              <div className="mt-6 border-t border-neutral-800 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  size="default"
                  className="w-full border-neutral-800 bg-transparent text-white hover:bg-neutral-900 hover:text-white"
                  onClick={() => window.location.assign(getMarketingSiteUrl())}
                >
                  Volver al sitio
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </BlurFade>
        </div>
      </div>
    </div>
  );
}
