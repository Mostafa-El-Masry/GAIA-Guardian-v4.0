"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import NoScroll from "@/components/NoScroll";
import UserDropdown from "@/components/UserDropdown";
import { useAuthSnapshot } from "@/lib/auth-client";
import { isCreatorAdmin, useCurrentPermissions } from "@/lib/permissions";
import type { PermissionKey } from "@/config/permissions";

interface NavLink {
  href: string;
  label: string;
  permission: PermissionKey;
}

/**
 * New GAIA Home (v2.0)
 * - Circular layout with links around central symbol
 * - Responsive radius based on viewport
 */
export default function HomePage() {
  const [radius] = useState<number>(280);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { profile, status } = useAuthSnapshot();
  const email = profile?.email ?? status?.email ?? null;
  const permissions = useCurrentPermissions();
  const isAdmin = useMemo(() => isCreatorAdmin(email), [email]);

  // All links in one array for circular layout
  const links: NavLink[] = [
    { href: "/gallery-awakening", label: "Gallery", permission: "gallery" },
    { href: "/apollo", label: "Apollo", permission: "apollo" },
    { href: "/ELEUTHIA", label: "ELEUTHIA", permission: "eleuthia" },
    { href: "/timeline", label: "Timeline", permission: "timeline" },
    { href: "/health-awakening", label: "Health", permission: "health" },
    { href: "/wealth-awakening", label: "Wealth", permission: "wealth" },
    { href: "/dashboard", label: "Dashboard", permission: "dashboard" },
    // Archives moved under Apollo; remove from main intro links
    { href: "/settings", label: "Settings", permission: "settings" },
  ];
  const visibleLinks = isAdmin
    ? links
    : links.filter((link) => Boolean(permissions[link.permission]));

  return (
    <main className="fixed inset-0 flex items-center justify-center no-nav">
      <NoScroll />
      <div className="absolute right-6 top-6 z-50 hidden md:block">
        <UserDropdown />
      </div>

      {/* Mobile header */}
      <div className="absolute left-0 right-0 top-0 z-50 flex items-center justify-between p-4 md:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen((open) => !open)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-black/40 text-white shadow-sm backdrop-blur transition hover:border-white/30"
          aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
        >
          <span className="sr-only">Toggle navigation</span>
          <div className="space-y-1.5">
            <span className="block h-0.5 w-6 bg-white"></span>
            <span className="block h-0.5 w-6 bg-white"></span>
            <span className="block h-0.5 w-6 bg-white"></span>
          </div>
        </button>
        <div className="flex items-center gap-2">
          <img src="/gaia-intro-1.png" alt="GAIA" className="h-10 w-auto" />
          <span className="text-sm font-semibold text-white">GAIA</span>
        </div>
        <div className="w-11" />
      </div>

      {mobileOpen && (
        <div className="absolute inset-x-4 top-16 z-40 space-y-2 rounded-2xl border border-white/10 bg-black/70 p-4 text-white shadow-lg backdrop-blur md:hidden">
          {visibleLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 px-3 py-2 text-base font-medium hover:border-emerald-300/40 hover:bg-emerald-300/10"
              onClick={() => setMobileOpen(false)}
            >
              <span>{link.label}</span>
              <span className="text-xs uppercase tracking-wide text-emerald-200">Open</span>
            </Link>
          ))}
        </div>
      )}

      <div className="relative mx-auto w-full max-w-6xl">
        {/* Circle Container (desktop/tablet) */}
        <div className="relative hidden h-[640px] sm:h-[720px] lg:h-[800px] md:block">
          {/* Centered Logo */}
          <div className="absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2">
            <img src="/gaia-intro-1.png" alt="GAIA" className="h-96 w-auto" />
          </div>

          {/* Links positioned in a circle */}
          {visibleLinks.map((link: NavLink, i: number) => {
            const angle = i * (360 / visibleLinks.length) * (Math.PI / 180);

            const rawX = radius * Math.cos(angle);
            const rawY = radius * Math.sin(angle);
            const x = rawX.toFixed(3);
            const y = rawY.toFixed(3);
            const style = {
              transform: `translate(-50%, -50%) translate(${x}px, ${y}px)`,
            };

            return (
              <Link
                key={link.href}
                href={link.href}
                className="gaia-glass octagon-link absolute left-1/2 top-1/2 w-32 px-6 py-3 text-center text-lg font-medium backdrop-blur transition whitespace-nowrap"
                style={style}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>
    </main>
  );
}
