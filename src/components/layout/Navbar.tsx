import { Link, useLocation } from "react-router-dom";
import { ConnectButton, useCurrentAccount } from "@mysten/dapp-kit";
import { BookOpen, Trophy, Plus, User, Home, GraduationCap, BarChart2, Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

export function Navbar() {
  const account = useCurrentAccount();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    { to: "/", label: "Home", icon: Home },
    { to: "/courses", label: "Courses", icon: BookOpen },
    ...(account ? [
      { to: "/my-learning", label: "My Learning", icon: GraduationCap },
      { to: "/create", label: "Create", icon: Plus },
      { to: "/analytics", label: "Analytics", icon: BarChart2 },
      { to: "/certificates", label: "Certs", icon: Trophy },
      { to: "/profile", label: "Profile", icon: User },
    ] : []),
  ];

  return (
    <nav className="sticky top-0 z-50 border-b-2 border-border bg-card">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2.5" onClick={() => setMobileOpen(false)}>
          <div className="flex h-9 w-9 items-center justify-center border-2 border-border bg-primary shadow-brutal-sm">
            <BookOpen className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-display text-lg font-bold uppercase tracking-tight text-foreground">
            Move Academy
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden items-center gap-0.5 md:flex">
          {links.map((link) => {
            const isActive = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-1.5 border-2 px-3 py-1.5 text-xs font-bold uppercase tracking-wide transition-all ${
                  isActive
                    ? "border-border bg-primary text-primary-foreground shadow-brutal-sm"
                    : "border-transparent text-muted-foreground hover:border-border hover:bg-muted hover:shadow-brutal-sm"
                }`}
              >
                <link.icon className="h-3.5 w-3.5" />
                {link.label}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <ConnectButton />
          <button
            className="flex h-9 w-9 items-center justify-center border-2 border-border bg-card text-foreground shadow-brutal-sm transition-all hover:bg-muted md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
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
            <div className="container mx-auto flex flex-col gap-1 px-4 py-3">
              {links.map((link) => {
                const isActive = location.pathname === link.to;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 border-2 px-4 py-3 text-sm font-bold uppercase tracking-wide transition-all ${
                      isActive
                        ? "border-border bg-primary text-primary-foreground shadow-brutal-sm"
                        : "border-transparent text-muted-foreground hover:border-border hover:bg-muted"
                    }`}
                  >
                    <link.icon className="h-4 w-4" />
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
