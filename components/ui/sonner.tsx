"use client"

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      toastOptions={{
        style: {
          background: "#FFFEF9",
          border: "2px solid #2B1810",
          borderRadius: "0",
          color: "#2B1810",
          fontFamily: "inherit",
        },
        classNames: {
          toast: "!bg-[#FFFEF9] !border-2 !border-[#2B1810] !rounded-none !shadow-[4px_4px_0px_#2B1810]",
          title: "!text-[#2B1810] !font-semibold",
          description: "!text-[#8B7355]",
          success: "!bg-[#22C55E]/10 !border-[#22C55E] !text-[#166534]",
          error: "!bg-[#EF4444]/10 !border-[#EF4444] !text-[#991B1B]",
          warning: "!bg-[#F59E0B]/10 !border-[#F59E0B] !text-[#92400E]",
          info: "!bg-[#F5EBE0] !border-[#2B1810] !text-[#2B1810]",
          actionButton: "!bg-[#8B7355] !text-white !border-2 !border-[#2B1810] !rounded-none",
          cancelButton: "!bg-white !text-[#2B1810] !border-2 !border-[#2B1810] !rounded-none",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
