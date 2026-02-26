import { Link, useLocation } from "react-router-dom";
import { ConnectButton, useCurrentAccount } from "@mysten/dapp-kit";
import { BookOpen, Trophy, Plus, User, Home } from "lucide-react";
import { motion } from "framer-motion";

export function Navbar() {
  const account = useCurrentAccount();
  const location = useLocation();

  const links = [
    { to: "/", label: "Home", icon: Home },
    { to: "/courses", label: "Courses", icon: BookOpen },
    ...(account ? [
      { to: "/create", label: "Create", icon: Plus },
      { to: "/certificates", label: "Certificates", icon: Trophy },
      { to: "/profile", label: "Profile", icon: User },
    ] : []),
  ];

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <BookOpen className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-display text-xl font-bold text-foreground">
            Move Academy
          </span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {links.map((link) => {
            const isActive = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`relative flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <link.icon className="h-4 w-4" />
                {link.label}
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute inset-x-1 -bottom-[13px] h-0.5 rounded-full bg-primary"
                  />
                )}
              </Link>
            );
          })}
        </div>

        <ConnectButton />
      </div>
    </nav>
  );
}
