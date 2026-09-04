import { HttpInterceptorFn } from '@angular/common/http';
import { LoaderService } from '../services/local/loader.service';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';

export const loaderInterceptor: HttpInterceptorFn = (req, next) => {
  // Verifica si la solicitud tiene un encabezado personalizado para omitir el interceptor
    if (req.headers.has('skip-loader')) {
      return next(req);
    }
    
   const loaderService=inject(LoaderService);
   setTimeout(() => loaderService.isLoading.next(true));

  //return next(req);
  return next(req).pipe(
    finalize(()=>{
      setTimeout(() => loaderService.isLoading.next(false));
    })
  );
};
