type Guideline = {
  title: string;
  subtitle: string;
  highlight?: boolean;
};

const GUIDELINES: Guideline[] = [
  { title: "Full body", subtitle: "Head to toe" },
  { title: "Multiple angles", subtitle: "Front & side" },
  { title: "Varied outfits", subtitle: "Different clothes" },
  { title: "Clear selfies", subtitle: "Good lighting" },
  { title: "No hats", subtitle: "Face visible", highlight: true },
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
