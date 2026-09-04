import { CdkDrag, CdkDragHandle } from '@angular/cdk/drag-drop';
import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { AlertOptions } from '../../../interfaces/alert-options';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-confirm',
  standalone: true,
  imports: [MatDialogModule,MatButtonModule,CdkDrag,CdkDragHandle,MatProgressBarModule,MatIconModule],
  templateUrl: './alert.html',
  styleUrl: './alert.scss'
})
export class AlertComponent {
  messages:any;
  alertOptions:AlertOptions={};
  tiempoRestante!:number;
  constructor(
    public dialogRef: MatDialogRef<AlertComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {messages:any,alertOptions:AlertOptions}) {
    this.messages=this.convertirParametroAStringArray(data.messages);
    
    this.alertOptions.messagesClass="";
    this.alertOptions.title="Mensaje";
    this.alertOptions.titleClass="";
    this.alertOptions.headerClass="text-bg-dark";
    this.alertOptions.OKText="Aceptar";
    this.alertOptions.cancelText="Cancelar";
    this.alertOptions.cancelShow=false;
    this.alertOptions.duration=0;
    this.alertOptions.icon="info";
    this.alertOptions.type="info";
    
    //pasando datos con valor a las opciones de alert
    // Object.keys(data.alertOptions).forEach(key => {
    //   if (data.alertOptions[key] !== undefined) {
    //     this.alertOptions[key] = data.alertOptions[key];
    //   }
    // });

    Object.keys(data.alertOptions).forEach(key => { //Correccion angular 20
      const k = key as keyof AlertOptions;
      const value = data.alertOptions[k];
      if (value !== undefined) {       
        (this.alertOptions as any)[k] = value;
      }
    });

    let type=data.alertOptions.type;
    if(type){
      let icon=data.alertOptions.icon;
      if(!icon){
        this.alertOptions.icon=type;
        if(type=="success") this.alertOptions.icon="check_circle";       
      }
      let hClass=data.alertOptions.headerClass;
      if(!hClass){
        this.alertOptions.headerClass="text-white bg-"+type;
        if(type=="error") this.alertOptions.headerClass="text-white bg-danger";
      }
    }

     if(this.alertOptions.duration>0){   
       setTimeout(() => {
          this.dialogRef.close();    
       }, this.alertOptions.duration);
     }
  }
  
  onNoClick(): void {
    // this.dialogRef.close();
    this.dialogRef.close(false);
  }

  OnOKClick():void{
    // this.dialogRef.close({ data: 'OK' });
    this.dialogRef.close(true);
  }

  convertirParametroAStringArray(param: any) {
    if (typeof param === 'string') {
      return [param];//lo volvemos array
    } else if (Array.isArray(param)) {
      //console.log('Es un array de cadenas:', param);
      return param;
    } else if (typeof param === 'object' && param !== null) {
      //console.log('Es un array de clave-valor:', param);
      let vector:string[]=[];
      // Object.keys(param).forEach(key => {
      //    let mensajesArray = param[key];
      //    mensajesArray.forEach(m => {
      //      vector.push("<strong>"+key+"</strong>:"+m);
      //    });
      // });
      Object.entries(param).forEach(([key, mensajesArray]) => { //Correccion angular 20
          if (Array.isArray(mensajesArray)) {
            mensajesArray.forEach(m => {
              vector.push(`<strong>${key}</strong>: ${m}`);
            });
          } else if (mensajesArray != null) {
            vector.push(`<strong>${key}</strong>: ${mensajesArray}`);
          }
      });
      return vector;
    } else {
      throw new Error('Tipo de parámetro no soportado');
    }
  }
}
