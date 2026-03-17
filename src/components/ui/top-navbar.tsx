import type { HTMLAttributes, ReactNode } from "react";

interface TopNavbarRootProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
}

function Root({ children, className, ...props }: TopNavbarRootProps) {
  return (
    <header
      className={`w-full border-b border-border-primary bg-bg-page ${className ?? ""}`}
      {...props}
    >
      <div className="flex h-14 w-full items-center justify-between px-10">
        {children}
      </div>
    </header>
  );
}

interface BrandProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

function Brand({ children, className, ...props }: BrandProps) {
  return (
    <div
      className={`flex items-center gap-2 font-mono ${className ?? ""}`}
      {...props}
    >
      {children}
    </div>
  );
}

function Prompt() {
  return <span className="text-xl font-bold text-accent-green">&gt;</span>;
}

interface TextProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
}

function BrandText({ children, className, ...props }: TextProps) {
  return (
    <span
      className={`text-lg font-medium text-text-primary ${className ?? ""}`}
      {...props}
    >
      {children}
    </span>
  );
}

function Right({ children, className, ...props }: BrandProps) {
  return (
    <div className={`flex items-center gap-6 ${className ?? ""}`} {...props}>
      {children}
    </div>
  );
}

function Item({ children, className, ...props }: TextProps) {
  return (
    <span
      className={`font-mono text-[13px] text-text-secondary ${className ?? ""}`}
      {...props}
    >
      {children}
    </span>
  );
}

export const TopNavbar = {
  Root,
  Brand,
  Prompt,
  BrandText,
  Right,
  Item,
};
