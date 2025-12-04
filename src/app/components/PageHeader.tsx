"use client";

import Link from "next/link";

interface PageHeaderProps {
  title: string;
  actionLabel?: string;
  actionHref?: string;
  showAction?: boolean;
}

export default function PageHeader({
  title,
  actionLabel,
  actionHref,
  showAction = true
}: PageHeaderProps) {
  return (
    <div className="page-header">
      <h1>{title}</h1>
      {showAction && actionLabel && actionHref && (
        <Link href={actionHref} className="btn btn-primary">
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
