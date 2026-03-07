import { useState } from "react";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

import { NavMainHorizontal } from "./nav-main-horizontal";
import { navigationLinks } from "./app-sidebar";
import { Logo } from "./logo";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AppHeader() {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(
    localStorage.getItem(`isDarkMode`) === "true",
  );

  const switchTheme = () => {
    localStorage.setItem(`isDarkMode`, `${!isDarkMode}`);
    if (isDarkMode) document.body.classList.remove("dark");
    else document.body.classList.add("dark");

    setIsDarkMode((p) => !p);
  };

  return (
    <header
      data-slot="header"
      className="flex h-16 shrink-0 items-center justify-between gap-2 px-4 **:data-[logo=description]:hidden"
    >
      <div className="flex grow items-center">
        <Logo />
        <Separator
          orientation="vertical"
          className="mx-4 data-[orientation=vertical]:h-4"
        />
        <SidebarTrigger className="-ml-1 md:hidden" />
        <NavMainHorizontal items={navigationLinks} />
      </div>
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <Button size="icon-sm" variant="ghost" onClick={switchTheme}>
            {isDarkMode ? <Sun /> : <Moon />}
          </Button>
        </div>
        {/*<NavUser />*/}
      </div>
    </header>
  );
}
