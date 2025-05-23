import { Menu } from "lucide-react";
import { type ReactNode } from "react";
import { LinkButton } from "#app/components/custom-buttons.tsx";
import LaunchUI from "#app/components/logos/launch-ui.tsx";
import { Button, type ButtonProps } from "#app/components/ui/button";
import {
  Navbar as NavbarComponent,
  NavbarLeft,
  NavbarRight,
} from "#app/components/ui/navbar";
import Navigation from "#app/components/ui/navigation";
import { Sheet, SheetContent, SheetTrigger } from "#app/components/ui/sheet";
import { cn } from "#app/utils/misc";
import { useOptionalUser, userHasRole } from "#app/utils/user.ts";


interface NavbarLink {
  text: string;
  href: string;
}

export interface NavbarActionProps {
  text: string;
  href: string;
  variant?: ButtonProps["variant"];
  icon?: ReactNode;
  iconRight?: ReactNode;
  isButton?: boolean;
}

interface NavbarProps {
  logo?: ReactNode;
  name?: string;
  homeUrl?: string;
  mobileLinks?: NavbarLink[];
  actions?: NavbarActionProps[];
  showNavigation?: boolean;
  customNavigation?: ReactNode;
  className?: string;
}

export default function Navbar({
  logo = <LaunchUI />,
  name = "EasyLearn",
  homeUrl = "/",
  mobileLinks = [
    { text: "Getting Started", href: "https://www.launchuicomponents.com/" },
    { text: "Components", href: "https://www.launchuicomponents.com/" },
    { text: "Documentation", href: "https://www.launchuicomponents.com/" },
  ],
  actions: outsideActions,
  showNavigation = true,
  customNavigation,
  className,
}: NavbarProps) {

  const user = useOptionalUser();
  const isAdmin = userHasRole(user, 'admin');

  let actions: NavbarActionProps[] = [];

  if (outsideActions) {
    actions = outsideActions
  }
  else {
    if (user) {
      if (isAdmin) {
        actions = [{ text: "Dashboard", href: "/dashboard", isButton: true }]
      } else {
        actions = [
          { text: "My account", href: "/profile", isButton: true}
        ]
      }
    } else {
      actions = [
        { text: "Sign In", href: "/login", isButton: false },
        { text: "Sign Up", href: "/signup", isButton: true },
      ]
    }
    
  }

  return (
    <header className={cn("sticky top-0 z-50 -mb-4 px-4 pb-4", className)}>
      <div className="fade-bottom bg-background/15 absolute left-0 h-24 w-full backdrop-blur-lg"></div>
      <div className="max-w-container relative mx-auto">
        <NavbarComponent>
          <NavbarLeft>
            <a
              href={homeUrl}
              className="flex items-center gap-2 text-xl font-bold"
            >
              {logo}
              {name}
            </a>
            {showNavigation && (customNavigation || <Navigation />)}
          </NavbarLeft>
          <NavbarRight>
            {actions.map((action, index) =>
              action.isButton ? (
                <LinkButton
                  key={index}
                  variant={action.variant || "default"}
                  asChild
                  to={action.href}
                >
                  {action.icon}
                  {action.text}
                  {action.iconRight}
                </LinkButton>
              ) : (
                <a
                  key={index}
                  href={action.href}
                  className="hidden text-sm md:block"
                >
                  {action.text}
                </a>
              ),
            )}
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0 md:hidden"
                >
                  <Menu className="size-5" />
                  <span className="sr-only">Toggle navigation menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <nav className="grid gap-6 text-lg font-medium">
                  <a
                    href={homeUrl}
                    className="flex items-center gap-2 text-xl font-bold"
                  >
                    <span>{name}</span>
                  </a>
                  {mobileLinks.map((link, index) => (
                    <a
                      key={index}
                      href={link.href}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      {link.text}
                    </a>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          </NavbarRight>
        </NavbarComponent>
      </div>
    </header>
  );
}
