import Image from "next/image";
import { photoFor } from "@/shared/data/photography";

export function ContextPhoto({
  subject,
  caption,
  className = "",
}: {
  subject: string;
  caption?: string;
  className?: string;
}) {
  const photo = photoFor(subject);
  return (
    <figure className={`context-photo ${className}`}>
      <Image
        src={photo.src}
        alt={photo.alt}
        width={1440}
        height={960}
        sizes="(max-width: 700px) 92vw, 55vw"
      />
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  );
}
