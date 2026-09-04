import { Directive, HostListener, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ImageViewerComponent } from '../views/image-viewer/image-viewer';

@Directive({
  selector: '[appImageViewer]',
  standalone: true
})
export class ImageViewerDirective {
  @Input() url_imagenes:string[]; // Referencia al formulario reactivo
  
  constructor(private dialog: MatDialog) { }
  
  @HostListener('click')
  onClick() {
    this.abrirVisorImagen(this.url_imagenes)
  }

  abrirVisorImagen(url_imagenes:string[]){
    const dialogRef = this.dialog.open(ImageViewerComponent,
      { data: {url_imagenes: url_imagenes},
      width: "98vw",
      maxWidth: "1200px",
      });
  }

}
