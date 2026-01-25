import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex w-full rounded-md outline outline-input bg-background px-3 py-2 text-sm",
        "focus:outline-primary focus:outline-2",
        "placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
        "not-placeholder-shown:text-black dark:not-placeholder-shown:text-white",
        className
      )}
      {...props}
    />
  )
}

export { Input }
