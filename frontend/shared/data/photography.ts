import photographs from "./photography.json";

export { photographs };

export function photoFor(subject: string) {
  return (
    photographs.find((photo) => photo.slug === subject) ??
    photographs.find((photo) => photo.slug === "coordination")!
  );
}
