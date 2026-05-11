// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

/** Misma máquina / misma red: el API suele estar en el puerto 3000 que el host de la app. */
function resolveApiBase(fallback: string): string {
  if (typeof window === 'undefined' || !window.location?.hostname) {
    return fallback;
  }
  const { protocol, hostname } = window.location;
  return `${protocol}//${hostname}:3000`;
}

export const environment = {
  production: false,
  apiBase: resolveApiBase('http://localhost:3000')
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
