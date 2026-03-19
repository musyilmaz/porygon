"use client";

import type { ComponentProps } from "react";

export function ScrollLink({ href, onClick, ...props }: ComponentProps<"a">) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (href?.startsWith("#")) {
      const id = href.slice(1);
      const element = id ? document.getElementById(id) : null;
      if (element) {
        e.preventDefault();
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
    onClick?.(e);
  };

  return <a href={href} onClick={handleClick} {...props} />;
}
