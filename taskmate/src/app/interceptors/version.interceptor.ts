import { HttpInterceptorFn } from '@angular/common/http';

export const versionInterceptor: HttpInterceptorFn = (req, next) => {
  const authReq = req.clone({
    setHeaders: {
      'X-App-Version': '1.0.0'
    }
  });
  return next(authReq);
};
