import { allIdeaPages, type IdeaGalleryImage } from "@/lib/constants/idea-pages";
import ExamplesFromBrickexTabs, {
  type BrickexExampleGroup,
} from "./ExamplesFromBrickexTabs";

type ExamplePick = {
  slug: string;
  imageKey: string;
};

const GROUP_DEFINITIONS: Array<
  Omit<BrickexExampleGroup, "items"> & { picks: ExamplePick[] }
> = [
  {
    id: "exteriors",
    label: "Exteriores",
    description:
      "Fachadas hero, llegadas a nivel de calle, contexto aereo y estudios de mood que venden el proyecto a primera vista.",
    picks: [
      {
        slug: "modern-villa-render-ideas",
        imageKey: "hero-modern-villa-stillness",
      },
      {
        slug: "luxury-mansion-render-ideas",
        imageKey: "hero-symmetrical-limestone-facade",
      },
      {
        slug: "desert-modern-house-render-ideas",
        imageKey: "desert-modern-hero-exterior",
      },
      {
        slug: "beach-house-render-ideas",
        imageKey: "hero-timber-beach-house-exterior",
      },
      {
        slug: "japanese-house-render-ideas",
        imageKey: "hero-minimal-japanese-house-exterior",
      },
      {
        slug: "swiss-chalet-render-ideas",
        imageKey: "hero-swiss-chalet-panorama",
      },
    ],
  },
  {
    id: "interiors",
    label: "Interiores",
    description:
      "Salones, lobbies, lounges y vinetas de materiales: amueblados e iluminados como una editorial.",
    picks: [
      {
        slug: "luxury-penthouse-render-ideas",
        imageKey: "styled-living-room-penthouse",
      },
      {
        slug: "modern-villa-render-ideas",
        imageKey: "living-room-gathered-light-composition",
      },
      {
        slug: "luxury-condo-tower-render-ideas",
        imageKey: "marble-lobby-hotel-style-interior",
      },
      {
        slug: "swiss-chalet-render-ideas",
        imageKey: "living-room-fireplace-luxury-lounge",
      },
      {
        slug: "tuscan-villa-render-ideas",
        imageKey: "rustic-luxury-living-room",
      },
      {
        slug: "japanese-house-render-ideas",
        imageKey: "living-room-serene-timber-tatami-layout",
      },
    ],
  },
  {
    id: "amenities",
    label: "Amenidades",
    description:
      "Piscinas, terrazas, patios y escenas lifestyle que ayudan al comprador a imaginarse viviendo alli.",
    picks: [
      {
        slug: "luxury-penthouse-render-ideas",
        imageKey: "rooftop-pool-amenity-daylight",
      },
      {
        slug: "luxury-condo-tower-render-ideas",
        imageKey: "sunlit-terrace-pool-amenity-deck",
      },
      {
        slug: "desert-modern-house-render-ideas",
        imageKey: "desert-modern-courtyard-terrace",
      },
      {
        slug: "overwater-villa-render-ideas",
        imageKey: "amenities-infinity-pool-terrace",
      },
      {
        slug: "tuscan-villa-render-ideas",
        imageKey: "sunset-courtyard-dining",
      },
      {
        slug: "luxury-mansion-render-ideas",
        imageKey: "terrace-overlooking-landscaped-courtyard",
      },
    ],
  },
];

function findImage(gallery: IdeaGalleryImage[], imageKey: string) {
  return gallery.find((image) => image.id.endsWith(`:${imageKey}`));
}

function buildGroups(): BrickexExampleGroup[] {
  return GROUP_DEFINITIONS.map(({ picks, ...group }) => ({
    ...group,
    items: picks.flatMap((pick) => {
      const page = allIdeaPages.find((ideaPage) => ideaPage.slug === pick.slug);
      if (!page) return [];

      const image = findImage(page.gallery, pick.imageKey);
      if (!image) return [];

      return [
        {
          id: image.id,
          title: image.title,
          description: image.description,
          imageSrc: image.src,
          imageAlt: image.altText,
          aspectRatio: image.aspectRatio,
          ideaTitle: page.content.headline,
          href: `/ideas/${page.slug}`,
        },
      ];
    }),
  }));
}

export default function ExamplesFromBrickex() {
  return <ExamplesFromBrickexTabs groups={buildGroups()} />;
}
