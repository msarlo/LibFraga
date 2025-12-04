'use client';

import Link from 'next/link';

type BookActionsProps = {
  bookId: string;
  onDeleted: () => void;
};

export default function BookActions({ bookId, onDeleted }: BookActionsProps) {
  const handleDelete = async () => {
    if (confirm('Tem certeza que deseja excluir este livro?')) {
      try {
        const res = await fetch(`/api/books/${bookId}`, {
          method: 'DELETE',
        });

        if (res.ok) {
          onDeleted();
        } else {
          const data = await res.json();
          alert(`Erro ao excluir o livro: ${data.error}`);
        }
      } catch (error) {
        console.error('Error deleting book:', error);
        alert('Erro ao excluir o livro.');
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

