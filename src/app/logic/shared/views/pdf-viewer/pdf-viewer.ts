import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-pdf-viewer',
  templateUrl: './pdf-viewer.html',
  styleUrls: ['./pdf-viewer.scss'],
  standalone: true,
  imports: [MatDialogModule, MatButtonModule]
})
export class PdfViewerComponent {
  pdfBase64: SafeResourceUrl;
  titulo_documento: string;

  constructor(
    private dialogRef: MatDialogRef<PdfViewerComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { pdf_base64: string; titulo_documento: string },
    private sanitizer: DomSanitizer
  ) {
    // Sanitiza la URL Base64 para marcarla como segura
    const pdfUrl = `data:application/pdf;base64,${this.data.pdf_base64}`;
    this.pdfBase64 = this.sanitizer.bypassSecurityTrustResourceUrl(pdfUrl);
    this.titulo_documento = this.data.titulo_documento || 'Comprobante'; // Usa el título inyectado o un valor por defecto
  }

  close() {
    this.dialogRef.close();
  }
}
