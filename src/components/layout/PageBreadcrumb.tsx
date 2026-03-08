import { Link, useLocation } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  to?: string;
}

// Auto-generates breadcrumbs from current path
const routeLabels: Record<string, string> = {
  "": "Home",
  courses: "Courses",
  course: "Course",
  create: "Create",
  lesson: "Lesson",
  certificates: "Certificates",
  certificate: "Certificate",
  profile: "Profile",
  "my-learning": "My Learning",
  analytics: "Analytics",
  "publish-success": "Published",
};

export function PageBreadcrumb({ items }: { items?: BreadcrumbItem[] }) {
  const location = useLocation();

  const crumbs: BreadcrumbItem[] = items || (() => {
    const segments = location.pathname.split("/").filter(Boolean);
    const result: BreadcrumbItem[] = [{ label: "Home", to: "/" }];
    let path = "";
    for (let i = 0; i < segments.length; i++) {
      path += `/${segments[i]}`;
      const label = routeLabels[segments[i]];
      if (label) {
        // Don't link the last item
        if (i < segments.length - 1) {
          result.push({ label, to: path });
        } else {
          result.push({ label });
        }
      }
    }
    return result;
  })();

  if (crumbs.length <= 1) return null;

  return (
    <nav className="flex items-center gap-1 text-xs font-bold uppercase tracking-wide text-muted-foreground mb-4">
      {crumbs.map((crumb, i) => (
        <span key={i} className="flex items-center gap-1">
          {i > 0 && <ChevronRight className="h-3 w-3" />}
          {crumb.to ? (
            <Link
              to={crumb.to}
              className="hover:text-foreground transition-colors"
            >
              {i === 0 ? <Home className="h-3 w-3" /> : crumb.label}
            </Link>
          ) : (
            <span className="text-foreground">{crumb.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
