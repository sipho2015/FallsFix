// Request categories; actual assignment coverage is controlled in the database.
export const services = [
  {
    slug: "electrical",
    name: "Electrical",
    group: "Repairs",
    description:
      "Lighting, sockets, wiring faults, and electrical installations.",
  },
  {
    slug: "plumbing",
    name: "Plumbing",
    group: "Repairs",
    description: "Leaking taps, blocked drains, pipework, and water fittings.",
  },
  {
    slug: "air-conditioning",
    name: "Air conditioning & refrigeration",
    group: "Repairs",
    description: "Cooling problems, servicing, and installation assessments.",
  },
  {
    slug: "appliance-repair",
    name: "Appliance repair",
    group: "Repairs",
    description:
      "Help with washing machines, cookers, and household appliances.",
  },
  {
    slug: "carpentry",
    name: "Carpentry",
    group: "Home care",
    description: "Doors, cupboards, shelving, and practical woodwork repairs.",
  },
  {
    slug: "painting",
    name: "Painting",
    group: "Home care",
    description: "Interior and exterior painting, preparation, and touch-ups.",
  },
  {
    slug: "cleaning",
    name: "Cleaning",
    group: "Home care",
    description: "Home, office, and property cleaning for a fresh start.",
  },
  {
    slug: "gardening",
    name: "Gardening",
    group: "Home care",
    description: "Garden tidy-ups, lawn care, and outdoor maintenance.",
  },
  {
    slug: "security",
    name: "CCTV & security installation",
    group: "Technology",
    description: "Camera installations and security-equipment assessments.",
  },
  {
    slug: "it-support",
    name: "Computer & IT support",
    group: "Technology",
    description: "Computer setup, troubleshooting, and connectivity problems.",
  },
  {
    slug: "electronics",
    name: "Phone & electronics repair",
    group: "Technology",
    description:
      "Fault assessment and repairs for phones and everyday electronics.",
  },
  {
    slug: "handyman",
    name: "General handyman",
    group: "Home care",
    description: "Small fixes, fittings, and the jobs on your to-do list.",
  },
] as const;

export type Service = (typeof services)[number];
