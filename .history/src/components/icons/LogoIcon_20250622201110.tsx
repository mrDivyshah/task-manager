import Image from "next/image";
import type { SVGProps } from "react";

export function LogoIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Image src={"taskflow.svg"} alt="Taskflow Logo" width={32} height={32} />
  );
}
