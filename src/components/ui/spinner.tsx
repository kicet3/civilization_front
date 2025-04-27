import * as React from "react"
import { cn } from "@/lib/utils"

const Spinner = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("flex items-center justify-center", className)}
      {...props}
    >
      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent text-foreground" />
    </div>
  )
})

Spinner.displayName = "Spinner"

export default Spinner 