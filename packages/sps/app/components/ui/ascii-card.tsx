import * as React from "react";
import { cn } from "~/lib/utils";

interface AsciiCardProps extends React.ComponentProps<"div"> {
  id?: string;
}

// Utility function to calculate border width based on container width
function useBorderWidth(
  ref: React.RefObject<HTMLDivElement | null>,
  enabled: boolean = true
) {
  const [borderWidth, setBorderWidth] = React.useState(30);

  React.useEffect(() => {
    if (!ref.current || !enabled) return;

    const updateWidth = () => {
      const containerWidth = ref.current?.clientWidth ?? 0;
      // Calculate characters that can fit (accounting for borders and padding)
      // Each character is roughly 8px in monospace font
      const charWidth = Math.floor((containerWidth - 32) / 8) - 2; // -32 for padding, -2 for edge chars
      setBorderWidth(Math.max(charWidth, 20)); // minimum of 20 chars
    };

    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, [ref, enabled]);

  return borderWidth;
}

function AsciiCard({ className, id = "A001", ...props }: AsciiCardProps) {
  return (
    <div
      data-slot="ascii-card"
      className={cn(
        "font-tech bg-white text-black flex flex-col rounded-none",
        "border border-black/50 p-4",
        "transition-all duration-200",
        "hover:border-black hover:shadow-[0_0_10px_rgba(0,0,0,0.3)] group",
        className
      )}
      {...props}
    />
  );
}

// TODO: This will be used for the tags
function AsciiCardHeader({
  className,
  id,
  tags,
  ...props
}: React.ComponentProps<"div"> & {
  tags?: string[];
}) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const borderWidth = useBorderWidth(containerRef, !!tags);

  // Calculate max text length based on container width
  const maxTextLength = Math.max(borderWidth - 10, 10); // subtract padding and brackets

  // Truncate text with ellipsis if needed
  const formatText = (text: string) => {
    if (text.length <= maxTextLength) {
      return text.padEnd(maxTextLength, " ");
    }
    return text.slice(0, maxTextLength - 3) + "...";
  };

  return (
    <div
      ref={containerRef}
      data-slot="ascii-card-header"
      className={cn("border-b border-black/50 pb-2", className)}
    >
      {tags && (
        <pre className="mb-2 whitespace-pre overflow-hidden">
          +--[ {formatText(tags.join(", "))} ]--+
        </pre>
      )}
      {props.children}
    </div>
  );
}

function AsciiCardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="ascii-card-title"
      className={cn("font-bold text-lg pt-1 pb-2 text-black", className)}
    >
      {props.children}
    </div>
  );
}

function AsciiCardDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="ascii-card-description"
      className={cn("text-black/70 text-sm", className)}
    >
      {props.children}
    </div>
  );
}

function AsciiCardContent({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="ascii-card-content"
      className={cn(
        "py-2 border-t border-dashed border-black/50",
        "font-tech text-xs overflow-auto",
        className
      )}
    >
      {props.children}
    </div>
  );
}

function AsciiCardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="ascii-card-footer"
      className={cn(
        "mt-4 text-right text-xs font-tech text-black/70",
        "transition-colors",
        "group-hover:text-black",
        className
      )}
    >
      &lt;ACCESS&gt;
      {props.children}
    </div>
  );
}

export {
  AsciiCard,
  AsciiCardHeader,
  AsciiCardFooter,
  AsciiCardTitle,
  AsciiCardDescription,
  AsciiCardContent,
};
