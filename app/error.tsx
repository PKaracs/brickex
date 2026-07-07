"use client";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#0a0a0a] px-6 text-center">
      <h1 className="text-2xl font-semibold text-white">Algo salio mal</h1>
      <p className="max-w-md text-sm text-neutral-400">
        Ha ocurrido un error inesperado. Recarga la pagina para intentarlo de
        nuevo.
      </p>
      {error.digest ? (
        <p className="text-xs text-neutral-600">Codigo: {error.digest}</p>
      ) : null}
      <div className="mt-2 flex gap-3">
        <button
          onClick={reset}
          className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-neutral-200"
        >
          Reintentar
        </button>
        <button
          onClick={() => window.location.reload()}
          className="rounded-lg border border-neutral-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-900"
        >
          Recargar pagina
        </button>
      </div>
    </div>
  );
}
