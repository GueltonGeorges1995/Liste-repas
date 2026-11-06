"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/", label: "Planning" },
  { href: "/courses", label: "Courses" },
];

export function Nav() {
  const pathname = usePathname();
  return (
    <nav className="sticky bottom-0 grid grid-cols-2 border-t border-foreground/15 bg-background">
      {tabs.map(({ href, label }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`py-4 text-center text-base font-medium ${active ? "text-foreground" : "text-foreground/50"}`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
