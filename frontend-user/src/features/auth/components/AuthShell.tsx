import { Link } from "react-router"
import { Leaf } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface AuthShellProps {
  title: string
  description: string
  children: React.ReactNode
  footer: React.ReactNode
}

export function AuthShell({ title, description, children, footer }: AuthShellProps) {
  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 px-4 py-16">
      <Link to="/" className="flex items-center justify-center gap-2 font-serif text-2xl font-semibold">
        <Leaf className="size-7 text-primary" />
        PlantWeb
      </Link>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">{children}</CardContent>
      </Card>
      <p className="text-center text-sm text-muted-foreground">{footer}</p>
    </div>
  )
}
