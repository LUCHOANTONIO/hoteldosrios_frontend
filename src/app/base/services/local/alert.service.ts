import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AlertComponent } from '../../shared/views/alert/alert';
import { AlertOptions } from '../../interfaces/alert-options';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class AlertService  {
  
  constructor(private dialog: MatDialog) { }

    show(messages:string,alertOptions:AlertOptions={width:"98vw",maxWidth:"400px",disableClose:true,
            enterAnimationDuration:0,exitAnimationDuration:0}):Observable<string>
    {
      const result$ = new Subject<string>();
      const dialogRef =this.dialog.open(AlertComponent,
        { data: {messages:messages,alertOptions:alertOptions},
          width:alertOptions.width ,
          maxWidth: alertOptions.maxWidth,
          disableClose:alertOptions.disableClose,
          enterAnimationDuration:alertOptions.enterAnimationDuration,
          exitAnimationDuration:alertOptions.exitAnimationDuration,
        });
        dialogRef.afterClosed().subscribe(result => {
          //if(result) {
            //acciones luego de cerrar
          result$.next(result);
          //}
          result$.complete();
        });
        return result$.asObservable();
    }


}
