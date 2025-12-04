export function isValidIsbn13(isbn: string): boolean {
    const digits = (isbn || '').replace(/[^0-9]/g, '');
    if (digits.length !== 13) return false;
    const sum = digits
        .split('')
        .map((d, i) => parseInt(d, 10) * (i % 2 === 0 ? 1 : 3))
        .reduce((a, b) => a + b, 0);
    return sum % 10 === 0;
}

export function isValidIsbn10(isbn: string): boolean {
    const s = (isbn || '').replace(/[^0-9Xx]/g, '');
    if (s.length !== 10) return false;
    let sum = 0;
    for (let i = 0; i < 9; i++) {
        const d = parseInt(s[i], 10);
        if (Number.isNaN(d)) return false;
        sum += d * (10 - i);
    }
    const checkChar = s[9].toUpperCase();
    const check = checkChar === 'X' ? 10 : parseInt(checkChar, 10);
    if (Number.isNaN(check)) return false;
    sum += check;
    return sum % 11 === 0;
}

export function isValidIsbn(isbn: string): boolean {
    if (!isbn || typeof isbn !== 'string') return false;
    const cleaned = isbn.replace(/[^0-9Xx]/g, '');
    if (cleaned.length === 13) return isValidIsbn13(isbn);
    if (cleaned.length === 10) return isValidIsbn10(isbn);
    return false;
}

export function generateIsbn13(): string {
  const prefixo = "171";
  const noveDigitos = Array.from({ length: 9 }, () =>
    Math.floor(Math.random() * 10)
  ).join("");

  const isbn12 = prefixo + noveDigitos;

  const sum = isbn12.split("").reduce((acc, digit, index) => {
    const num = parseInt(digit, 10);

    const peso = index % 2 === 0 ? 1 : 3;
    return acc + num * peso;
  }, 0);

  const checkDigit = (10 - (sum % 10)) % 10;

  const isbn13Completo = isbn12 + checkDigit;

  const formattedIsbn =
    isbn13Completo.substring(0, 3) +
    "-" +
    isbn13Completo.substring(3, 4) +
    "-" +
    isbn13Completo.substring(4, 6) +
    "-" +
    isbn13Completo.substring(6, 12) +
    "-" +
    isbn13Completo.substring(12);

  return formattedIsbn;
}