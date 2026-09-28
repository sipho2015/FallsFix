import type { Prisma } from "../generated/prisma/client";
import { services } from "../data/services";

export async function seedReferenceData(database: Prisma.TransactionClient) {
  await database.serviceArea.upsert({
    where: { slug: "victoria-falls" },
    update: {},
    create: {
      slug: "victoria-falls",
      name: "Victoria Falls",
      countryCode: "ZW",
      timezone: "Africa/Harare",
      isActive: false,
    },
  });
  for (const service of services) {
    await database.serviceCategory.upsert({
      where: { slug: service.slug },
      update: {},
      create: {
        slug: service.slug,
        name: service.name,
        description: service.description,
        isActive: false,
      },
    });
  }
}
