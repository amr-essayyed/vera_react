
// src/lib/cookie.ts
// Cookie utility with localStorage-style API

export class CookieStorage {
  static setItem(name: string, value: string, days = 7, path = '/') {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; expires=${expires}; path=${path}`;
  }

  static getItem(name: string): string | null {
    return document.cookie.split('; ').reduce((r, v) => {
      const parts = v.split('=');
      return parts[0] === encodeURIComponent(name) ? decodeURIComponent(parts[1]) : r;
    }, null as string | null);
  }

  static removeItem(name: string, path = '/') {
    document.cookie = `${encodeURIComponent(name)}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}`;
  }
}
