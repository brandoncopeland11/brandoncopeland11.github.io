import profilePhoto from "../assets/profilepic.jpeg";
import collectionAdsCompare from "../../case-studies/project-one/Legacy vs Collection Ad.png";
import collectionAdsSolution from "../../case-studies/project-one/Solution.png";
import collectionAdsHover from "../../case-studies/project-one/thumbnail-hover.png";
import addToListThumbnail from "../../case-studies/project-two/images/thumbnail-default.png";
import flyerSwipingThumbnail from "../../case-studies/project-four/thumbnail-default.webp";
import fusionPlayThumbnail from "../../case-studies/project-five/thumbnail-default.webp";

const flippLogo = "/assets/logos/flipp.png";
const innosoftLogo = "/assets/logos/innosoft.png";
const linkedinLogoPath =
  "M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.61 0 4.27 2.38 4.27 5.47v6.27ZM5.33 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13Zm1.78 13.02H3.55V9h3.56v11.45ZM22.23 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.46c.98 0 1.77-.77 1.77-1.72V1.72C24 .77 23.21 0 22.23 0Z";

const COLLECTION_ADS = "/case-studies/collection-ads/";
const ADD_TO_LIST = "/case-studies/add-to-list-ux/";
const FLYER_SWIPING = "/case-studies/flyer-swiping/";

/**
 * "Get to know me in 2 mins" story slides.
 * kind: "intro" | "stats" | "pillars" | "timeline" | "case" | "outro"
 * duration: seconds the slide stays up before auto-advancing.
 * colors: three background glow colours the story blends between.
 * chapter: short label shown in the story header.
 * links: deep links into case study sections (or anywhere else).
 */
