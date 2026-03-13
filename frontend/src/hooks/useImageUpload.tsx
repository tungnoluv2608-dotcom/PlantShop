import { useState, useRef } from "react";
import { api } from "../services/apiService";

const BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
// We want to remove the '/api' from the base URL since the upload path is statically served at the root
const BASE_URL = BASE.replace("/api", "");

interface UseImageUploadOptions {
  multiple?: boolean;
}


export function useImageUpload({ multiple = false }: UseImageUploadOptions = {}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const triggerUpload = () => {
    inputRef.current?.click();
  };

  const uploadFile = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("image", file);
    const res = await api.post("/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    const url = `${BASE_URL}${res.data.url}`;
    console.log("Uploaded single file URL:", url);
    return url;
  };

  const uploadFiles = async (files: File[]): Promise<string[]> => {
    const formData = new FormData();
    files.forEach((f) => formData.append("images", f));
    const res = await api.post("/upload/multiple", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    const finalUrls = (res.data.urls as string[]).map(url => `${BASE_URL}${url}`);
    console.log("Uploaded multiple files URLs:", finalUrls);
    return finalUrls;
  };

  const handleChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    onSuccess: (urls: string[]) => void
  ) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploading(true);
    setError(null);
    try {
      let urls: string[];
      if (multiple) {
        urls = await uploadFiles(files);
      } else {
        const url = await uploadFile(files[0]);
        urls = [url];
      }
      onSuccess(urls);
    } catch {
      setError("Upload thất bại. Vui lòng thử lại.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const InputElement = (props: {
    onSuccess: (urls: string[]) => void;
    accept?: string;
  }) => (
    <input
      ref={inputRef}
      type="file"
      accept={props.accept ?? "image/*"}
      multiple={multiple}
      className="hidden"
      onChange={(e) => handleChange(e, props.onSuccess)}
    />
  );

  return { triggerUpload, uploading, error, InputElement };
}
