//MODELS
import { ReservaArchivoModel } from '../../../models/reservaarchivo.model';
import { ReservaModel } from '../../../models/reserva.model';
import { TipoDocumentoModel } from '../../../../base/models/tipodocumento.model';

//SERVICES
import { ReservaArchivoService } from '../../../services/reservaarchivo.service';

//MATERIAL DESING
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSliderModule } from '@angular/material/slider';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

//DIRECTIVAS
import { BotonGuardarDirective } from '../../../../base/shared/directives/boton-guardar.directive';
import { PreventEnterSubmitDirective } from '../../../../base/shared/directives/prevent-enter-submit.directive';
import { PreventEnterSelectDirective } from '../../../../base/shared/directives/prevent-enter-select.directive';

//VARIOS
import { Component, ViewChild, ElementRef, Inject } from '@angular/core';
import { FormsModule, NgForm} from '@angular/forms';
import { CdkDrag, CdkDragHandle } from '@angular/cdk/drag-drop';
import { AnimarPerderFocoDirective } from '../../../../base/shared/directives/animar-perder-foco.directive';
import { AlertService } from '../../../../base/services/local/alert.service';

import { AngularCropperjsModule, CropperComponent} from 'angular-cropperjs';
import { TipoArchivoModel } from '../../../models/tipo_archivo.model';
import { PersonaService } from '../../../../base/services/persona.service';

@Component({
  selector: 'app-reserva_archivo-form',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatFormFieldModule,
    MatInputModule, FormsModule, MatDividerModule,
    MatSelectModule, MatOptionModule,
    MatProgressSpinnerModule,MatIconModule,MatCheckboxModule,
    CdkDrag, CdkDragHandle,AngularCropperjsModule, MatSliderModule,MatSlideToggleModule,
    AnimarPerderFocoDirective,BotonGuardarDirective,PreventEnterSubmitDirective,PreventEnterSelectDirective],
  templateUrl: './reserva_archivo-form.html',
  styleUrls: ['./reserva_archivo-form.scss']
})

export class ReservaArchivoFormComponent {
      @ViewChild(BotonGuardarDirective) botonGuardarDirectiva!: BotonGuardarDirective;
      @ViewChild('angularCropper') public angularCropper: CropperComponent;
      @ViewChild('canvasRecorte', { static: false }) canvasRecorte: ElementRef<HTMLCanvasElement>;
      tipo_documentos:TipoDocumentoModel[];
      tipo_archivo:TipoArchivoModel[]=[];
      reservaArchivo:ReservaArchivoModel;
      reserva:ReservaModel;
      url_archivo_lado_cliente:string="";
      archivoInicial:File|null=null;    
      archivoFinal: File | null = null;
      mostrarEditorImagen:boolean=false;
      modificarOCargarImagen:boolean=false; // se debe modificar imagen?
      cropperOptions:any={};
      valorCalidad=100;          

      constructor(
          public dialogRef: MatDialogRef<ReservaArchivoFormComponent>,
          @Inject(MAT_DIALOG_DATA) public data: any,
          private reservaArchivoService:ReservaArchivoService,
          private alertService:AlertService,
          private personaService: PersonaService 
      ){
          this.reservaArchivo = data.reservaArchivo;
          this.tipo_archivo = data.tipo_archivo;
          this.reserva = data.reserva;
          this.tipo_documentos = data.tipo_documentos;
          this.dialogRef.backdropClick().subscribe(x => {})
          if(this.reservaArchivo.id<=0){
              this.modificarOCargarImagen=true;
          }
      }

      cargarArchivoPorUrlEdicion(){         
         this.reservaArchivoService.cargarImagenBlobDesdeURL(this.reservaArchivo.url).subscribe({
           next:(blob)=>{
             this.archivoInicial=<File>blob;
             this.cargarArchivoEnCotenedor(this.archivoInicial);
           },
           error:(error)=>{
             console.log(error);
           }
         });
      }

