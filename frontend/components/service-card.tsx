import Link from "next/link";
import Image from "next/image";
import type { Service } from "@/shared/data/services";
import { ServiceIcon } from "@/frontend/components/service-icon";

export function ServiceCard({ service }: { service: Service }) {
  return (
    <Link
      className="service-card"
      href={`/request-service?service=${service.slug}`}
    >
      <Image src={`/images/services/${service.slug}.webp`} alt={`${service.name} service illustration`} width={720} height={480} sizes="(max-width: 550px) 90vw, (max-width: 850px) 45vw, 30vw" className="service-photo" />
      <div className="service-card-top">
        <span className="service-icon">
          <ServiceIcon name={service.icon} />
        </span>
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
