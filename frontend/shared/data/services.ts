// Editorial preview only. Operational availability will come from the database.
export const services = [
  {
    slug: "electrical",
    name: "Electrical",
    group: "Repairs",
    icon: "bolt",
    description:
      "Lighting, sockets, wiring faults, and electrical installations.",
  },
  {
    slug: "plumbing",
    name: "Plumbing",
    group: "Repairs",
    icon: "drop",
    description: "Leaking taps, blocked drains, pipework, and water fittings.",
  },
  {
    slug: "air-conditioning",
    name: "Air conditioning & refrigeration",
    group: "Repairs",
    icon: "snow",
    description: "Cooling problems, servicing, and installation assessments.",
  },
  {
    slug: "appliance-repair",
    name: "Appliance repair",
    group: "Repairs",
    icon: "appliance",
    description:
      "Help with washing machines, cookers, and household appliances.",
  },
  {
    slug: "carpentry",
    name: "Carpentry",
    group: "Home care",
    icon: "tool",
    description: "Doors, cupboards, shelving, and practical woodwork repairs.",
  },
  {
    slug: "painting",
    name: "Painting",
    group: "Home care",
    icon: "paint",
    description: "Interior and exterior painting, preparation, and touch-ups.",
  },
  {
    slug: "cleaning",
    name: "Cleaning",
    group: "Home care",
    icon: "sparkle",
    description: "Home, office, and property cleaning for a fresh start.",
  },
  {
    slug: "gardening",
    name: "Gardening",
    group: "Home care",
    icon: "leaf",
    description: "Garden tidy-ups, lawn care, and outdoor maintenance.",
  },
  {
    slug: "security",
    name: "CCTV & security installation",
    group: "Technology",
    icon: "shield",
    description: "Camera installations and security-equipment assessments.",
  },
  {
    slug: "it-support",
    name: "Computer & IT support",
    group: "Technology",
    icon: "computer",
    description: "Computer setup, troubleshooting, and connectivity problems.",
  },
  {
    slug: "electronics",
    name: "Phone & electronics repair",
    group: "Technology",
    icon: "phone",
    description:
      "Fault assessment and repairs for phones and everyday electronics.",
  },
  {
    slug: "handyman",
    name: "General handyman",
    group: "Home care",
    icon: "tool",
    description: "Small fixes, fittings, and the jobs on your to-do list.",
  },
] as const;

export type Service = (typeof services)[number];
export type ServiceIconName = Service["icon"];
