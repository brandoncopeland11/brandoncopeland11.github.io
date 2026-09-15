import collectionAdsThumbnail from "../../case-studies/project-one/thumbnail-default.png";
import collectionAdsHover from "../../case-studies/project-one/thumbnail-hover.png";
import addToListThumbnail from "../../case-studies/project-two/images/thumbnail-default.png";
import addToListHover from "../../case-studies/project-two/images/thumbnail-hover.png";
import flyerSwipingThumbnail from "../../case-studies/project-four/thumbnail-default.webp";

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
 */
export const projects = [
  {
    title: "In-App Collection Ads",
    company: "Flipp",
    logo: flippLogo,
    year: "2024",
    method: "Product design",
    device: "Mobile",
    type: "Case study",
    href: "/case-studies/project-one.html",
    headerImage: "/case-studies/project-one/thumbnail-default.png",
    size: "feature",
    featured: true,
    image: collectionAdsThumbnail,
    imageHover: collectionAdsHover,
    imageAlt:
      "Flipp Collection Ads: Search and Browse in-feed ad units with shoppable carousel",
  },
  {
    title: "Add to list UX",
    company: "Flipp",
    logo: flippLogo,
    year: "2025",
    method: "Product design",
    device: "Mobile",
    type: "Case study",
    href: "/case-studies/project-two.html",
    headerImage: "/case-studies/project-two/images/Intro1.png",
    size: "default",
    image: addToListThumbnail,
    imageHover: addToListHover,
    imageAlt: "Flipp add to list UX: search results and flyer add-to-list flows",
  },
  {
    title: "Efficient score submission",
    company: "Fusion",
    logo: innosoftLogo,
    year: "",
    method: "Product design",
    device: "Tablet",
    type: "Case study",
    href: "/case-studies/project-three.html",
    headerColor: "#2b2233",
    size: "default",
  },
  {
    title: "Flyer swiping (9% growth adoption)",
    company: "Flipp",
    logo: flippLogo,
    year: "",
    method: "Product design",
    device: "Strategy",
    type: "Case study",
    href: "/case-studies/project-four.html",
    headerImage: "/case-studies/project-four/thumbnail-default.webp",
    image: flyerSwipingThumbnail,
    imageAlt: "Flipp flyer swiping case study cover image.",
    headerColor: "#1f2b26",
    size: "default",
  },
  {
    title: "Coming soon",
    placeholderLabel: "Coming soon",
    isNavigable: false,
    href: "/case-studies/project-five.html",
    headerColor: "#2b2730",
    size: "wide",
  },
];
