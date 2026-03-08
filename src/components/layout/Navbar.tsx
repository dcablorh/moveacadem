import { Link, useLocation } from "react-router-dom";
import { ConnectButton, useCurrentAccount } from "@mysten/dapp-kit";
import { BookOpen, Trophy, Plus, User, Home, GraduationCap, BarChart2, Menu, X, ArrowRight, ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useState, useRef, useEffect } from "react";

export function Navbar() {
  const account = useCurrentAccount();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Close dropdown on route change
  useEffect(() => {
    setMoreOpen(false);
    setMobileOpen(false);
  }, [location.pathname]);

  const mainLinks = [
    { to: "/", label: "Home", icon: Home },
    { to: "/courses", label: "Courses", icon: BookOpen },
  ];

  const createLink = account ? { to: "/create", label: "Create", icon: Plus } : null;

  const moreLinks = account ? [
    { to: "/my-learning", label: "My Learning", icon: GraduationCap },
    { to: "/certificates", label: "Certificates", icon: Trophy },
    { to: "/analytics", label: "Analytics", icon: BarChart2 },
    { to: "/profile", label: "Profile", icon: User },
  ] : [];

  const allLinks = [...mainLinks, ...(createLink ? [createLink] : []), ...moreLinks];

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  const moreHasActive = moreLinks.some((l) => isActive(l.to));

  return (
    <nav className="sticky top-0 z-50 border-b-2 border-border bg-card">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border-2 border-border bg-primary shadow-brutal-sm">
            <BookOpen className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="hidden font-display text-sm font-bold uppercase tracking-tight text-foreground sm:block">
            Move Academy
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-1 md:flex">
          {mainLinks.map((link) => (
            <NavItem key={link.to} {...link} active={isActive(link.to)} />
          ))}
          {createLink && <NavItem {...createLink} active={isActive(createLink.to)} />}

          {/* More dropdown */}
          {moreLinks.length > 0 && (
            <div className="relative" ref={moreRef}>
              <button
                onClick={() => setMoreOpen(!moreOpen)}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold uppercase tracking-wide transition-all ${
                  moreHasActive
                    ? "border-2 border-border bg-primary text-primary-foreground shadow-brutal-sm"
                    : "border-2 border-transparent text-muted-foreground hover:border-border hover:bg-muted hover:shadow-brutal-sm"
                }`}
              >
                More
                <ChevronDown className={`h-3 w-3 transition-transform ${moreOpen ? "rotate-180" : ""}`} />
              </button>

              <AnimatePresence>
                {moreOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.1 }}
                    className="absolute right-0 top-full mt-1 w-48 rounded-lg border-2 border-border bg-card shadow-brutal-sm z-50 overflow-hidden"
                  >
                    {moreLinks.map((link) => (
                      <Link
                        key={link.to}
                        to={link.to}
                        className={`flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold uppercase tracking-wide transition-all ${
                          isActive(link.to)
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        }`}
                      >
                        <link.icon className="h-3.5 w-3.5" />
                        {link.label}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <ConnectButton />
          <button
            className="flex h-8 w-8 items-center justify-center rounded-lg border-2 border-border bg-card text-foreground shadow-brutal-sm transition-all hover:bg-muted active:shadow-none active:translate-x-0.5 active:translate-y-0.5 md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden border-t-2 border-border bg-card md:hidden"
          >
            <div className="container mx-auto px-4 py-3">
              <div className="flex flex-col gap-1">
                {allLinks.map((link) => (
                  <MobileNavItem
                    key={link.to}
                    {...link}
                    active={isActive(link.to)}
                    onClick={() => setMobileOpen(false)}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

function NavItem({ to, label, icon: Icon, active }: { to: string; label: string; icon: any; active: boolean }) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold uppercase tracking-wide transition-all ${
        active
          ? "border-2 border-border bg-primary text-primary-foreground shadow-brutal-sm"
          : "border-2 border-transparent text-muted-foreground hover:border-border hover:bg-muted hover:shadow-brutal-sm"
      }`}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </Link>
  );
}

function MobileNavItem({ to, label, icon: Icon, active, onClick }: { to: string; label: string; icon: any; active: boolean; onClick: () => void }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`flex items-center gap-3 border-2 px-4 py-3 text-sm font-bold uppercase tracking-wide transition-all ${
        active
          ? "border-border bg-primary text-primary-foreground shadow-brutal-sm"
          : "border-transparent text-muted-foreground hover:border-border hover:bg-muted"
      }`}
    >
      <Icon className="h-4 w-4" />
      {label}
      {active && <ArrowRight className="ml-auto h-4 w-4" />}
    </Link>
  );
}