      onFileChange(event) {
        this.archivoInicial = event.target.files[0];
        this.archivoFinal=this.archivoInicial//Modificado 08/03/2026 
        this.cargarArchivoEnCotenedor(this.archivoInicial);
        this.reservaArchivo.nombre_archivo=this.archivoInicial.name;
      }           

      cargarArchivoEnCotenedor(archivo:File){     
        this.url_archivo_lado_cliente=URL.createObjectURL(archivo);           
        this.validarTamanioArchivo(archivo);
        this.mostrarEditorImagen=true;
      }
      
      croppImage(){
        let canvasCropped=this.angularCropper.cropper.getCroppedCanvas();
        this.cargarImagenCanvas("#canvas_preview",canvasCropped,this.archivoInicial.type,100);
        this.valorCalidad=100;
        this.mostrarEditorImagen=false;       
      }

      cambioCalidad(valor:number){   
        let canvasCropped=this.angularCropper.cropper.getCroppedCanvas();
        this.cargarImagenCanvas("#canvas_preview",canvasCropped,this.archivoInicial.type,valor);
      }

      cargarImagenCanvas(id_canvas, imagen:any, tipoArchivo, porcentajeCalidad) {
        let ancho = (porcentajeCalidad / 100) * imagen.width;
        let alto=(porcentajeCalidad / 100) *imagen.height ;
        let canvas =<HTMLCanvasElement>document.querySelector(id_canvas);
        canvas.width = ancho;
        canvas.height = alto;
        const ctx = canvas.getContext("2d");
        ctx.save();
        ctx.drawImage(imagen, 0, 0,ancho,alto);
        ctx.restore();
        canvas.toBlob(
          (blob) => {
                      this.archivoFinal=<File>blob;
                      this.validarTamanioArchivo(this.archivoFinal);
                    },tipoArchivo
                    , 1
                    );
      }

      validarTamanioArchivo(archivo :File){
        let tamLimite_KB = 2048; //limite
        let tamArchivo_Byte = archivo.size// tamaño en bytes
        let tamArchivo_KB = parseInt((tamArchivo_Byte / 1024).toFixed(0)); //tamaño en kiloBytes
        let tamArchivo_MB = (tamArchivo_KB / 1024).toFixed(2); //tamaño en MegaBytes
        let msg:string;
        if (tamArchivo_KB > tamLimite_KB) { //comparando con tamaño limite
            msg = '<p  class="text-danger"> ( El archivo pesa ' + tamArchivo_MB + 'MB, y el limite a subir es de: ' + (tamLimite_KB / 1024) + 'MB )</p>';
        } else {
            msg = tamArchivo_KB < 1024 ? "(" + tamArchivo_KB + "KB)" : msg = tamArchivo_MB + "MB)";
            msg = '<p  class="text-success">'+ msg+'</p>';
        }
        let mensaje=document.getElementById("archivo-msg-error");
        mensaje.innerHTML =msg;
      }

      
      // CONTROLADO IMAGEN
      selectAllImageCropper(){
        let imgdata=this.angularCropper.cropper.getImageData();
        let canvas=this.angularCropper.cropper.getCanvasData();
        this.angularCropper.cropper.setCropBoxData({ top:canvas.top, left:canvas.left, width:imgdata.width, height:imgdata.height });
      }
      rotacion(event:any){
        let valor=event.srcElement.value;
        this.angularCropper.cropper.rotateTo(valor)
      }
      zoom(event:any){
        let valor=event.srcElement.value;
        this.angularCropper.cropper.zoomTo(valor);
      }
      
      rotateLeft(){
        this.angularCropper.cropper.rotate(-90);
      }
      rotateRight(){
        this.angularCropper.cropper.rotate(90);
      }
      flipHorizontal(){
        let x=this.angularCropper.cropper.getData().scaleX*-1;
        this.angularCropper.cropper.scaleX(x);
      }
      flipVertical(){
        let y=this.angularCropper.cropper.getData().scaleY*-1;
        this.angularCropper.cropper.scaleY(y);
      }

      moveLeft() {
        this.angularCropper.cropper.move(-10, 0);
      }

      moveRight() {
        this.angularCropper.cropper.move(10, 0);
      }

