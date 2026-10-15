import type { ServiceIconName } from "@/shared/data/services";

const paths: Record<ServiceIconName, string> = {
  bolt: "m13 2-9 12h7l-1 8 10-13h-7l1-7Z",
  drop: "M12 3S5 11 5 15a7 7 0 0 0 14 0c0-4-7-12-7-12Z M9 16a3 3 0 0 0 3 3",
  snow: "M12 2v20M3.3 7l17.4 10M3.3 17 20.7 7M9 4l3 3 3-3M9 20l3-3 3 3",
  appliance:
    "M5 3h14v18H5z M5 7h14 M8 5h.01 M11 5h.01 M16 14a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z",
  tool: "m14 6 4-4a6 6 0 0 1-7 8L4 20a2 2 0 0 1-3-3l10-7a6 6 0 0 1 8-7l-5 3Z",
  paint: "M4 3h14v6H4z M18 6h3v7H11v8 M8 21h6",
  sparkle:
    "m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3Z M20 2v4M18 4h4",
  leaf: "M20 3C9 1 2 8 6 16c8 4 15-3 14-13Z M3 21 15 9",
  shield: "m12 2 8 4v6c0 5-8 10-8 10S4 17 4 12V6l8-4Z m-4 10 3 3 5-6",
  computer: "M3 3h18v13H3z M12 16v5M7 21h10",
  phone: "M7 2h10v20H7z M10 5h4 M11 19h2",
};

export function ServiceIcon({ name }: { name: ServiceIconName }) {
  return (
    <svg
      aria-hidden="true"
      width="26"
      height="26"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={paths[name]} />
    </svg>
  );
}
