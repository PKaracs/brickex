"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="es">
      <body style={{ margin: 0 }}>
        <div
          style={{
            display: "flex",
            minHeight: "100vh",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 16,
            background: "#0a0a0a",
            color: "#fff",
            fontFamily: "system-ui, sans-serif",
            textAlign: "center",
            padding: 24,
          }}
        >
          <h1 style={{ fontSize: 24, fontWeight: 600, margin: 0 }}>
            Algo salio mal
          </h1>
          <p style={{ maxWidth: 420, fontSize: 14, color: "#a3a3a3", margin: 0 }}>
            Ha ocurrido un error inesperado. Recarga la pagina para intentarlo
            de nuevo.
          </p>
          {error.digest ? (
            <p style={{ fontSize: 12, color: "#525252", margin: 0 }}>
              Codigo: {error.digest}
            </p>
          ) : null}
          <button
            onClick={() => reset()}
            style={{
              marginTop: 8,
              borderRadius: 8,
              background: "#fff",
              color: "#000",
              border: "none",
              padding: "10px 18px",
              fontSize: 14,
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Reintentar
          </button>
        </div>
      </body>
    </html>
  );
}
