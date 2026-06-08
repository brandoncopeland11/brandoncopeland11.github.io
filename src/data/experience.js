import flippLogo from "../assets/logos/flipp.png";
import lawlabsLogo from "../assets/logos/lawlabs.png";
import innosoftLogo from "../assets/logos/innosoft.png";
import trapezeLogo from "../assets/logos/trapeze.svg";
import brandAndMortarLogo from "../assets/logos/brand-and-mortar.png";

/**
 * Work history — logos in /src/assets/logos/
 */
export const experience = [
  {
    company: "Flipp",
    role: "Senior Product Designer",
    years: "2023 — Present",
    logo: flippLogo,
    highlighted: true,
  },
  {
    company: "LawLabs",
    role: "UX Design Lead",
    years: "2022 — 2023",
    logo: lawlabsLogo,
  },
  {
    company: "InnoSoft Canada",
    role: "UX Design Lead",
    years: "2019 — 2022",
    logo: innosoftLogo,
  },
  {
    company: "Trapeze",
    role: "Web Developer & UX/UI Designer",
    years: "2016 — 2018",
    logo: trapezeLogo,
    logoClass: "experience-item__logo--trapeze",
  },
  {
    company: "Brand & Mortar",
    role: "Web Developer & UX/UI Designer",
    years: "2014 — 2016",
    logo: brandAndMortarLogo,
  },
];
