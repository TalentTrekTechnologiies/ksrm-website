import React from "react"

type ButtonProps = {
  children: React.ReactNode
  variant?: "primary" | "outline" | "ghost"
  size?: "sm" | "md" | "lg"
  onClick?: () => void
  fullWidth?: boolean
}

export default function Button({
  children,
  variant = "primary",
  size = "md",
  onClick,
  fullWidth = false,
}: ButtonProps) {

  const sizeClasses = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  }

  const variantClasses = {
    primary: "bg-primary border-primary text-white hover:bg-primary-dark hover:border-primary-dark",
    outline: "bg-transparent border-navy text-navy hover:bg-navy hover:text-white",
    ghost: "bg-transparent border-transparent text-primary hover:bg-primary hover:text-white",
  }

  return (
    <button
      onClick={onClick}
      className={`
        inline-flex items-center justify-center
        font-semibold rounded-lg border-2
        transition-all duration-200 cursor-pointer
        ${fullWidth ? "w-full" : ""}
        ${sizeClasses[size]}
        ${variantClasses[variant]}
      `}
    >
      {children}
    </button>
  )
}