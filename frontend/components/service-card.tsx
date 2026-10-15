import Link from "next/link";
import Image from "next/image";
import type { Service } from "@/shared/data/services";
import { photoFor } from "@/shared/data/photography";

export function ServiceCard({ service }: { service: Service }) {
  const photo = photoFor(service.slug);
  return (
    <Link
      className="service-card"
      href={`/request-service?service=${service.slug}`}
    >
      <Image src={photo.src} alt={photo.alt} width={1440} height={960} sizes="(max-width: 600px) 45vw, (max-width: 850px) 45vw, 30vw" className="service-photo" />
      <div className="service-card-top">
        <span className="service-category">{service.group}</span>
        <span className="card-arrow" aria-hidden="true">
          ↗
        </span>
      </div>
      <h3>{service.name}</h3>
      <p>{service.description}</p>
      <span className="service-status">Request an assessment →</span>
    </Link>
  );
}
