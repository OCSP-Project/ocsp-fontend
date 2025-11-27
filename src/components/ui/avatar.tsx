"use client";

import * as React from "react";

type Status = "online" | "away" | "busy" | "offline";

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: number | string;
  showStatus?: boolean;
  status?: Status;
}

const statusColor: Record<Status, string> = {
  online: "bg-green-400",
  away: "bg-yellow-400",
  busy: "bg-red-400",
  offline: "bg-gray-300",
};

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  (
    { className, size, showStatus = false, status = "online", style, ...props },
    ref
  ) => {
    const sizeStyle = size
      ? { width: size, height: size, minWidth: size, minHeight: size }
      : undefined;

    return (
      <div
        ref={ref}
        className={`relative flex shrink-0 overflow-hidden rounded-full border-2 border-white bg-gradient-to-br from-gray-100 to-gray-200 shadow-sm ${
          className || ""
        }`}
        style={{ ...(style || {}), ...(sizeStyle || {}) }}
        {...props}
      />
    );
  }
);
Avatar.displayName = "Avatar";

const AvatarImage = React.forwardRef<
  HTMLImageElement,
  React.ImgHTMLAttributes<HTMLImageElement>
>(({ className, ...props }, ref) => (
  <img
    ref={ref}
    className={`h-full w-full object-cover transition-transform duration-300 ease-in-out hover:scale-105 ${
      className || ""
    }`}
    decoding="async"
    {...props}
  />
));
AvatarImage.displayName = "AvatarImage";

const AvatarFallback = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={`flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-gray-200 to-gray-300 text-sm font-medium text-gray-700 ${
      className || ""
    }`}
    {...props}
  >
    {children ?? ""}
  </div>
));
AvatarFallback.displayName = "AvatarFallback";

// Helper small status dot component (to be used as child or automatically by consumer)
const AvatarStatus: React.FC<{ status?: Status; className?: string }> = ({
  status = "online",
  className,
}) => (
  <span
    className={`absolute right-0 bottom-0 inline-flex h-3 w-3 transform translate-x-1/4 translate-y-1/4 rounded-full ring-2 ring-white ${
      statusColor[status]
    } ${className || ""}`}
    aria-hidden="true"
  />
);

export { Avatar, AvatarImage, AvatarFallback, AvatarStatus };
