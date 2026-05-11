function resolveApiBase(fallback: string): string {
  if (typeof window === 'undefined' || !window.location?.hostname) {
    return fallback;
  }
  const { protocol, hostname } = window.location;
  return `${protocol}//${hostname}:3000`;
}

export const environment = {
  production: true,
  apiBase: resolveApiBase('http://localhost:3000')
};
