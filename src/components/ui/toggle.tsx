"use client";

import { Switch } from "@base-ui/react/switch";
import { type ComponentPropsWithoutRef, useState } from "react";

export interface ToggleProps
  extends Omit<
    ComponentPropsWithoutRef<typeof Switch.Root>,
    "children" | "className" | "checked" | "defaultChecked" | "onCheckedChange"
  > {
  checked?: boolean;
  defaultChecked?: boolean;
  label?: string;
  onCheckedChange?: (checked: boolean) => void;
}

export function Toggle({
  checked,
  defaultChecked,
  disabled,
  label = "roast mode",
  onCheckedChange,
  ...props
}: ToggleProps) {
  const [internalChecked, setInternalChecked] = useState(
    defaultChecked ?? false,
  );
  const isControlled = checked !== undefined;
  const currentChecked = isControlled ? checked : internalChecked;

  const handleCheckedChange = (nextChecked: boolean) => {
    if (!isControlled) {
      setInternalChecked(nextChecked);
    }

    onCheckedChange?.(nextChecked);
  };

  return (
    <div className="inline-flex items-center gap-3">
      <Switch.Root
        checked={currentChecked}
        className="inline-flex h-5.5 w-10 items-center rounded-full bg-border-primary p-0.75 transition-colors data-checked:bg-accent-green"
        disabled={disabled}
        onCheckedChange={handleCheckedChange}
        {...props}
      >
        <Switch.Thumb className="size-4 rounded-full bg-text-secondary transition-all data-checked:translate-x-4.5 data-checked:bg-bg-page" />
      </Switch.Root>

      <span
        className={
          currentChecked
            ? "font-mono text-xs text-accent-green"
            : "font-mono text-xs text-text-secondary"
        }
      >
        {label}
      </span>
    </div>
  );
}
