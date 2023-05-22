import { type HTMLProps } from "react";
import { cn } from "~/lib/utils";

export const H1 = (props: HTMLProps<HTMLHeadingElement>) => (
  <h1
    {...props}
    className={cn(
      "scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl",
      props.className
    )}
  />
);

export const H2 = (props: HTMLProps<HTMLHeadingElement>) => (
  <h2
    {...props}
    className={cn(
      "scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight transition-colors first:mt-0",
      props.className
    )}
  />
);

export const H3 = (props: HTMLProps<HTMLHeadingElement>) => (
  <h3
    {...props}
    className={cn(
      "scroll-m-20 text-2xl font-semibold tracking-tight",
      props.className
    )}
  />
);

export const P = (props: HTMLProps<HTMLParagraphElement>) => (
  <p
    {...props}
    className={cn("leading-7 [&:not(:first-child)]:mt-6", props.className)}
  />
);

export const Large = (props: HTMLProps<HTMLDivElement>) => (
  <div {...props} className={cn("text-lg font-semibold", props.className)} />
);

export const Small = (props: HTMLProps<HTMLDivElement>) => (
  <small
    {...props}
    className={cn("text-sm font-medium leading-none", props.className)}
  />
);

export const Muted = (props: HTMLProps<HTMLParagraphElement>) => (
  <p
    {...props}
    className={cn("text-sm text-muted-foreground", props.className)}
  />
);
