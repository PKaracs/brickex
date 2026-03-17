export interface InteriorTexture {
  id: string;
  label: string;
  /** Image URL for the texture */
  image: string;
  /** True if the image is already a rendered sphere (from Gemini); no extra CSS sphere overlay. */
  preRenderedSphere?: boolean;
}

function textureImg(file: string) {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/objects/textures/${file}`;
}

export const INTERIOR_TEXTURES: InteriorTexture[] = [
  { id: "marble-012", label: "Marble 012", image: textureImg("marble-012.webp"), preRenderedSphere: true },
  { id: "concrete-smooth", label: "Smooth Concrete", image: textureImg("concrete-smooth.webp"), preRenderedSphere: true },
  { id: "concrete-rough", label: "Rough Concrete", image: textureImg("concrete-rough.webp"), preRenderedSphere: true },
  { id: "oak-wood", label: "Oak Wood", image: textureImg("oak-wood.webp"), preRenderedSphere: true },
  { id: "brick-herringbone", label: "Brick Herringbone", image: textureImg("brick-herringbone.webp"), preRenderedSphere: true },
  { id: "polished-metal", label: "Polished Metal", image: textureImg("polished-metal.webp"), preRenderedSphere: true },
  { id: "terracotta", label: "Terracotta", image: textureImg("terracotta.webp"), preRenderedSphere: true },
  { id: "stone-gravel", label: "Stone Gravel", image: textureImg("stone-gravel.webp"), preRenderedSphere: true },
  { id: "white-plaster", label: "White Plaster", image: textureImg("white-plaster.webp"), preRenderedSphere: true },
  { id: "grey-paver", label: "Grey Paver", image: textureImg("grey-paver.webp"), preRenderedSphere: true },
  { id: "moss-stone", label: "Moss Stone", image: textureImg("moss-stone.webp"), preRenderedSphere: true },
  { id: "rust-metal", label: "Rust Metal", image: textureImg("rust-metal.webp"), preRenderedSphere: true },
];
