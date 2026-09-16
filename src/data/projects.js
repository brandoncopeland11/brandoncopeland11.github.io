import collectionAdsThumbnail from "../../case-studies/project-one/thumbnail-default.png";
import collectionAdsHover from "../../case-studies/project-one/thumbnail-hover.png";
import addToListThumbnail from "../../case-studies/project-two/images/thumbnail-default.png";
import addToListHover from "../../case-studies/project-two/images/thumbnail-hover.png";
import scoreSubmissionThumbnail from "../../case-studies/project-three/thumbnail-default.webp";
import flyerSwipingThumbnail from "../../case-studies/project-four/thumbnail-default.webp";
import fusionPlayThumbnail from "../../case-studies/project-five/thumbnail-default.webp";

const flippLogo = "/assets/logos/flipp.png";
const innosoftLogo = "/assets/logos/innosoft.png";

/**
 * Case studies shown in the masonry/bento grid and used to drive the
 * "next project" navigation at the bottom of each case study page.
 * Order here is the canonical project order (and the cycle order).
 * size: "feature" (big, top-left) | "wide-tall" | "tall" | "wide" | "default"
 * featured: shows a "Featured" tag on the tile.
 * method, device, type: shown under the title, separated by ·
 * image / imageHover: thumbnail pair for default and hover states.
 * imagePosition: object-position for the thumbnail (e.g. "top").
 * openInNewTab: work card opens in a new tab.
 * includeInNextProject: false omits the item from case study "next project" links.
 */
export const projects = [
  {
    title: "Replaced legacy banners with shoppable ads",
    company: "Flipp",
    logo: flippLogo,
    year: "2024",
    method: "Product design",
    device: "Mobile",
    type: "Case study",
    href: "/case-studies/collection-ads/",
    headerImage: "/case-studies/project-one/thumbnail-default.png",
    size: "feature",
    featured: true,
    image: collectionAdsThumbnail,
    imageHover: collectionAdsHover,
    imageAlt:
      "Flipp Collection Ads: Search and Browse in-feed ad units with shoppable carousel",
  },
  {
    title: "Unified add to list across the app",
    company: "Flipp",
    logo: flippLogo,
    year: "2025",
    method: "Product design",
    device: "Mobile",
    type: "Case study",
    href: "/case-studies/add-to-list-ux/",
    headerImage: "/case-studies/project-two/images/Intro1.png",
    size: "default",
    image: addToListThumbnail,
    imageHover: addToListHover,
    imageAlt: "Flipp add to list UX: search results and flyer add-to-list flows",
  },
  {
    title: "Reduced score entry friction",
    company: "Fusion",
    logo: innosoftLogo,
    year: "",
    method: "Product design",
    device: "Tablet",
    type: "Case study",
    href: "https://dribbble.com/shots/22528454-Efficient-score-submission",
    openInNewTab: true,
    includeInNextProject: false,
    headerColor: "#2b2233",
    size: "default",
    image: scoreSubmissionThumbnail,
    imageAlt: "Fusion efficient score submission: tablet scoring interface",
  },
  {
    title: "Increased cross-browse adoption by 9%",
    company: "Flipp",
    logo: flippLogo,
    year: "",
    method: "Product design",
    device: "Strategy",
    type: "Case study",
    href: "/case-studies/flyer-swiping/",
    headerImage: "/case-studies/project-four/thumbnail-default.webp",
    image: flyerSwipingThumbnail,
    imageAlt: "Flipp flyer swiping case study cover image.",
    headerColor: "#1f2b26",
    size: "default",
  },
  {
    title: "Launched a 0-to-1 product to 30k+ users",
    company: "Fusion",
    logo: innosoftLogo,
    year: "",
    method: "Product design",
    device: "0-1 Research",
    type: "Case study",
    href: "https://dribbble.com/shots/21099716-Case-Study-Fusion-Play-Product-Overview",
    openInNewTab: true,
    includeInNextProject: false,
    headerColor: "#2b2730",
    size: "wide",
    image: fusionPlayThumbnail,
    imageAlt: "Fusion Play product overview cover image",
    imagePosition: "top",
  },
];
