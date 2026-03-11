export type FaqItem = {
  question: string;
  answer: string;
};

export const FAQ_DATA: FaqItem[] = [
  {
    question: "What file formats does BrickEx accept?",
    answer:
      "BrickEx accepts SketchUp files, AutoCAD exports (DWG/DXF), floor plans (PDF, PNG, JPG), hand-drawn sketches, 3D model screenshots, and photos of existing buildings. Basically anything you'd use to communicate a design.",
  },
  {
    question: "How photorealistic are the renders?",
    answer:
      "Magazine-quality. Our AI generates renders with accurate materials, lighting, shadows, and landscaping that look like they came from a professional 3D studio. Architects and real estate marketers use them directly in listings and presentations.",
  },
  {
    question: "How fast is the generation?",
    answer:
      "Most renders are generated in 15-30 seconds. You can generate multiple variations (different lighting, time of day, weather, staging) from a single upload without waiting hours like traditional rendering.",
  },
  {
    question: "Can I change the lighting and time of day?",
    answer:
      "Yes. Generate the same project in daylight, golden hour, night, overcast, or sunrise. You can also add people, vehicles, and landscaping to create fully staged marketing scenes.",
  },
  {
    question: "Does it work for interior design too?",
    answer:
      "Absolutely. Upload an empty room or existing interior and BrickEx can furnish it in different styles — modern minimalist, Scandinavian, art deco, industrial, and more. Change upholstery, flooring, and lighting instantly.",
  },
  {
    question: "Can I generate videos of my project?",
    answer:
      "Yes. BrickEx can generate cinematic walkthroughs, construction timelapses, day-to-night transitions, and aerial flyovers from a single render. Perfect for client presentations and social media.",
  },
  {
    question: "Who is BrickEx for?",
    answer:
      "Architecture students, real estate developers, property marketers, interior designers, and anyone who needs to visualize a building project quickly. If you've ever waited weeks for a 3D render, BrickEx is for you.",
  },
  {
    question: "Can I cancel anytime?",
    answer:
      "Yes. No contracts, no hassle. Cancel with one click and you won't be charged again. Your generated renders stay yours forever.",
  },
];
