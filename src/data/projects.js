import addToListThumbnail from "../../case-studies/project-two/images/thumbnail-default.png";
import addToListHover from "../../case-studies/project-two/images/thumbnail-hover.png";

const flippLogo = "/assets/logos/flipp.png";
const innosoftLogo = "/assets/logos/innosoft.png";
const trapezeLogo = "/assets/logos/trapeze.svg";
const lawlabsLogo = "/assets/logos/lawlabs.png";

/**
 * Case studies shown in the masonry/bento grid and used to drive the
 * "next project" navigation at the bottom of each case study page.
 * Order here is the canonical project order (and the cycle order).
 * size: "feature" (big, top-left) | "wide-tall" | "tall" | "wide" | "default"
 * featured: shows a "Featured" tag on the tile.
 * year, method, device, type: shown under the title, separated by ·
 * image / imageHover: thumbnail pair for default and hover states.
 */
export const projects = [
  {
    title: "Project One",
    company: "Flipp",
    logo: flippLogo,
    year: "2024",
    method: "Product design",
    device: "Mobile",
    type: "Case study",
    href: "/case-studies/project-one.html",
    size: "feature",
    featured: true,
  },
  {
    title: "Add to list UX",
    company: "Flipp",
    logo: flippLogo,
    year: "2025",
    method: "UX research",
    device: "Mobile",
    type: "Case study",
    href: "/case-studies/project-two.html",
    size: "default",
    image: addToListThumbnail,
    imageHover: addToListHover,
    imageAlt: "Flipp add to list UX — search results and flyer add-to-list flows",
  },
  {
    title: "Project Three",
    company: "InnoSoft Canada",
    logo: innosoftLogo,
    year: "2024",
    method: "Product design",
    device: "Desktop",
    type: "UI",
    href: "/case-studies/project-three.html",
    size: "default",
  },
  {
    title: "Project Four",
    company: "Trapeze",
    logo: trapezeLogo,
    logoClass: "work-card__logo--trapeze",
    year: "2023",
    method: "UX research",
    device: "Desktop",
    type: "Case study",
    href: "/case-studies/project-four.html",
    size: "default",
  },
  {
    title: "Project Five",
    company: "LawLabs",
    logo: lawlabsLogo,
    year: "2024",
    method: "Product design",
    device: "Mobile",
    type: "UI",
    href: "/case-studies/project-five.html",
    size: "wide",
  },
];
