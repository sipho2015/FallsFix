import Image from "next/image";

export function BrandLogo({ hero = false }: { hero?: boolean }) {
  return (
    <Image
      src="/images/fallsfix-logo.png"
      alt="FallsFix — Local services, real solutions"
      width={1774}
      height={887}
      sizes={hero ? "(max-width: 760px) 90vw, 550px" : "(max-width: 550px) 180px, 220px"}
      loading="eager"
      className="brand-logo"
    />
  );
}
