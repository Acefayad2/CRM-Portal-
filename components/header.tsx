import Link from "next/link";
import { Logo } from "./logo";
import { MobileMenu } from "./mobile-menu";

export const Header = () => {
  return (
    <div className="fixed top-0 left-0 z-50 w-full pt-8 md:pt-14">
      <header className="container flex items-center justify-between">
        <Link href="/">
          <Logo className="w-[100px] md:w-[120px]" />
        </Link>
        <nav className="absolute left-1/2 flex -translate-x-1/2 items-center justify-center gap-x-10 max-lg:hidden">
          {[
            { label: "Features", href: "/#features" },
            { label: "Pricing", href: "/pricing" },
            { label: "Support", href: "/support" },
            { label: "Contact", href: "/contact" },
          ].map((item) => (
            <Link
              className="inline-block font-mono uppercase text-foreground/60 transition-colors duration-150 ease-out hover:text-foreground/100"
              href={item.href}
              key={item.label}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <Link
          className="font-mono uppercase text-primary transition-colors duration-150 ease-out hover:text-primary/80 max-lg:hidden"
          href="/auth/login"
        >
          Portal
        </Link>
        <MobileMenu />
      </header>
    </div>
  );
};
