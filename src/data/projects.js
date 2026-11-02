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
 * company, role, focus: shown under the title, separated by ·
 * image / imageHover: thumbnail pair for default and hover states.
 * imagePosition: object-position for the thumbnail (e.g. "top").
 * openInNewTab: work card opens in a new tab.
 * includeInNextProject: false omits the item from case study "next project" links.
 * description, readTime: optional; shown only in the list view.
 */
export const projects = [
  {
    title: "+71% ARPU with shoppable in-feed ads",
    company: "Flipp",
    role: "Lead Product Designer",
    focus: "Ads & Monetization",
    description:
      "Static banners earned revenue but only a 0.29% CTR. I designed a video and shoppable carousel format, validated it across 7 research rounds with 84 users, and lifted Search ARPU 71% and Browse CTR 32%.",
    readTime: "7 min read",
    logo: flippLogo,
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
    title: "Unified add to list across Search, Browse, and flyers",
    company: "Flipp",
    role: "Lead Product Designer",
    focus: "Core UX",
    description:
      "57% of monthly users added items to their list, but only 38% ever opened it. I designed consistent add states, feedback that shows where items go, and quantity controls.",
    readTime: "6 min read",
    logo: flippLogo,
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
    role: "UX Design Lead",
    focus: "Tablet UX",
    description:
      "A tablet scoring interface for Fusion, designed to make entering game scores faster and simpler.",
    logo: innosoftLogo,
    href: "https://dribbble.com/shots/22528454-Efficient-score-submission",
    openInNewTab: true,
    includeInNextProject: false,
    headerColor: "#2b2233",
    size: "default",
    image: scoreSubmissionThumbnail,
    imageAlt: "Fusion efficient score submission: tablet scoring interface",
  },
  {
    title: "+9% cross-browse adoption with swipe education",
    company: "Flipp",
    role: "Lead Product Designer",
    focus: "Growth & Engagement",
    description:
      "Flyer recommendations hold 71% of session time but hadn't changed in 5 years. I added swipe education, a next-flyer peek, and pagination that lifted cross-browse adoption 9% and cross-browse ad clicks 44% per user.",
    readTime: "3 min read",
    logo: flippLogo,
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
    role: "UX Design Lead",
    focus: "0-to-1 Product",
    description:
      "Research and product design for Fusion Play, a new product taken from first concept to launch with more than 30,000 users.",
    logo: innosoftLogo,
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
