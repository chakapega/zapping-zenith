import type { ImageMetadata } from 'astro';
import rawCatalog from './catalog.json';

type RawCatalogItem = {
  slug: string;
  title: string;
  img: string;
  products?: RawCatalogItem[];
};

export type CatalogItem = {
  slug: string;
  title: string;
  img: ImageMetadata;
  products: CatalogItem[];
};

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


for (const path in imageModules) {
  const meta = imageModules[path].default;
  const filename = path.split('/').pop() ?? '';
  const withoutExt = filename.replace(/\.[^.]+$/, '');

  if (filename) {
    imageMap[filename] = meta;
    imageMap[withoutExt] = meta;
  }
}

function mapItem(raw: RawCatalogItem): CatalogItem {
  return {
    slug: raw.slug,
    title: raw.title,
    // В JSON можно указывать либо "project1", либо "project1.jpg"
    img: imageMap[raw.img],
    products: (raw.products ?? []).map(mapItem),
  };
}

const rawData = rawCatalog as RawCatalogItem[];

export const rootCatalogItems: CatalogItem[] = rawData.map(mapItem);

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

