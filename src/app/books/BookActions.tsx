'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';

type BookActionsProps = {
  bookId: string;
};

export default function BookActions({ bookId }: BookActionsProps) {
  const router = useRouter();

  const handleDelete = async () => {
    if (confirm('Tem certeza que deseja excluir este livro?')) {
      const res = await fetch(`/api/books/${bookId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        // Refresh the page to show the updated list
        router.refresh();
      } else {
        const data = await res.json();
        alert(`Erro ao excluir o livro: ${data.error}`);
      }
    }
  };

  return (
    <div style={{ display: 'flex', gap: '0.5rem' }}>
      <Link href={`/books/form/${bookId}`} className="btn btn-secondary">
        Editar
      </Link>
      <button onClick={handleDelete} className="btn btn-danger">
        Excluir
      </button>
    </div>
  );
}
