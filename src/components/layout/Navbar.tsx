import { Link, useLocation } from "react-router-dom";
import { ConnectButton, useCurrentAccount } from "@mysten/dapp-kit";
import { BookOpen, Trophy, Plus, User, Home, GraduationCap, BarChart2, Menu, X, ArrowRight } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

export function Navbar() {
  const account = useCurrentAccount();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const mainLinks = [
    { to: "/", label: "Home", icon: Home },
    { to: "/courses", label: "Courses", icon: BookOpen },
  ];

  const userLinks = account ? [
    { to: "/my-learning", label: "Learn", icon: GraduationCap },
    { to: "/create", label: "Create", icon: Plus },
    { to: "/certificates", label: "Certs", icon: Trophy },
  ] : [];

  const secondaryLinks = account ? [
    { to: "/analytics", label: "Stats", icon: BarChart2 },
    { to: "/profile", label: "Profile", icon: User },
  ] : [];

  const allLinks = [...mainLinks, ...userLinks, ...secondaryLinks];

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="sticky top-0 z-50 border-b-2 border-border bg-card">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5" onClick={() => setMobileOpen(false)}>
          <div className="flex h-8 w-8 items-center justify-center border-2 border-border bg-primary shadow-brutal-sm">
            <BookOpen className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="hidden font-display text-sm font-bold uppercase tracking-tight text-foreground sm:block">
            Move Academy
          </span>
        </Link>

        {/* Desktop: Main nav */}
        <div className="hidden items-center md:flex">
          {/* Primary links */}
          <div className="flex items-center border-r-2 border-border pr-2 mr-2">
            {mainLinks.map((link) => (
              <NavItem key={link.to} {...link} active={isActive(link.to)} />
            ))}
          </div>

          {/* User links */}
          {userLinks.length > 0 && (
            <div className="flex items-center border-r-2 border-border pr-2 mr-2">
              {userLinks.map((link) => (
                <NavItem key={link.to} {...link} active={isActive(link.to)} />
              ))}
            </div>
          )}

          {/* Secondary */}
          {secondaryLinks.length > 0 && (
            <div className="flex items-center">
              {secondaryLinks.map((link) => (
                <NavItem key={link.to} {...link} active={isActive(link.to)} />
              ))}
            </div>
          )}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <ConnectButton />
          <button
            className="flex h-8 w-8 items-center justify-center border-2 border-border bg-card text-foreground shadow-brutal-sm transition-all hover:bg-muted active:shadow-none active:translate-x-0.5 active:translate-y-0.5 md:hidden"
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
              {/* Main section */}
              <p className="mb-2 font-display text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Navigate
              </p>
              <div className="flex flex-col gap-1 mb-3">
                {mainLinks.map((link) => (
                  <MobileNavItem
                    key={link.to}
                    {...link}
                    active={isActive(link.to)}
                    onClick={() => setMobileOpen(false)}
                  />
                ))}
              </div>

              {account && (
                <>
                  <p className="mb-2 font-display text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Your Academy
                  </p>
                  <div className="flex flex-col gap-1 mb-3">
                    {userLinks.map((link) => (
                      <MobileNavItem
                        key={link.to}
                        {...link}
                        active={isActive(link.to)}
                        onClick={() => setMobileOpen(false)}
                      />
                    ))}
                  </div>

                  <div className="border-t-2 border-border pt-3 flex flex-col gap-1">
                    {secondaryLinks.map((link) => (
                      <MobileNavItem
                        key={link.to}
                        {...link}
                        active={isActive(link.to)}
                        onClick={() => setMobileOpen(false)}
                      />
                    ))}
                  </div>
                </>
              )}
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
