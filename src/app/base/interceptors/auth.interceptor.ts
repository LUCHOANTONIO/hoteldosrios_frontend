import {HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AppService } from '../services/local/app.service';
import { AuthService } from '../services/auth.service';
import { AlertService } from '../services/local/alert.service';


export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router=inject(Router);
  const appService=inject(AppService);
  const authService=inject(AuthService);
  const alertService=inject(AlertService);
  let cloneReq=req;
  let access_token = appService.token.access_token;
  //token="eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwOi8vMTI3LjAuMC4xOjgwMDAvYXBpL2F1dGgvbG9naW4iLCJpYXQiOjE3MjI2NDQxMzUsImV4cCI6MTcyMjY0NzczNSwibmJmIjoxNzIyNjQ0MTM1LCJqdGkiOiJGVGpiN3FkQnczc0hodGEwIiwic3ViIjoiMSIsInBydiI6IjIzYmQ1Yzg5NDlmNjAwYWRiMzllNzAxYzQwMDg3MmRiN2E1OTc2ZjcifQ.GQ-qREAAK1e341X4DV5W0PYEW8zFyM4XlxhjT9zt1cI";
  if(access_token){
     // Clone the request and add the authorization header
    cloneReq=req.clone({
      setHeaders:{
        Authorization:'Bearer ' + access_token,
        rol_id:appService.session.ROL_ID.toString()
      }
    });
  }else{
    //router.navigate(['/login']);
  }
  // Pass the cloned request with the updated header to the next handler
     //return next(cloneReq);
  return next(cloneReq).pipe(
    catchError((err: any) => {
      if (err instanceof HttpErrorResponse) {
        // Handle HTTP errors
        if(err.status===422){
          alertService.show( err.error.errors,{type:'info'});
          //console.log(err);
          return throwError(() => err);
        }

        if (err.status === 401) {
          // Specific handling for unauthorized errors

              //console.log("reintentar");
              let access_token = appService.token.access_token;
              let cloneRequestNew = cloneReq.clone({
                setHeaders: {
                  Authorization:'Bearer ' + access_token
                }
              });
              return next(cloneRequestNew).pipe(
                catchError((error: any) => {
                  if (error instanceof HttpErrorResponse) {
                    // Handle HTTP errors
                    if (error.status === 401) {
                      //console.error('no autorizado:', error);
                      authService.triggerAuthChange(false);
                      appService.clear();
                      router.navigate(['/login']);
                    }
                  }
                  return throwError(() => error);
                })

              );

          console.error('no autorizado:', err);
          authService.triggerAuthChange(false);
          appService.clear();
          router.navigate(['/login']);
          // You might trigger a re-authentication flow or redirect the user here
        } else {
          // Handle other HTTP error codes
          //console.error('HTTP error:', err);
          alertService.show( err.statusText,{type:"error"});
        }
      } else {
        // Handle non-HTTP errors
        alertService.show( err.statusText,{type:"error"});
        console.error('Ocurrio un error:', err);
      }

      // Re-throw the error to propagate it further
      return throwError(() => err);
    })
  );
};
