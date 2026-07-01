const SOFTWARE = [
  { name: "SketchUp", font: "font-bold tracking-tight" },
  { name: "AutoCAD", font: "font-bold tracking-widest uppercase" },
  { name: "Revit", font: "font-semibold tracking-wide" },
  { name: "3ds Max", font: "font-bold italic" },
  { name: "Rhino 3D", font: "font-semibold tracking-tight" },
  { name: "Blender", font: "font-bold tracking-wide" },
  { name: "ArchiCAD", font: "font-semibold tracking-widest uppercase" },
  { name: "V-Ray", font: "font-bold italic tracking-tight" },
];

export default function CompatibilityMarquee() {
  return (
    <section className="relative py-14 sm:py-20">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-zinc-800/50 to-transparent" />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <p className="text-sm sm:text-base text-zinc-500 font-medium">
            No tienes que aprender un flujo nuevo: sube archivos directamente
            desde el software que ya usas
          </p>
        </div>

        <div className="relative overflow-hidden">
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 sm:gap-x-14">
            {SOFTWARE.map((sw, idx) => (
              <div
                key={idx}
                className="flex h-14 items-center justify-center sm:h-16"
              >
                <span
                  className={`select-none whitespace-nowrap text-2xl text-zinc-600 sm:text-3xl lg:text-4xl ${sw.font}`}
                >
                  {sw.name}
                </span>
              </div>
            ))}
          </div>

          <div className="pointer-events-none absolute inset-y-0 left-0 h-full w-24 sm:w-40 bg-gradient-to-r from-[#0c0c0c]" />
          <div className="pointer-events-none absolute inset-y-0 right-0 h-full w-24 sm:w-40 bg-gradient-to-l from-[#0c0c0c]" />
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-zinc-800/50 to-transparent" />
    </section>
  );
}
