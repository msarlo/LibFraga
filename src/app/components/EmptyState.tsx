"use client";

interface EmptyStateProps {
  icon?: string;
  message: string;
  filteredMessage?: string;
  hasFilters?: boolean;
}

export default function EmptyState({
  icon = "📋",
  message,
  filteredMessage,
  hasFilters = false
}: EmptyStateProps) {
  const displayMessage = hasFilters && filteredMessage ? filteredMessage : message;

  return (
    <div className="empty-state">
      <div className="empty-state-icon">{icon}</div>
      <p>{displayMessage}</p>
    </div>
  );
}
