"use client";

import * as React from "react";

import  { type ReactNode } from "react";
import { Link } from "react-router";
import { cn } from "#app/utils/misc.tsx";
import LaunchUI from "../logos/launch-ui";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "./navigation-menu";

interface ComponentItem {
  title: string;
  href: string;
  description: string;
}

interface MenuItem {
  title: string;
  href?: string;
  isLink?: boolean;
  content?: ReactNode;
}

interface NavigationProps {
  menuItems?: MenuItem[];
  learningComponents?: ComponentItem[];
  logo?: ReactNode;
  logoTitle?: string;
  logoDescription?: string;
  logoHref?: string;
  introItems?: {
    title: string;
    href: string;
    description: string;
  }[];
}

export default function Navigation({
  menuItems = [
    {
      title: "Learning",
      content: "learning"
    },
    {
      title: "Getting started",
      content: "default",
    },
    {
      title: "Components",
      content: "components",
    },
    {
      title: "Documentation",
      isLink: true,
      href: "https://www.launchuicomponents.com/",
    },
  ],
  learningComponents = [
    {
      title: "Courses",
      href: "/courses",
      description:
        "All available courses.",
    },
    {
      title: "Skills",
      href: "/skills",
      description:
        "Atomic element. They will be updated soonly",
    },
  ],
  logo = <LaunchUI />,
  logoTitle = "Launch UI",
  logoDescription = "Landing page template built with React, Shadcn/ui and Tailwind that you can copy/paste into your project.",
  logoHref = "https://www.launchuicomponents.com/",
  introItems = [
    {
      title: "Introduction",
      href: "https://www.launchuicomponents.com/",
      description:
        "Re-usable components built using Radix UI and Tailwind CSS.",
    },
    {
      title: "Installation",
      href: "https://www.launchuicomponents.com/",
      description: "How to install dependencies and structure your app.",
    },
    {
      title: "Typography",
      href: "https://www.launchuicomponents.com/",
      description: "Styles for headings, paragraphs, lists...etc",
    },
  ],
}: NavigationProps) {
  return (
    <NavigationMenu className="hidden md:flex">
      <NavigationMenuList>
        {menuItems.map((item, index) => (
          <NavigationMenuItem key={index}>
            {item.isLink ? (
              <NavigationMenuLink className={navigationMenuTriggerStyle()} asChild>
                <Link to={item.href || ""}>
                    {item.title}
                </Link>
              </NavigationMenuLink>
            ) : (
              <>
                <NavigationMenuTrigger>{item.title}</NavigationMenuTrigger>
                <NavigationMenuContent>
                  {item.content === "default" ? (
                    <ul className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                      <li className="row-span-3">
                        <NavigationMenuLink asChild>
                          <Link
                            className="from-muted/30 to-muted/10 flex h-full w-full flex-col justify-end rounded-md bg-linear-to-b p-6 no-underline outline-hidden select-none focus:shadow-md"
                            to={logoHref}
                          >
                            {logo}
                            <div className="mt-4 mb-2 text-lg font-medium">
                              {logoTitle}
                            </div>
                            <p className="text-muted-foreground text-sm leading-tight">
                              {logoDescription}
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                      {introItems.map((intro, i) => (
                        <ListItem key={i} href={intro.href} title={intro.title}>
                          {intro.description}
                        </ListItem>
                      ))}
                    </ul>
                  ) : item.content === "learning" ? (
                    <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-1 lg:w-[600px]">
                      {learningComponents.map((component) => (
                        <ListItem
                          key={component.title}
                          title={component.title}
                          href={component.href}
                        >
                          {component.description}
                        </ListItem>
                      ))}
                    </ul>
                  ) : (
                    item.content
                  )}
                </NavigationMenuContent>
              </>
            )}
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  );
}

function ListItem({
  className,
  title,
  children,
  ...props
}: React.ComponentProps<"a"> & { title: string }) {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          data-slot="list-item"
          className={cn(
            "hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground block space-y-1 rounded-md p-3 leading-none no-underline outline-hidden transition-colors select-none",
            className,
          )}
          {...props}
        >
          <div className="text-sm leading-none font-medium">{title}</div>
          <p className="text-muted-foreground line-clamp-2 text-sm leading-snug">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  );
}
