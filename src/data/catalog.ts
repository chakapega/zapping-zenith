import type { ImageMetadata } from 'astro';

import zakladnye_detali from './catalog/zakladnye_detali.json';
import vozduhovody from './catalog/vozduhovody.json';
import fasadnye_metallokassety from './catalog/fasadnye_metallokassety.json';
import metallocherepitsa from './catalog/metallocherepitsa.json';
import mrt from './catalog/mrt.json';
import maf from './catalog/maf.json';

type RawCatalogItem = {
  slug: string;
  title: string;
  img: string;
  products?: RawCatalogItem[];
  hasContent?: boolean;
};

export type CatalogItem = {
  slug: string;
  title: string;
  img: ImageMetadata;
  products?: CatalogItem[];
  hasContent?: boolean;
};

const rawCatalog: RawCatalogItem[] = [
  zakladnye_detali,
  vozduhovody,
  fasadnye_metallokassety,
  // metallocherepitsa,
  mrt,
  // maf
]

const imageModules = import.meta.glob<{ default: ImageMetadata }>(
  '../assets/images/catalog/**/*.{png,jpg,jpeg,webp,gif}',
  { eager: true },
);

const imageMap: Record<string, ImageMetadata> = {};

for (const path in imageModules) {
  const meta = imageModules[path].default;
  const filename = path.split('/').pop() ?? '';
  const withoutExt = filename.replace(/\.[^.]+$/, '');

  if (filename) {
    imageMap[filename] = meta;
    imageMap[withoutExt] = meta;
    
    const relativePath = path.split('/assets/images/catalog/')[1];
    if (relativePath) {
      imageMap[relativePath] = meta;
    }
  }
}

function mapItem(raw: RawCatalogItem): CatalogItem {
  return {
    slug: raw.slug,
    title: raw.title,
    // В JSON можно указывать либо "project1", либо "project1.jpg"
    img: imageMap[raw.img],
    products: (raw.products ?? []).map(mapItem),
    hasContent: raw.hasContent
  };
}

export const rootCatalogItems: CatalogItem[] = rawCatalog.map(mapItem);

export function findItemBySlugs(slugs: string[]): CatalogItem | null {
  if (!slugs.length) return null;

  let currentLevel: CatalogItem[] | undefined = rootCatalogItems;
  let current: CatalogItem | undefined;

  for (const slug of slugs) {
    if (!currentLevel) return null;
    current = currentLevel.find((item) => item.slug === slug);
    if (!current) return null;
    currentLevel = current.products;
  }

  return current ?? null;
}

