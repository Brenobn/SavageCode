"use client";

import { Switch } from "@base-ui/react/switch";
import {
  type ComponentPropsWithoutRef,
  createContext,
  type HTMLAttributes,
  type ReactNode,
  useContext,
  useState,
} from "react";

interface ToggleContextValue {
  checked: boolean;
  setChecked: (checked: boolean) => void;
}

const ToggleContext = createContext<ToggleContextValue | null>(null);

function useToggleContext() {
  const context = useContext(ToggleContext);

  if (!context) {
    throw new Error("Toggle components must be used within ToggleRoot.");
  }

  return context;
}

export interface ToggleRootProps {
  checked?: boolean;
  children: ReactNode;
  className?: string;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

export function ToggleRoot({
  checked,
  children,
  className,
  defaultChecked,
  onCheckedChange,
}: ToggleRootProps) {
  const [internalChecked, setInternalChecked] = useState(
    defaultChecked ?? false,
  );
  const isControlled = checked !== undefined;
  const currentChecked = isControlled ? checked : internalChecked;

  const setChecked = (nextChecked: boolean) => {
    if (!isControlled) {
      setInternalChecked(nextChecked);
    }

    onCheckedChange?.(nextChecked);
  };

  const contextValue = { checked: currentChecked, setChecked };

  return (
    <ToggleContext.Provider value={contextValue}>
      <div className={`inline-flex items-center gap-3 ${className ?? ""}`}>
        {children}
      </div>
    </ToggleContext.Provider>
  );
}

export function ToggleControl({
  className,
  ...props
}: Omit<
  ComponentPropsWithoutRef<typeof Switch.Root>,
  "checked" | "onCheckedChange"
>) {
  const { checked, setChecked } = useToggleContext();

  return (
    <Switch.Root
      checked={checked}
      className={`inline-flex h-5.5 w-10 items-center rounded-full bg-border-primary p-0.75 transition-colors data-checked:bg-accent-green ${className ?? ""}`}
      onCheckedChange={setChecked}
      {...props}
    />
  );
}

export function ToggleThumb({
  className,
  ...props
}: ComponentPropsWithoutRef<typeof Switch.Thumb>) {
  return (
    <Switch.Thumb
      className={`size-4 rounded-full bg-text-secondary transition-all data-checked:translate-x-4.5 data-checked:bg-bg-page ${className ?? ""}`}
      {...props}
    />
  );
}

export function ToggleLabel({
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement>) {
  const { checked } = useToggleContext();

  return (
    <span
      className={`${checked ? "text-accent-green" : "text-text-secondary"} font-mono text-xs ${className ?? ""}`}
      {...props}
    />
  );
}
