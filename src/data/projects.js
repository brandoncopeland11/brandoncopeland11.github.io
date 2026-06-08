import addToListThumbnail from "../../case-studies/project-two/images/Intro1.png";
import flippLogo from "../assets/logos/flipp.png";
import innosoftLogo from "../assets/logos/innosoft.png";
import trapezeLogo from "../assets/logos/trapeze.svg";
import lawlabsLogo from "../assets/logos/lawlabs.png";

/**
 * Case studies shown in the masonry/bento grid and used to drive the
 * "next project" navigation at the bottom of each case study page.
 * Order here is the canonical project order (and the cycle order).
 * size: "feature" (big, top-left) | "wide-tall" | "tall" | "wide" | "default"
 * featured: shows a "Featured" tag on the tile.
 * type: short label shown under the title (e.g. "Case study", "UI focus").
 */
export const projects = [
  {
    title: "Project One",
    company: "Flipp",
    logo: flippLogo,
    type: "Case study",
    href: "/case-studies/project-one.html",
    size: "feature",
    featured: true,
  },
  {
    title: "Add to list UX",
    company: "Flipp",
    logo: flippLogo,
    type: "Case study",
    href: "/case-studies/project-two.html",
    size: "default",
    image: addToListThumbnail,
    imageAlt: "Flipp add to list UX case study mobile screen collage",
  },
  {
    title: "Project Three",
    company: "InnoSoft Canada",
    logo: innosoftLogo,
    type: "UI focus",
    href: "/case-studies/project-three.html",
    size: "default",
  },
  {
    title: "Project Four",
    company: "Trapeze",
    logo: trapezeLogo,
    logoClass: "work-card__logo--trapeze",
    type: "Research project",
    href: "/case-studies/project-four.html",
    size: "tall",
  },
  {
    title: "Project Five",
    company: "LawLabs",
    logo: lawlabsLogo,
    type: "UI focus",
    href: "/case-studies/project-five.html",
    size: "wide-tall",
  },
];
