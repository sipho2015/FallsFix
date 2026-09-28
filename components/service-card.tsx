import Link from "next/link";
import type { Service } from "@/data/services";
import { ServiceIcon } from "@/components/service-icon";

export function ServiceCard({ service }: { service: Service }) {
  return (
    <Link
      className="service-card"
      href={`/request-service?service=${service.slug}`}
    >
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
      <span className="service-status">Planned service</span>
    </Link>
  );
}
