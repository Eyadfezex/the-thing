"use client";
import React, { useEffect, useState } from "react";
import { useThemeStore } from "../stores/theme";
import { cn } from "@/lib/utils";

interface ThemeProviderProps {
  children: React.ReactNode;
}

const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const { resolvedTheme } = useThemeStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div
      className={cn(
        mounted ? resolvedTheme : undefined,
        "bg-background text-foreground"
      )}
    >
      {children}
    </div>
  );
};

export default ThemeProvider;
