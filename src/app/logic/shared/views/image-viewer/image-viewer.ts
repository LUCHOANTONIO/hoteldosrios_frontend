import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser'; // Importar esto

@Component({
  selector: 'app-image-viewer',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatIconModule],
  templateUrl: './image-viewer.html',
  styleUrl: './image-viewer.scss'
})
export class ImageViewerComponent {
  indice_imagen_actual: number = 0;  
  url_imagen_actual_safe!: SafeUrl; 
  tiene_varias_imagenes: boolean;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { url_imagenes: string[] },
    private sanitizer: DomSanitizer
  ) {
    this.tiene_varias_imagenes = this.data.url_imagenes.length > 1;
    this.actualizarImagen();
  }
  
  private actualizarImagen() {
    const rawBase64 = this.data.url_imagenes[this.indice_imagen_actual];   
    this.url_imagen_actual_safe = this.sanitizer.bypassSecurityTrustUrl(rawBase64);
  }

  prev() {
    if (this.indice_imagen_actual > 0) {
      this.indice_imagen_actual--;
    } else {
      this.indice_imagen_actual = this.data.url_imagenes.length - 1;
    }
    this.actualizarImagen();
  }

  next() {
    if (this.indice_imagen_actual < this.data.url_imagenes.length - 1) {
      this.indice_imagen_actual++;
    } else {
      this.indice_imagen_actual = 0;
    }
    this.actualizarImagen();
  }
}