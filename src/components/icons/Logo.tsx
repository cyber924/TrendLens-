import { cn } from "@/lib/utils"

export default function Logo({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("text-primary", className)}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12z" />
      <path d="m22 22-4.3-4.3" />
      <path d="M7 12h5l2 2 2-4h3" />
    </svg>
  )
}
