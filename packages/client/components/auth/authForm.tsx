"use client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React, { useState, FormEvent } from "react";
import { useAuth } from "@/hooks/useAuth";
import { loginSchema, registerSchema } from "@/lib/authSchema";
import { FaGithub } from "react-icons/fa";

type AuthMode = "login" | "register";

interface AuthFormProps extends React.ComponentPropsWithoutRef<"form"> {
  mode: AuthMode;
}

export function AuthForm({ className, mode, ...props }: AuthFormProps) {
  const isLogin = mode === "login";
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const { login, register, loading } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Zod validation
    const result = isLogin
      ? loginSchema.safeParse({
          email: formData.email,
          password: formData.password,
        })
      : registerSchema.safeParse({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
        });

    if (!result.success) {
      // Collect and display the first error message
      const firstError = Object.values(result.error.flatten().fieldErrors)
        .flat()
        .filter(Boolean)[0];
      setFormError(firstError || "Invalid input");
      return;
    }

    if (!isLogin && formData.password !== formData.confirmPassword) {
      setFormError("Passwords don't match");
      return;
    }

    if (isLogin) {
      await login(formData.email, formData.password);
    } else {
      await register(formData.email, formData.password, formData.name);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  return (
    <form
      className={cn("flex flex-col gap-6", className)}
      onSubmit={handleSubmit}
      {...props}
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">
          {isLogin ? "Login to your account" : "Create an account"}
        </h1>
        <p className="text-balance text-sm text-muted-foreground">
          {isLogin
            ? "Enter your email below to login to your account"
            : "Enter your details below to create your account"}
        </p>
      </div>
      <div className="grid gap-6">
        {!isLogin && (
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Your name"
              required
              value={formData.name}
              onChange={handleInputChange}
            />
          </div>
        )}
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="m@example.com"
            required
            value={formData.email}
            onChange={handleInputChange}
          />
        </div>
        <div className="grid gap-2">
          <div className="flex items-center">
            <Label htmlFor="password">Password</Label>
            {isLogin && (
              <a
                href="#"
                className="ml-auto text-sm underline-offset-4 hover:underline"
              >
                Forgot your password?
              </a>
            )}
          </div>
          <Input
            id="password"
            type="password"
            required
            value={formData.password}
            onChange={handleInputChange}
          />
        </div>
        {!isLogin && (
          <div className="grid gap-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              required
              value={formData.confirmPassword}
              onChange={handleInputChange}
            />
          </div>
        )}
        <Button type="submit" className="w-full" disabled={loading}>
          {isLogin ? "Login" : "Register"}
          {loading && "ing...."}
        </Button>
        <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
          <span className="relative z-10 bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
        <Button variant="outline" className="w-full" disabled={loading}>
          <FaGithub />
          {isLogin ? "Login with GitHub" : "Register with GitHub"}
        </Button>
      </div>
      <div className="text-center text-sm">
        {isLogin ? (
          <>
            Don&apos;t have an account?{" "}
            <a href="/register" className="underline underline-offset-4">
              Sign up
            </a>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <a href="/login" className="underline underline-offset-4">
              Login
            </a>
          </>
        )}
      </div>
      {formError && (
        <div className="text-red-500 text-sm text-center">{formError}</div>
      )}
    </form>
  );
}