      moveTop() {
        this.angularCropper.cropper.move(0, -10);
      }
      moveBottom() {
        this.angularCropper.cropper.move(0, 10);
      }

      zoomOut() {
          this.angularCropper.cropper.zoom(-0.1);
      }

      zoomIn() {
          this.angularCropper.cropper.zoom(0.1);
      }

      toggleAspectRatioFree(){
        this.angularCropper.cropper.setAspectRatio(NaN);
        this.selectAllImageCropper();
      }
      toggleAspectRatio11(){
        this.angularCropper.cropper.setAspectRatio(1);
      }

      toggleAspectRatio43(){
        this.angularCropper.cropper.setAspectRatio(4/3);
      }

      toggleAspectRatio169(){
        this.angularCropper.cropper.setAspectRatio(16/9);
      }

      resetImage() {
        this.cargarArchivoEnCotenedor(this.archivoInicial);
        this.angularCropper.cropper.reset();
        this.valorCalidad=100;
      }

      toggleMostrarEditorImagen(){
        if(this.mostrarEditorImagen==true && this.archivoInicial!=null){
          this.croppImage();          
        }
      }

      toggleModificarimagen(){
        if(this.modificarOCargarImagen==false){
          if(this.archivoInicial==null)
            this.cargarArchivoPorUrlEdicion();
        }
      }

   submit(f: NgForm) {

        if (!f.valid) {                               
            this.alertService.show("Debe llenar los campos correctamente", {duration: 4000, type: "info"});
            return;
        }

        this.botonGuardarDirectiva.deshabilitarFormBoton();

        if (this.reservaArchivo.id > 0) {            
            this.modificar();
        } 
        else if (this.archivoFinal) {
            // Es creación y tenemos el archivo físico (Blob)
            this.crear();
        } 
        else {           
            this.alertService.show("Debe seleccionar un archivo para continuar", {duration: 4000, type: "warning"});
            this.botonGuardarDirectiva.habilitarFormBoton();
        }
    }

    crear(){
      // this.reservaArchivo.secuencia=1;
      this.reservaArchivo.reserva_id=this.reserva.id;
      //this.reservaArchivo.nombre=this.archivo.name;
      this.reservaArchivo.tipo_archivo_id=1;//1=imagen
      
      this.reservaArchivoService.crear(this.reservaArchivo,this.archivoFinal).subscribe({
        next:(res)=>{
          this.dialogRef.close({ data: this.data });
        },
        error:(error)=>{
          this.botonGuardarDirectiva.habilitarFormBoton();
        }
      })
    }

    modificar(){
      this.reservaArchivoService.modificar(this.reservaArchivo,this.archivoFinal).subscribe({
        next:(res)=>{
          this.dialogRef.close({ data: this.data });
        },
        error:(error)=>{
          this.botonGuardarDirectiva.habilitarFormBoton();
        }
      })
    }

    verificarNroDocumento(nro_documento:string){      
        if(nro_documento?.trim()){            
            this.personaService.personaPorNroDocumento(nro_documento).subscribe({
                next: (res) => {
                  if(Object.keys(res).length!=0) {

                      const {                       
                        tipo_doc_id,
                        nombre,
                        primer_apellido,
                        segundo_apellido                                             
                      } = res;

                      this.reservaArchivo.tipo_doc_id=Number(tipo_doc_id);
                      this.reservaArchivo.nombre=nombre;
                      this.reservaArchivo.primer_apellido=primer_apellido;
                      this.reservaArchivo.segundo_apellido=segundo_apellido;
                      
                      this.alertService.show("El cliente ya fue registrado anteriormente", {duration: 5000, type: "info"});
                     
                  } else {
                      this.reservaArchivo.tipo_doc_id=null;
                      this.reservaArchivo.nombre="";
                      this.reservaArchivo.primer_apellido="";
                      this.reservaArchivo.segundo_apellido="";                                         
                  }
                },
                error: (error) => {
                  console.error(error);
                }
          });
       }      
    }

    // -----------------------------------------------------------------------
}
