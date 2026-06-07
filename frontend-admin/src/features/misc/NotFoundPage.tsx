import { Link } from "react-router"
import { Leaf } from "lucide-react"
import { Button } from "@/components/ui/button"

export function NotFoundPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 p-6 text-center">
      <span className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Leaf className="size-7" />
      </span>
      <h1 className="text-4xl font-semibold">404</h1>
      <p className="max-w-sm text-muted-foreground">
        Trang bạn tìm không tồn tại hoặc đã được di chuyển.
      </p>
      <Button asChild>
        <Link to="/">Về bảng điều khiển</Link>
      </Button>
    </div>
  )
}
