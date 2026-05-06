"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { Pill } from "./pill";
import { Button } from "./ui/button";
import { useState } from "react";
import { WebGLErrorBoundary } from "./webgl-error-boundary";

const GL = dynamic(() => import("./gl").then((mod) => mod.GL), { ssr: false });

export function Hero() {
  const [hovering, setHovering] = useState(false);

  return (
    <div className="relative flex h-svh flex-col justify-between overflow-hidden">
      <WebGLErrorBoundary
        fallback={<div className="pointer-events-none fixed inset-0 -z-10 bg-gradient-to-b from-black via-[#050508] to-black" aria-hidden />}
      >
        <GL hovering={hovering} />
      </WebGLErrorBoundary>
      <div className="relative mt-auto pb-16 text-center">
        <Pill className="mb-6">PANTHEON</Pill>
        <h1 className="font-sentient text-5xl sm:text-6xl md:text-7xl">
          The operating system for <br />
          <i className="font-light">modern</i> sales teams
        </h1>
        <p className="mx-auto mt-6 max-w-[520px] font-mono text-sm text-primary sm:text-base">Protect today. Grow tomorrow.</p>
        <p className="mx-auto mt-6 max-w-[500px] text-balance font-mono text-sm text-foreground/60 sm:text-base">
          Manage your pipeline, calendars, scripts, meetings, team collaboration, and follow-up workflows in one secure Pantheon workspace.
        </p>

        <div className="mt-14 flex items-center justify-center gap-4">
          <Link className="contents max-sm:hidden" href="/#features">
            <Button
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              onMouseEnter={() => setHovering(true)}
              onMouseLeave={() => setHovering(false)}
            >
              [Start Free]
            </Button>
          </Link>
          <Link className="contents max-sm:hidden" href="/#demo">
            <Button
              variant="outline"
              className="border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white"
              onMouseEnter={() => setHovering(true)}
              onMouseLeave={() => setHovering(false)}
            >
              [Book a Demo]
            </Button>
          </Link>
          <Link className="contents sm:hidden" href="/#features">
            <Button
              size="sm"
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              onMouseEnter={() => setHovering(true)}
              onMouseLeave={() => setHovering(false)}
            >
              [Start Free]
            </Button>
          </Link>
          <Link className="contents sm:hidden" href="/#demo">
            <Button
              size="sm"
              variant="outline"
              className="border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white"
              onMouseEnter={() => setHovering(true)}
              onMouseLeave={() => setHovering(false)}
            >
              [Book a Demo]
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
