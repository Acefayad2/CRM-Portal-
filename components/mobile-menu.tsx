"use client";

import { cn } from "@/lib/utils";
import * as Dialog from "@radix-ui/react-dialog";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface MobileMenuProps {
  className?: string;
}

export const MobileMenu = ({ className }: MobileMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { name: "Features", href: "/#features" },
    { name: "Pricing", href: "/pricing" },
    { name: "Support", href: "/support" },
    { name: "Contact", href: "/contact" },
  ];

  const handleLinkClick = () => {
    setIsOpen(false);
  };

  return (
    <Dialog.Root modal={false} open={isOpen} onOpenChange={setIsOpen}>
      <Dialog.Trigger asChild>
        <button className={cn("group p-2 text-foreground transition-colors lg:hidden", className)} aria-label="Open menu">
          <Menu className="group-[[data-state=open]]:hidden" size={24} />
          <X className="hidden group-[[data-state=open]]:block" size={24} />
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <div data-overlay="true" className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm" />
        <Dialog.Content
          onInteractOutside={(e) => {
            if (e.target instanceof HTMLElement && e.target.dataset.overlay !== "true") {
              e.preventDefault();
            }
          }}
          className="fixed top-0 left-0 z-40 w-full py-28 md:py-40"
        >
          <Dialog.Title className="sr-only">Menu</Dialog.Title>

          <nav className="container mx-auto flex flex-col space-y-6">
            {menuItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={handleLinkClick}
                className="py-2 font-mono text-xl uppercase text-foreground/60 transition-colors duration-150 ease-out hover:text-foreground/100"
              >
                {item.name}
              </Link>
            ))}

            <div className="mt-6">
              <Link
                href="/auth/login"
                onClick={handleLinkClick}
                className="inline-block py-2 font-mono text-xl uppercase text-primary transition-colors duration-150 ease-out hover:text-primary/80"
              >
                Portal
              </Link>
            </div>
          </nav>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
