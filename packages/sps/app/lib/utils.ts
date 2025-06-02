import { clsx, type ClassValue } from "clsx"
import { toast } from "sonner";
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export const copyToClipboard = async (text: string, type: "id" | "prompt") => {
    try {
      await navigator.clipboard.writeText(text);
      toast(`copied ${type}`);
    } catch (err) {
      console.error("Failed to copy text: ", err);
      toast.error("Failed to copy");
    }
  };