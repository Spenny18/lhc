// Curated hero images for neighbourhood pages, applied to the runtime DB on
// boot by applyNeighbourhoodImages(). Photos are CC-licensed (attribution in
// heroCredit) and self-hosted under client/public/img/neighbourhoods/. Owned or
// stock photos leave heroCredit null. Only replaces the old stock/AI heroes
// (Unsplash / luxuryhomescalgary.ca) or a prior curated image, so a CMS edit to
// a different source is never clobbered.
import { storage } from "./storage";

export interface NbImageCredit {
  author: string;
  authorUrl?: string;
  license: string; // e.g. "CC BY 2.0"
  licenseUrl: string;
  sourceUrl: string;
}

export interface NbImage {
  slug: string;
  heroImage: string; // e.g. "/img/neighbourhoods/bel-aire.jpg"
  heroCredit: NbImageCredit | null;
}

export const neighbourhoodImages: NbImage[] = [
  {
    slug: "bel-aire",
    heroImage: "/img/neighbourhoods/bel-aire.jpg",
    heroCredit: {
      author: "Daniel from Glasgow, United Kingdom",
      authorUrl: "https://www.flickr.com/people/57511216@N04",
      license: "CC BY 2.0",
      licenseUrl: "https://creativecommons.org/licenses/by/2.0/",
      sourceUrl: "https://commons.wikimedia.org/w/index.php?curid=68531052",
    },
  },
  {
    // Eau Claire — Peace Bridge over the Bow River, downtown skyline behind.
    slug: "eau-claire",
    heroImage: "/img/neighbourhoods/eau-claire.jpg",
    heroCredit: {
      author: "Yolanda Lie (Likeliehood)",
      authorUrl: "https://commons.wikimedia.org/wiki/User:Likeliehood",
      license: "CC BY-SA 4.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
      sourceUrl: "https://commons.wikimedia.org/w/index.php?curid=82344032",
    },
  },
  {
    // Woodbine — autumn aspen forest in adjacent Fish Creek Provincial Park (CC0).
    slug: "woodbine",
    heroImage: "/img/neighbourhoods/woodbine.jpg",
    heroCredit: null,
  },
  {
    // Oakridge — Heritage Park steam railway on the Glenmore Reservoir (CC0).
    slug: "oakridge",
    heroImage: "/img/neighbourhoods/oakridge.jpg",
    heroCredit: null,
  },
  {
    slug: "elbow-park",
    heroImage: "/img/neighbourhoods/elbow-park.jpg",
    heroCredit: {
      author: "davebloggs007",
      authorUrl: "https://www.flickr.com/photos/davebloggs007/",
      license: "CC BY-SA 2.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/2.0/",
      sourceUrl: "https://commons.wikimedia.org/w/index.php?curid=89140293",
    },
  },
  {
    slug: "upper-mount-royal",
    heroImage: "/img/neighbourhoods/upper-mount-royal.jpg",
    heroCredit: {
      author: "Michael from Calgary, AB, Canada",
      authorUrl: "https://www.flickr.com/people/13907834@N00",
      license: "CC BY 2.0",
      licenseUrl: "https://creativecommons.org/licenses/by/2.0/",
      sourceUrl: "https://commons.wikimedia.org/w/index.php?curid=78806063",
    },
  },
  {
    slug: "beltline",
    heroImage: "/img/neighbourhoods/beltline.jpg",
    heroCredit: {
      author: "Realc",
      authorUrl: "https://commons.wikimedia.org/wiki/User:Realc",
      license: "CC BY-SA 4.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
      sourceUrl: "https://commons.wikimedia.org/wiki/File:Calgary_Skyline_May_2018_(cropped).jpg",
    },
  },
  {
    slug: "inglewood",
    heroImage: "/img/neighbourhoods/inglewood.jpg",
    heroCredit: null,
  },
  {
    slug: "west-hillhurst",
    heroImage: "/img/neighbourhoods/west-hillhurst.jpg",
    heroCredit: null,
  },
  {
    slug: "edgemont",
    heroImage: "/img/neighbourhoods/edgemont.jpg",
    heroCredit: {
      author: "Thank you for visiting my page from Canada",
      authorUrl: "https://www.flickr.com/people/92599451@N08",
      license: "CC BY 2.0",
      licenseUrl: "https://creativecommons.org/licenses/by/2.0/",
      sourceUrl: "https://commons.wikimedia.org/w/index.php?curid=66193715",
    },
  },
  {
    slug: "discovery-ridge",
    heroImage: "/img/neighbourhoods/discovery-ridge.jpg",
    heroCredit: {
      author: "jockrutherford",
      authorUrl: "https://www.flickr.com/people/27501268@N00",
      license: "CC BY-SA 2.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/2.0/",
      sourceUrl: "https://commons.wikimedia.org/w/index.php?curid=89140296",
    },
  },
  {
    slug: "bridgeland-riverside",
    heroImage: "/img/neighbourhoods/bridgeland-riverside.jpg",
    heroCredit: {
      author: "CocoRoux",
      authorUrl: "https://commons.wikimedia.org/w/index.php?title=User:CocoRoux&action=edit&redlink=1",
      license: "CC BY-SA 4.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
      sourceUrl: "https://commons.wikimedia.org/w/index.php?curid=59909714",
    },
  },
  {
    slug: "ramsay",
    heroImage: "/img/neighbourhoods/ramsay.jpg",
    heroCredit: {
      author: "DXR",
      authorUrl: "https://commons.wikimedia.org/wiki/User:DXR",
      license: "CC BY-SA 4.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
      sourceUrl: "https://commons.wikimedia.org/w/index.php?curid=157033685",
    },
  },
  {
    slug: "mount-pleasant",
    heroImage: "/img/neighbourhoods/mount-pleasant.jpg",
    heroCredit: {
      author: "davebloggs007",
      authorUrl: "https://www.flickr.com/people/92599451@N08",
      license: "CC BY 2.0",
      licenseUrl: "https://creativecommons.org/licenses/by/2.0/",
      sourceUrl: "https://commons.wikimedia.org/w/index.php?curid=66193741",
    },
  },
  {
    slug: "parkdale",
    heroImage: "/img/neighbourhoods/parkdale.jpg",
    heroCredit: null,
  },
  {
    slug: "hillhurst",
    heroImage: "/img/neighbourhoods/hillhurst.jpg",
    heroCredit: {
      author: "Thank you for visiting my page from Canada (Flickr)",
      authorUrl: "https://www.flickr.com/people/92599451@N08",
      license: "CC BY 2.0",
      licenseUrl: "https://creativecommons.org/licenses/by/2.0/",
      sourceUrl: "https://commons.wikimedia.org/w/index.php?curid=66194195",
    },
  },
  {
    slug: "elbow-valley",
    heroImage: "/img/neighbourhoods/elbow-valley.jpg",
    heroCredit: null,
  },
  {
    slug: "elbow-valley-west",
    heroImage: "/img/neighbourhoods/elbow-valley-west.jpg",
    heroCredit: null,
  },
  {
    slug: "harmony",
    heroImage: "/img/neighbourhoods/harmony.jpg",
    heroCredit: null,
  },
  {
    slug: "spring-creek",
    heroImage: "/img/neighbourhoods/spring-creek.jpg",
    heroCredit: null,
  },
  {
    slug: "heritage-pointe",
    heroImage: "/img/neighbourhoods/heritage-pointe.jpg",
    heroCredit: null,
  },
  {
    slug: "mckenzie-lake",
    heroImage: "/img/neighbourhoods/mckenzie-lake.jpg",
    heroCredit: null,
  },
];

