"use client";

import { useState } from "react";
import { services } from "@/shared/data/services";
import { ServiceCard } from "@/frontend/components/service-card";

const groups = ["All services", "Repairs", "Home care", "Technology"] as const;

export function ServiceCatalogue() {
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState<string>("All services");
  const matches = services.filter(
    (service) =>
      (group === "All services" || service.group === group) &&
      `${service.name} ${service.description}`
        .toLowerCase()
        .includes(query.trim().toLowerCase()),
  );

  return (
    <section aria-labelledby="catalogue-title">
      <h2 id="catalogue-title" className="sr-only">
        Explore services
      </h2>
      <div className="catalogue-toolbar">
        <div className="filter-buttons" aria-label="Filter by service group">
          {groups.map((item) => (
            <button
              key={item}
              type="button"
              aria-pressed={group === item}
              onClick={() => setGroup(item)}
            >
              {item}
            </button>
          ))}
        </div>
        <div className="service-search">
          <label htmlFor="service-search">Find a service</label>
          <input
            id="service-search"
            type="search"
            placeholder="Try plumbing or cleaning"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
      </div>
      <p className="result-count" role="status">
        {matches.length} {matches.length === 1 ? "service" : "services"}
      </p>
      {matches.length ? (
        <div className="service-grid">
          {matches.map((service) => (
            <ServiceCard key={service.slug} service={service} />
          ))}
        </div>
      ) : (
        <div className="notice-panel">
          <h3>No matching services</h3>
          <p>Try a different word, or explore the full catalogue.</p>
          <button
            className="button"
            onClick={() => {
              setQuery("");
              setGroup("All services");
            }}
          >
            Clear filters
          </button>
        </div>
      )}
    </section>
  );
}
