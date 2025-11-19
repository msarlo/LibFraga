import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'LibFraga - Sistema de Biblioteca',
  description: 'Sistema de gerenciamento de biblioteca',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
