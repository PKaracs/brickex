type Guideline = {
  title: string;
  subtitle: string;
  highlight?: boolean;
};

const GUIDELINES: Guideline[] = [
  { title: "Cuerpo entero", subtitle: "De cabeza a pies" },
  { title: "Varios angulos", subtitle: "Frente y lado" },
  { title: "Ropa variada", subtitle: "Prendas distintas" },
  { title: "Selfies claras", subtitle: "Buena luz" },
  { title: "Sin gorras", subtitle: "Rostro visible", highlight: true },
];

export function PhotoGuidelines() {
  return (
    <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800">
      <div className="grid grid-cols-5 gap-3">
        {GUIDELINES.map((item) => (
          <div key={item.title} className="text-center">
            <p
              className={`text-sm font-medium ${
                item.highlight ? "text-red-400" : "text-white"
              }`}
            >
              {item.title}
            </p>
            <p className="text-xs text-neutral-500 mt-0.5">{item.subtitle}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
