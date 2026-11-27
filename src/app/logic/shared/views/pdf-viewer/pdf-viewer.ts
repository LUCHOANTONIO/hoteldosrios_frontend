import { Component, Inject, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-pdf-viewer',
  templateUrl: './pdf-viewer.html',
  styleUrls: ['./pdf-viewer.scss'],
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule]
})
export class PdfViewerComponent implements OnDestroy {
  pdfSafeUrl: SafeResourceUrl | null = null;
  titulo_documento: string;
  nombre_archivo: string;
  isIOS: boolean = false;
  isSafari: boolean = false;
  canNativeShare: boolean = false;
  pdfError: boolean = false;
  descargando: boolean = false;
  private blobUrl: string | null = null;
  private pdfBlob: Blob | null = null;

  constructor(
    private dialogRef: MatDialogRef<PdfViewerComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { pdf_base64: string; titulo_documento: string },
    private sanitizer: DomSanitizer
  ) {
    this.titulo_documento = this.data?.titulo_documento || 'Comprobante';
    this.nombre_archivo = this.getNombreArchivo();
    this.isIOS = this.detectIOS();
    this.isSafari = this.detectSafari();
    this.inicializarPdf();
  }

  private detectIOS(): boolean {
    if (typeof navigator === 'undefined') {
      return false;
    }
    const ua = navigator.userAgent || '';
    return /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  }

  private detectSafari(): boolean {
    if (typeof navigator === 'undefined') {
      return false;
    }
    const ua = navigator.userAgent || '';
    return /Safari/i.test(ua) && !/Chrome|CriOS|FxiOS|EdgiOS|OPiOS|Android/i.test(ua);
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
      this.pdfBlob = new Blob([byteArray], { type: 'application/pdf' });

      this.blobUrl = URL.createObjectURL(this.pdfBlob);
      this.pdfSafeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.blobUrl);
      this.canNativeShare = this.checkNativeShareSupport();
    } catch {
      this.pdfError = true;
    }
  }

  private checkNativeShareSupport(): boolean {
    if (typeof navigator === 'undefined' || !this.pdfBlob) {
      return false;
    }
    try {
      const nav: any = navigator;
      if (typeof nav.share !== 'function') {
        return false;
      }
      const file = new File([this.pdfBlob], this.nombre_archivo, { type: 'application/pdf' });
      if (typeof nav.canShare === 'function') {
        return nav.canShare({ files: [file] });
      }
      return this.isIOS;
    } catch {
      return false;
    }
  }

  getNombreArchivo(): string {
    const base = (this.titulo_documento || 'Comprobante')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9_\-\s]/g, '')
      .trim()
      .replace(/\s+/g, '_');
    return `${base || 'Comprobante'}.pdf`;
  }

  async compartirODescargarIOS(): Promise<void> {
    if (!this.pdfBlob) {
      return;
    }
    const nav: any = navigator;
    if (this.canNativeShare && typeof nav.share === 'function') {
      try {
        const file = new File([this.pdfBlob], this.nombre_archivo, {
          type: 'application/pdf',
          lastModified: Date.now()
        });
        await nav.share({
          files: [file],
          title: this.titulo_documento
        });
        return;
      } catch (err: any) {
        if (err && err.name === 'AbortError') {
          return;
        }
      }
    }
    this.ejecutarDescargaDirecta();
  }

  iniciarSpinnerDescarga(): void {
    this.descargando = true;
    setTimeout(() => {
      this.descargando = false;
    }, 1500);
  }

  descargarPdf(): void {
    if (!this.pdfBlob || !this.blobUrl || this.descargando) {
      return;
    }

    this.iniciarSpinnerDescarga();
    this.ejecutarDescargaDirecta();
  }

  ejecutarDescargaDirecta(): void {
    if (!this.blobUrl) {
      return;
    }
    const fileName = this.getNombreArchivo();
    const link = document.createElement('a');
    link.href = this.blobUrl;
    link.setAttribute('download', fileName);
    if (this.isIOS || this.isSafari) {
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
    }
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      if (link.parentNode) {
        document.body.removeChild(link);
      }
    }, 250);
  }

  abrirEnNuevaPestana(): void {
    if (!this.blobUrl) {
      return;
    }
    const win = window.open(this.blobUrl, '_blank', 'noopener,noreferrer');
    if (!win) {
      window.location.assign(this.blobUrl);
    }
  }

  close(): void {
    this.dialogRef.close();
  }

  ngOnDestroy(): void {
    if (this.blobUrl) {
      const urlToRevoke = this.blobUrl;
      this.blobUrl = null;
      // En Safari iOS dar margen de tiempo para que una descarga o pestaña recién abierta no pierda el Blob URL
      setTimeout(() => {
        URL.revokeObjectURL(urlToRevoke);
      }, 60000);
    }
  }
}
