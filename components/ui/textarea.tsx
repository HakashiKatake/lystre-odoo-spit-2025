import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "placeholder:text-muted-foreground aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content min-h-16 w-full rounded-md border-2 border-black bg-white px-3 py-2 text-base shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all outline-none focus-visible:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus-visible:translate-x-[-2px] focus-visible:translate-y-[-2px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
