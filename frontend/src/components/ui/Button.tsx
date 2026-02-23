import { ReactNode, ButtonHTMLAttributes } from "react";
import Link from "next/link";

// Types for button variants
type ButtonVariant = "primary" | "secondary" | "danger" | "dark" | "light";
type ButtonSize = "sm" | "md" | "lg";
type ButtonType = "solid" | "outline" | "text";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  buttonType?: ButtonType; // Changed from "type" to "buttonType"
  className?: string;
  href?: string;
  fullWidth?: boolean;
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  buttonType = "solid", // Changed from "type" to "buttonType"
  className = "",
  href,
  fullWidth = false,
  ...props
}: ButtonProps) {
  // Swiss design - flat, geometric styling with no rounded corners

  // Base styles
  const baseStyles =
    "inline-flex items-center justify-center font-medium transition-colors";

  // Size classes
  const sizeClasses = {
    sm: "px-3 py-1 text-sm",
    md: "px-5 py-2 text-base",
    lg: "px-8 py-3 text-lg",
  };

  // Variant classes for solid buttons
  const solidVariantClasses = {
    primary: "bg-yellow-500 text-black hover:bg-yellow-400",
    secondary: "bg-white text-black border border-black hover:bg-gray-100",
    danger: "bg-red-600 text-white hover:bg-red-500",
    dark: "bg-black text-white hover:bg-gray-800",
    light: "bg-white text-black hover:bg-gray-100",
  };

  // Variant classes for outline buttons
  const outlineVariantClasses = {
    primary:
      "bg-transparent border border-yellow-500 text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900 dark:hover:bg-opacity-20",
    secondary:
      "bg-transparent border border-gray-300 text-black dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800",
    danger:
      "bg-transparent border border-red-600 text-red-600 hover:bg-red-50 dark:hover:bg-red-900 dark:hover:bg-opacity-20",
    dark: "bg-transparent border border-black text-black dark:border-white dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800",
    light:
      "bg-transparent border border-white text-white hover:bg-white/20",
  };

  // Variant classes for text buttons
  const textVariantClasses = {
    primary:
      "text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900 dark:hover:bg-opacity-20",
    secondary:
      "text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800",
    danger:
      "text-red-600 hover:bg-red-50 dark:hover:bg-red-900 dark:hover:bg-opacity-20",
    dark: "text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800",
    light: "text-white hover:bg-white/20",
  };

  // Select the correct variant class based on buttonType
  let variantClasses;
  if (buttonType === "outline") {
    variantClasses = outlineVariantClasses[variant];
  } else if (buttonType === "text") {
    variantClasses = textVariantClasses[variant];
  } else {
    variantClasses = solidVariantClasses[variant];
  }

  // Full width class
  const widthClass = fullWidth ? "w-full" : "";

  // Combine all classes
  const buttonClasses = `${baseStyles} ${sizeClasses[size]} ${variantClasses} ${widthClass} ${className}`;

  // Render as link if href is provided, otherwise as button
  if (href) {
    return (
      <Link href={href} className={buttonClasses}>
        {children}
      </Link>
    );
  }

  return (
    <button className={buttonClasses} {...props}>
      {children}
    </button>
  );
}
