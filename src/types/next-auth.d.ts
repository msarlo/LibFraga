import 'next-auth';
import 'next-auth/jwt';

declare module 'next-auth' {
  /**
   * Extensão do tipo da sessão para incluir as propriedades personalizadas
   */
  interface Session {
    user: {
      id: string;
      role: string;
    } & DefaultSession['user'];
  }

  /**
   * Extensão do tipo do usuário para incluir as propriedades personalizadas
   */
  interface User {
    id: string;
    role: string;
  }
}

declare module 'next-auth/jwt' {
  /**
   * Extensão do tipo do token JWT para incluir as propriedades personalizadas
   */
  interface JWT {
    id: string;
    role: string;
  }
}
