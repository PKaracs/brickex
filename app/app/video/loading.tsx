export default function VideoLoading() {
  return (
    <div className="h-full w-full bg-black flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-2 border-neutral-800" />
          <div className="absolute inset-0 w-12 h-12 rounded-full border-2 border-transparent border-t-white/40 animate-spin" />
        </div>
        <p className="text-sm text-neutral-500">Cargando estudio de video...</p>
      </div>
    </div>
  );
}
