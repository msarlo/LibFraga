import { prisma } from '@/lib/prisma';
import BookForm from '../../BookForm';


type BookFormPageProps = {
  params: {
    id?: string[];
  };
};

export default async function BookFormPage({ params }: BookFormPageProps) {
  const bookId = params.id?.[0];
  let book = null;

  const isEditMode = Boolean(bookId);

  if (isEditMode) {
    book = await prisma.book.findUnique({
      where: {
        id: bookId,
      },
    });

    if (!book) {
      return (
        <div style={{ textAlign: 'center' }}>
          <h2>Livro não encontrado</h2>
          <p>O livro que você está tentando editar não existe.</p>
        </div>
      );
    }
  }

  return (
    <div>
      <h2>{isEditMode ? 'Editar Livro' : 'Adicionar Novo Livro'}</h2>
      <BookForm book={book ?? undefined} />
    </div>
  );
}
