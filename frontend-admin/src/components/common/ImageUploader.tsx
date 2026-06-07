import { useRef, useState } from "react"
import { ImagePlus, Loader2, X } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { uploadImage, uploadImages } from "@/lib/upload"
import { getApiErrorMessage } from "@/lib/api-client"

interface SingleImageUploaderProps {
  value: string
  onChange: (url: string) => void
  className?: string
}

/** Single-image dropzone — uploads on select, shows preview. */
export function SingleImageUploader({
  value,
  onChange,
  className,
}: SingleImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)

  const handleSelect = async (file: File | undefined) => {
    if (!file) return
    setIsUploading(true)
    try {
      const url = await uploadImage(file)
      onChange(url)
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Tải ảnh thất bại"))
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className={cn("space-y-2", className)}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleSelect(e.target.files?.[0])}
      />
      {value ? (
        <div className="group relative inline-block">
          <img
            src={value}
            alt="preview"
            width={160}
            height={160}
            className="size-40 rounded-lg border border-border object-cover"
          />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute -top-2 -right-2 flex size-6 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow"
          >
            <X className="size-3.5" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
          className="flex size-40 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-muted/30 text-muted-foreground transition-colors hover:border-primary hover:text-primary"
        >
          {isUploading ? (
            <Loader2 className="size-6 animate-spin" />
          ) : (
            <ImagePlus className="size-6" />
          )}
          <span className="text-xs">Tải ảnh lên</span>
        </button>
      )}
    </div>
  )
}

interface MultiImageUploaderProps {
  value: string[]
  onChange: (urls: string[]) => void
  className?: string
}

/** Multi-image gallery uploader with reorder-free add/remove. */
export function MultiImageUploader({
  value,
  onChange,
  className,
}: MultiImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)

  const handleSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    setIsUploading(true)
    try {
      const urls = await uploadImages(Array.from(files))
      onChange([...value, ...urls])
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Tải ảnh thất bại"))
    } finally {
      setIsUploading(false)
    }
  }

  const removeAt = (index: number) =>
    onChange(value.filter((_, i) => i !== index))

  return (
    <div className={cn("space-y-2", className)}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleSelect(e.target.files)}
      />
      <div className="flex flex-wrap gap-3">
        {value.map((url, i) => (
          <div key={`${url}-${i}`} className="group relative">
            <img
              src={url}
              alt={`gallery-${i}`}
              width={96}
              height={96}
              className="size-24 rounded-lg border border-border object-cover"
            />
            <button
              type="button"
              onClick={() => removeAt(i)}
              className="absolute -top-2 -right-2 flex size-6 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow"
            >
              <X className="size-3.5" />
            </button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
          className="size-24 flex-col gap-1"
        >
          {isUploading ? (
            <Loader2 className="size-5 animate-spin" />
          ) : (
            <ImagePlus className="size-5" />
          )}
          <span className="text-xs">Thêm</span>
        </Button>
      </div>
    </div>
  )
}
