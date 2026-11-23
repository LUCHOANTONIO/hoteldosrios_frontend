import { Component, Inject, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-pdf-viewer',
  templateUrl: './pdf-viewer.html',
  styleUrls: ['./pdf-viewer.scss'],
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatIconModule]
})
export class PdfViewerComponent implements OnDestroy {
  pdfSafeUrl: SafeResourceUrl | null = null;
  titulo_documento: string;
  isIOS: boolean = false;
  pdfError: boolean = false;
  private blobUrl: string | null = null;

  constructor(
    private dialogRef: MatDialogRef<PdfViewerComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { pdf_base64: string; titulo_documento: string },
    private sanitizer: DomSanitizer
  ) {
    this.titulo_documento = this.data?.titulo_documento || 'Comprobante';
    this.isIOS = this.detectIOS();
    this.inicializarPdf();
  }

  private detectIOS(): boolean {
    if (typeof navigator === 'undefined') {
      return false;
    }
    const ua = navigator.userAgent || '';
    return /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  }

  private inicializarPdf(): void {
    const rawBase64 = (this.data?.pdf_base64 || '')
      .replace(/^data:application\/pdf;base64,/, '')
      .replace(/\s+/g, '');

    if (!rawBase64) {
      this.pdfError = true;
      return;
    }

    try {
      const byteCharacters = atob(rawBase64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/pdf' });

      this.blobUrl = URL.createObjectURL(blob);
      this.pdfSafeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.blobUrl);
    } catch {
      this.pdfError = true;
    }
  }

  private getNombreArchivo(): string {
    const base = (this.titulo_documento || 'Comprobante')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9_\-\s]/g, '')
      .trim()
      .replace(/\s+/g, '_');
    return `${base || 'Comprobante'}.pdf`;
  }

  descargarPdf(): void {
    if (!this.blobUrl) {
      return;
    }
    const link = document.createElement('a');
    link.href = this.blobUrl;
    link.download = this.getNombreArchivo();
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  close(): void {
    this.dialogRef.close();
  }

  ngOnDestroy(): void {
    if (this.blobUrl) {
      URL.revokeObjectURL(this.blobUrl);
      this.blobUrl = null;
    }
  }
}
