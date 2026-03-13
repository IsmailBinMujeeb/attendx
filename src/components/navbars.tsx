import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import { Sun, Moon } from "lucide-react";

const Logo = () => {
  return (
    <Link to="/" className="flex items-center space-x-2">
      {/*<img src="/logo.svg" className="size-8 dark:invert" alt="bundui logo" />*/}
      <span className="text-2xl font-bold">AttendX</span>
    </Link>
  );
};

export default function Navbar() {
  const { session } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState<boolean>(
    localStorage.getItem(`isDarkMode`) === "true",
  );

  const navigationLinks = [
    { href: "/", label: "Home", active: true, isVisible: true },
    // { href: "/#features", label: "Features", isVisible: true },
    { href: "/pricing", label: "Pricing", isVisible: true },
    // { href: "/#about", label: "About", isVisible: true },
    { href: "/login", label: "Sign Up", isVisible: !session },
    {
      href: "/students",
      label: "Dashboard",
      isVisible:
        !!session && session.user.email === import.meta.env.VITE_ADMIN_EMAIL,
    },
    {
      href: "/portal",
      label: "Student Portal",
      isVisible:
        !!session && session.user.email !== import.meta.env.VITE_ADMIN_EMAIL,
    },
  ];

  const switchTheme = () => {
    localStorage.setItem(`isDarkMode`, `${!isDarkMode}`);
    if (isDarkMode) document.body.classList.remove("dark");
    else document.body.classList.add("dark");

    setIsDarkMode((p) => !p);
  };

  return (
    <>
      <header className="border-b px-4 md:px-6">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Left side */}
          <div className="flex items-center gap-2">
            {/* Mobile menu trigger */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  className="group size-8 md:hidden"
                  variant="ghost"
                  size="icon"
                >
                  <svg
                    className="pointer-events-none"
                    width={16}
                    height={16}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M4 12L20 12"
                      className="origin-center -translate-y-1.75 transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.1)] group-aria-expanded:translate-x-0 group-aria-expanded:translate-y-0 `group-aria-expanded:rotate-315"
                    />
                    <path
                      d="M4 12H20"
                      className="origin-center transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.8)] group-aria-expanded:rotate-45"
                    />
                    <path
                      d="M4 12H20"
                      className="origin-center translate-y-1.75 transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.1)] group-aria-expanded:translate-y-0 group-aria-expanded:rotate-135"
                    />
                  </svg>
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-36 p-1 md:hidden">
                <NavigationMenu className="max-w-none *:w-full">
                  <NavigationMenuList className="flex-col items-start gap-0 md:gap-2">
                    {navigationLinks
                      .filter((n) => n.isVisible)
                      .map((link, index) => (
                        <NavigationMenuItem key={index} className="w-full">
                          <NavigationMenuLink
                            href={link.href}
                            className="py-1.5"
                            active={link.active}
                          >
                            {link.label}
                          </NavigationMenuLink>
                        </NavigationMenuItem>
                      ))}
                  </NavigationMenuList>
                </NavigationMenu>
              </PopoverContent>
            </Popover>
            {/* Main nav */}
            <div className="flex items-center gap-6">
              <a href="/" className="text-primary hover:text-primary/90">
                <Logo />
              </a>
              {/* Navigation menu */}
              <NavigationMenu className="mx-auto max-md:hidden">
                <NavigationMenuList className="gap-2">
                  {navigationLinks
                    .filter((n) => n.isVisible)
                    .map((link, index) => (
                      <NavigationMenuItem key={index}>
                        <NavigationMenuLink
                          active={link.active}
                          href={link.href}
                          className="text-muted-foreground hover:text-primary py-1.5 font-medium"
                        >
                          {link.label}
                        </NavigationMenuLink>
                      </NavigationMenuItem>
                    ))}
                </NavigationMenuList>
              </NavigationMenu>
            </div>
          </div>
          {/* Right Nav */}
          <div className="flex items-center gap-2">
            <Button variant={"secondary"} onClick={switchTheme}>
              {isDarkMode ? <Sun /> : <Moon />}
            </Button>
          </div>
        </div>
      </header>
    </>
  );
}
