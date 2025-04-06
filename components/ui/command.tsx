import * as React from "react"
import { cn } from "@/lib/utils"

interface RootProps extends React.HTMLAttributes<HTMLDivElement> {}

const Command = React.forwardRef<HTMLDivElement, RootProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex h-full w-full flex-col overflow-hidden rounded-md bg-transparent",
          className
        )}
        {...props}
      />
    )
  }
)
Command.displayName = "Command"

interface CommandGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  heading?: React.ReactNode
}

const CommandGroup = React.forwardRef<HTMLDivElement, CommandGroupProps>
(({ className, heading, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "overflow-hidden p-1 text-foreground",
        className
      )}
      {...props}
    >
      {heading && <div className="px-2 py-1.5 text-xs font-medium">{heading}</div>}
      <div className="flex flex-col gap-1">{children}</div>
    </div>
  )
})
CommandGroup.displayName = "CommandGroup"

interface CommandItemProps extends React.HTMLAttributes<HTMLDivElement> {
  onSelect?: () => void
}

const CommandItem = React.forwardRef<HTMLDivElement, CommandItemProps>
(({ className, onSelect, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
        className
      )}
      onClick={onSelect}
      {...props}
    />
  )
})
CommandItem.displayName = "CommandItem"

export {
  Command,
  CommandGroup,
  CommandItem,
}