export const storySlides = [
  {
    id: "hello",
    kind: "intro",
    chapter: "Hello",
    duration: 9,
    colors: ["#a78bfa", "#f472b6", "#38bdf8"],
    photo: profilePhoto,
    kicker: "Get to know me in 2 mins",
    title: "Hi, I'm Brandon",
    body: "A Lead Product Designer at Flipp with 12 years of experience turning messy, ambiguous problems into shipped products that move the numbers.",
  },
  {
    id: "numbers",
    kind: "stats",
    chapter: "At a glance",
    duration: 10,
    colors: ["#38bdf8", "#818cf8", "#cbe6a0"],
    kicker: "At a glance",
    title: "The short version, by the numbers.",
    stats: [
      { value: "12", label: "years designing products" },
      { value: "7", label: "years leading design" },
      { value: "5", label: "companies, from agency to in-house product" },
      { value: "4", label: "years as a developer before focusing on design" },
    ],
  },
  {
    id: "approach",
    kind: "pillars",
    chapter: "How I work",
    duration: 11,
    colors: ["#ff9466", "#f472b6", "#a78bfa"],
    kicker: "How I work",
    title: "Research first, craft always, AI where it speeds things up.",
    pillars: [
      {
        icon: "forum",
        title: "Grounded in research",
        body: "I plan and run usability studies so decisions are backed by real users, not opinions.",
      },
      {
        icon: "handshake",
        title: "Always collaborating",
        body: "I'm in constant conversation with product and engineering partners, from shaping strategy to reviewing what ships.",
      },
      {
        icon: "dashboard_customize",
        title: "Built to scale",
        body: "Design systems and component libraries that keep teams fast and products consistent.",
      },
      {
        icon: "bolt",
        title: "Prototyped in code",
        body: "Cursor and Claude help me prototype complex interactions quickly. This site is one of them.",
      },
    ],
  },
  {
    id: "career",
    kind: "timeline",
    chapter: "Career",
    duration: 12,
    colors: ["#cbe6a0", "#38bdf8", "#818cf8"],
    kicker: "Where I've been",
    title: "From web developer to leading product design.",
    body: "A front-end background means I design with implementation in mind and speak engineering's language.",
  },
  {
    id: "collection-ads-problem",
    kind: "case",
    chapter: "Case study · Flipp",
    duration: 11,
    colors: ["#38bdf8", "#a78bfa", "#f472b6"],
    logo: flippLogo,
    kicker: "Case study 1 · Collection Ads",
    title: "Static banners earned revenue, but only a 0.29% CTR.",
    body: "Flipp needed an ad format brand partners would pay more for, without hurting the flyer browsing that keeps shoppers coming back.",
    image: collectionAdsCompare,
    imageAlt: "Legacy banner ad compared with the new Collection Ads video and shoppable carousel.",
    links: [
      { label: "Read the problem", href: `${COLLECTION_ADS}#problem-heading` },
    ],
  },
  {
    id: "collection-ads-research",
    kind: "case",
    chapter: "Case study · Flipp",
    duration: 11,
    colors: ["#a78bfa", "#818cf8", "#38bdf8"],
    logo: flippLogo,
    kicker: "Case study 1 · Collection Ads",
    title: "Video plus a shoppable carousel, validated with 84 users.",
    body: "Seven unmoderated research rounds across casual, power, and browser personas shaped the guardrails: muted video by default, carousel density limits, and careful slot placement.",
    image: collectionAdsSolution,
    imageAlt: "Collection Ads in Search and Browse with video and a shoppable product carousel.",
    links: [
      { label: "See the research", href: `${COLLECTION_ADS}#research-heading` },
      { label: "See the solution", href: `${COLLECTION_ADS}#solution-heading` },
    ],
  },
  {
    id: "collection-ads-outcome",
    kind: "case",
    chapter: "Case study · Flipp",
    duration: 10,
    colors: ["#f472b6", "#ff9466", "#a78bfa"],
    logo: flippLogo,
    kicker: "Case study 1 · The result",
    title: "A native ad product that pays off for everyone.",
    stats: [
      { value: "+71%", label: "Search ARPU" },
      { value: "+32%", label: "Browse CTR" },
    ],
    image: collectionAdsHover,
    imageAlt: "Flipp Collection Ads in-feed ad units.",
    links: [
      { label: "See the outcome", href: `${COLLECTION_ADS}#outcome-heading` },
      { label: "Full case study", href: COLLECTION_ADS },
    ],
  },
  {
    id: "add-to-list",
    kind: "case",
    chapter: "Case study · Flipp",
    duration: 11,
    colors: ["#cbe6a0", "#38bdf8", "#a78bfa"],
    logo: flippLogo,
    kicker: "Case study 2 · Add to list",
    title: "57% of users added items. Only 38% ever opened their list.",
    body: "I unified add states across Search, Browse, and flyers, with feedback that shows exactly where items go and quantity controls to manage them.",
    quote: "I saw the image of the item going into the list, that's how I knew where it went.",
    image: addToListThumbnail,
    imageAlt: "Flipp add to list flows in search results and flyers.",
    links: [
      { label: "See the process", href: `${ADD_TO_LIST}#process-heading` },
      { label: "Hear from users", href: `${ADD_TO_LIST}#feedback-heading` },
    ],
  },
  {
    id: "flyer-swiping",
    kind: "case",
    chapter: "Case study · Flipp",
    duration: 11,
    colors: ["#38bdf8", "#cbe6a0", "#ff9466"],
    logo: flippLogo,
    kicker: "Case study 3 · Flyer swiping",
    title: "Flyers held 71% of session time but hadn't changed in 5 years.",
    body: "Swipe education, a next-flyer peek, and clearer pagination made it obvious there was more to browse.",
    stats: [
      { value: "+9%", label: "cross-browse adoption" },
      { value: "+44%", label: "ad clicks per user" },
    ],
    image: flyerSwipingThumbnail,
    imageAlt: "Flipp flyer swiping experience.",
    links: [
      { label: "See the design", href: `${FLYER_SWIPING}#design-heading` },
      { label: "See the outcome", href: `${FLYER_SWIPING}#outcome-heading` },
    ],
  },
  {
    id: "fusion",
    kind: "case",
    chapter: "Earlier work · InnoSoft",
    duration: 9,
    colors: ["#ff9466", "#a78bfa", "#f472b6"],
    logo: innosoftLogo,
    kicker: "Before Flipp · InnoSoft Canada",
    title: "Took a new product from first concept to 30k+ users.",
    body: "As UX Design Lead I owned research and product design for Fusion Play, plus a tablet scoring interface that made score entry faster.",
    image: fusionPlayThumbnail,
    imageAlt: "Fusion Play product overview.",
    links: [
      {
        label: "Fusion Play on Dribbble",
        href: "https://dribbble.com/shots/21099716-Case-Study-Fusion-Play-Product-Overview",
        external: true,
      },
      {
        label: "Score entry on Dribbble",
        href: "https://dribbble.com/shots/22528454-Efficient-score-submission",
        external: true,
      },
    ],
  },
  {
    id: "contact",
    kind: "outro",
    chapter: "Let's talk",
    duration: 10,
    colors: ["#a78bfa", "#f472b6", "#cbe6a0"],
    photo: profilePhoto,
    kicker: "That's me in 2 mins",
    title: "If this sounds like your team, let's talk.",
    body: "I'm happy to walk through any of this work in more depth, including the messy middle.",
    links: [
      { label: "Email me", href: "mailto:brandoncopeland11@gmail.com", icon: "alternate_email", primary: true },
      { label: "LinkedIn", href: "https://www.linkedin.com/in/brandonscopeland/", iconPath: linkedinLogoPath, external: true },
      { label: "Resume", href: "/assets/Brandon%20Copeland%20-%20Resume.pdf", icon: "download", external: true },
      { label: "Browse all work", href: "#work", icon: "grid_view" },
    ],
  },
];
