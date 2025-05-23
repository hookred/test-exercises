import { ArrowRight, ArrowUpRight } from "lucide-react";

import { Badge } from "#app/components/ui/badge";
import { Button } from "#app/components/ui/button";
import { cn } from "#app/utils/misc.tsx";

interface Hero1Props {
  badge?: string;
  heading: string;
  description: string;
  buttons?: {
    primary?: {
      text: string;
      url: string;
    };
    secondary?: {
      text: string;
      url: string;
    };
  };
  rightComponent?: React.ReactNode
}

const Hero1 = ({
  badge = "✨ Your Website Builder",
  heading = "Blocks Built With Shadcn & Tailwind",
  description = "Finely crafted components built with React, Tailwind and Shadcn UI. Developers can copy and paste these blocks directly into their project.",
  buttons,
  rightComponent,
}: Hero1Props) => {
  return (
    <section className="py-32">
      <div className="container">
        <div className={cn("grid items-center gap-8", rightComponent && "lg:grid-cols-2")}>
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
            {badge && (
              <Badge variant="outline">
                {badge}
                <ArrowUpRight className="ml-2 size-4" />
              </Badge>
            )}
            <h1 className="my-6 text-4xl font-bold text-pretty lg:text-6xl">
              {heading}
            </h1>
            <p className="mb-8 max-w-xl text-muted-foreground lg:text-xl">
              {description}
            </p>
            {buttons &&
              <div className="flex w-full flex-col justify-center gap-2 sm:flex-row lg:justify-start">
                {buttons.primary && (
                  <Button asChild className="w-full sm:w-auto">
                    <a href={buttons.primary.url}>{buttons.primary.text}</a>
                  </Button>
                )}
                {buttons.secondary && (
                  <Button asChild variant="outline" className="w-full sm:w-auto">
                    <a href={buttons.secondary.url}>
                      {buttons.secondary.text}
                      <ArrowRight className="size-4" />
                    </a>
                  </Button>
                )}
              </div>
            }
          </div>
          {rightComponent}
        </div>
      </div>
    </section>
  );
};

interface Hero1WithImageProps extends Hero1Props {
  image?: {
    src: string;
    alt: string;
  };
}

const Hero1WithImage = ({ image, ...props }: Hero1WithImageProps) => {
  return (
    <Hero1
      rightComponent={image && image.src && (
        <img
          src={image.src}
          alt={image.alt}
          className="max-h-96 w-full rounded-md object-cover"
        />
      )}
      {...props}
    />
  )
}


export { Hero1, Hero1WithImage };
