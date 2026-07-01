import { cn } from '@/lib/cn'

interface ContainerProps {
  children: React.ReactNode
  className?: string
}

export function Container({ children, className }: ContainerProps) {
  return (
    <div className={cn('mx-auto w-full max-w-7xl min-w-0 px-6 sm:px-10 lg:px-16', className)}>
      {children}
    </div>
  )
}