// A hero we're allowed to replace: the old stock/AI sources, a prior curated
// image of ours, or an empty value. Anything else (e.g. a photo Spencer set via
// the CMS) is left alone.
function isReplaceable(url: string | null | undefined): boolean {
  if (!url) return true;
  if (url.startsWith("/img/neighbourhoods/")) return true;
  try {
    const host = new URL(url).host;
    return host === "images.unsplash.com" || host === "luxuryhomescalgary.ca";
  } catch {
    return true;
  }
}

export function applyNeighbourhoodImages(): void {
  if (!neighbourhoodImages.length) return;
  let applied = 0;
  let skipped = 0;
  for (const im of neighbourhoodImages) {
    const existing = storage.getNeighbourhoodBySlug(im.slug);
    if (!existing || !isReplaceable(existing.heroImage)) {
      skipped++;
      continue;
    }
    const creditJson = im.heroCredit ? JSON.stringify(im.heroCredit) : "";
    if (
      existing.heroImage === im.heroImage &&
      ((existing as { heroCredit?: string }).heroCredit ?? "") === creditJson
    ) {
      skipped++;
      continue;
    }
    try {
      storage.upsertNeighbourhood({
        slug: im.slug,
        heroImage: im.heroImage,
        heroCredit: creditJson,
      } as never);
      applied++;
    } catch (err) {
      console.error(`[nb-images] failed to apply ${im.slug}:`, err);
      skipped++;
    }
  }
  console.log(
    `[nb-images] applied ${applied}, skipped ${skipped} (of ${neighbourhoodImages.length})`,
  );
}
