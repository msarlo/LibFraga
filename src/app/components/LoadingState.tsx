"use client";

interface LoadingStateProps {
  message?: string;
}

export default function LoadingState({ message = "Carregando..." }: LoadingStateProps) {
  return (
    <div className="loading">
      <div className="loading-spinner"></div>
      <span>{message}</span>
    </div>
  );
}
