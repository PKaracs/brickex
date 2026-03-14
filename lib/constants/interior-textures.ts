export interface InteriorTexture {
  id: string;
  label: string;
  /** Image URL for the texture */
  image: string;
  /** True if the image is already a rendered sphere (from Gemini); no extra CSS sphere overlay. */
  preRenderedSphere?: boolean;
}

export const INTERIOR_TEXTURES: InteriorTexture[] = [
  { id: "marble-012", label: "Marble 012", image: "/textures/marble-012.jpg", preRenderedSphere: true },
  { id: "concrete-smooth", label: "Smooth Concrete", image: "/textures/concrete-smooth.jpg", preRenderedSphere: true },
  { id: "concrete-rough", label: "Rough Concrete", image: "/textures/concrete-rough.jpg", preRenderedSphere: true },
  { id: "oak-wood", label: "Oak Wood", image: "/textures/oak-wood.jpg", preRenderedSphere: true },
  { id: "brick-herringbone", label: "Brick Herringbone", image: "/textures/brick-herringbone.jpg", preRenderedSphere: true },
  { id: "polished-metal", label: "Polished Metal", image: "/textures/polished-metal.jpg", preRenderedSphere: true },
  { id: "terracotta", label: "Terracotta", image: "/textures/terracotta.jpg", preRenderedSphere: true },
  { id: "stone-gravel", label: "Stone Gravel", image: "/textures/stone-gravel.jpg", preRenderedSphere: true },
  { id: "white-plaster", label: "White Plaster", image: "/textures/white-plaster.jpg", preRenderedSphere: true },
  { id: "grey-paver", label: "Grey Paver", image: "/textures/grey-paver.jpg", preRenderedSphere: true },
  { id: "moss-stone", label: "Moss Stone", image: "/textures/moss-stone.jpg", preRenderedSphere: true },
  { id: "rust-metal", label: "Rust Metal", image: "/textures/rust-metal.jpg", preRenderedSphere: true },
];
