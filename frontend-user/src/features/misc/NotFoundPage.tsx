import { Link } from "react-router"
import { Leaf } from "lucide-react"
import { Button } from "@/components/ui/button"

export function NotFoundPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-32 text-center">
      <Leaf className="size-12 text-primary" />
      <h1 className="text-4xl font-bold">404</h1>
      <p className="text-muted-foreground">
        Trang bạn tìm không tồn tại hoặc đã được di chuyển.
      </p>
      <Button asChild>
        <Link to="/">Về trang chủ</Link>
      </Button>
    </div>
  )
}
