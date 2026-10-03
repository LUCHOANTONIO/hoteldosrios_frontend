import { Component, Inject, ViewChild, AfterViewInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginator, MatPaginatorIntl, MatPaginatorModule } from '@angular/material/paginator';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CdkDrag, CdkDragHandle } from '@angular/cdk/drag-drop';
import { ProductoModel } from '../../../models/producto.model';
import { CategoriaModel } from '../../../models/categoria.model';
import { ProductoService } from '../../../services/producto.service';
import { CategoriaService } from '../../../services/categoria.service';
import { SpanishPaginatorIntl } from '../../../../base/utils/spanish-paginator-intl';

export interface CatalogoItemResultado {
  producto: ProductoModel;
  producto_id: number;
  descripcion: string;
  categoria_id: number;
  cantidad: number;
  precio_unitario: number;
  total: number;
}

export interface CatalogoProductoData {
  productos: ProductoModel[];
  categorias?: CategoriaModel[];
  productoSeleccionadoId?: number | null;
  onAgregarItem?: (item: CatalogoItemResultado) => Promise<boolean | void> | boolean | void;
}

@Component({
  selector: 'app-catalogo-producto-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatPaginatorModule,
    MatTooltipModule,
    MatRadioModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    CdkDrag,
    CdkDragHandle
  ],
  templateUrl: './catalogo-producto-modal.html',
  styleUrl: './catalogo-producto-modal.scss',
  providers: [{ provide: MatPaginatorIntl, useClass: SpanishPaginatorIntl }]
})
export class CatalogoProductoModalComponent implements AfterViewInit {
  displayedColumns: string[] = ['select', 'categoria', 'descripcion', 'precio'];
  dataSource: MatTableDataSource<ProductoModel>;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  private productoService = inject(ProductoService, { optional: true });
  private categoriaService = inject(CategoriaService, { optional: true });

  productos: ProductoModel[] = [];
  categorias: CategoriaModel[] = [];

  productoSeleccionado: ProductoModel | null = null;
  cantidad: number = 1;
  precioUnitario: number = 0;
  subtotal: number = 0;

  categoriaFiltroId: number | null = null;
  textoBusqueda: string = '';
  isProcessing: boolean = false;
  itemsAgregadosCount: number = 0;

  constructor(
    public dialogRef: MatDialogRef<CatalogoProductoModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: CatalogoProductoData
  ) {
    this.productos = data?.productos && Array.isArray(data.productos) ? [...data.productos] : [];
    this.categorias = data?.categorias && Array.isArray(data.categorias) ? [...data.categorias] : [];

    // 1. Extraer categorías si los productos ya vienen con el nombre de categoría
    this.extraerCategoriasDeProductos();

    // 2. Si no hay productos pasados o viene vacío, cargarlos con ProductoService
    if (this.productos.length === 0 && this.productoService) {
      this.productoService.listar().subscribe({
        next: (res: any) => {
          let prods: ProductoModel[] = [];
          if (Array.isArray(res)) {
            prods = res;
          } else if (res && Array.isArray(res.productos)) {
            prods = res.productos;
          } else if (res && res.dato) {
            try {
              prods = typeof res.dato === 'string' ? JSON.parse(res.dato) : res.dato;
            } catch {
              prods = [];
            }
          }
          this.productos = prods;
          this.extraerCategoriasDeProductos();
          this.aplicarFiltros();
          if (!this.productoSeleccionado && this.productos.length > 0) {
            this.seleccionarProducto(this.productos[0]);
          }
        },
        error: (err) => console.error("Error al cargar productos en modal catalogo:", err)
      });
    }

    // 3. Si no hay categorías, cargarlas con CategoriaService
    if (this.categorias.length === 0 && this.categoriaService) {
      this.categoriaService.listar().subscribe({
        next: (res: any) => {
          if (Array.isArray(res)) {
            this.categorias = res;
          } else if (res && Array.isArray(res.categorias)) {
            this.categorias = res.categorias;
          } else if (res && res.dato) {
            try {
              this.categorias = typeof res.dato === 'string' ? JSON.parse(res.dato) : res.dato;
            } catch {
              // noop
            }
          }
          this.extraerCategoriasDeProductos();
        }
      });
    }

    this.dataSource = new MatTableDataSource<ProductoModel>(this.productos);

    if (data?.productoSeleccionadoId) {
      const inicial = this.productos.find(p => p.id === data.productoSeleccionadoId);
      if (inicial) {
        this.seleccionarProducto(inicial);
      }
    } else if (this.productos.length > 0) {
      this.seleccionarProducto(this.productos[0]);
    }
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  extraerCategoriasDeProductos() {
    if (!this.productos || this.productos.length === 0) return;
    const catMap = new Map<number, string>();
    for (const p of this.productos) {
      if (p.categoria_id && (p as any).categoria) {
        catMap.set(Number(p.categoria_id), String((p as any).categoria).trim());
      }
    }
    for (const [id, desc] of catMap.entries()) {
      if (!this.categorias.some(c => Number(c.id) === id)) {
        this.categorias.push({ id, descripcion: desc } as CategoriaModel);
      }
    }
  }

  getCategoriaDescripcion(rowOrId: any): string {
    if (!rowOrId) return '';

    // Si pasan el objeto de producto completo
    if (typeof rowOrId === 'object') {
      const p = rowOrId as any;
      if (p.categoria && typeof p.categoria === 'string' && p.categoria.trim() !== '') {
        return p.categoria.trim().toUpperCase();
      }
      if (p.categoria && typeof p.categoria === 'object' && p.categoria.descripcion) {
        return String(p.categoria.descripcion).trim().toUpperCase();
      }
      if (p.categoria_descripcion) {
        return String(p.categoria_descripcion).trim().toUpperCase();
      }
      if (p.categoria_id) {
        const cat = this.categorias.find(c => Number(c.id) === Number(p.categoria_id));
        if (cat?.descripcion) return cat.descripcion.trim().toUpperCase();
      }
      return '';
    }

    // Si pasan solo el ID numérico
    const id = Number(rowOrId);
    if (!id) return '';
    const cat = this.categorias.find(c => Number(c.id) === id);
    if (cat?.descripcion) return cat.descripcion.trim().toUpperCase();

    const prod = this.productos.find(p => Number(p.categoria_id) === id && (p as any).categoria);
    if (prod && (prod as any).categoria) {
      return String((prod as any).categoria).trim().toUpperCase();
    }

    return '';
  }

  onBusquedaChange(valor: string) {
    this.textoBusqueda = valor;
    this.aplicarFiltros();
  }

  onCategoriaFiltroChange(categoriaId: number | null) {
    this.categoriaFiltroId = categoriaId;
    this.aplicarFiltros();
  }

  limpiarFiltros() {
    this.textoBusqueda = '';
    this.categoriaFiltroId = null;
    this.aplicarFiltros();
  }

  aplicarFiltros() {
    let filtrados = [...this.productos];

    if (this.categoriaFiltroId !== null && this.categoriaFiltroId !== undefined) {
      filtrados = filtrados.filter(p => {
        if (Number(p.categoria_id) === Number(this.categoriaFiltroId)) return true;
        const catObj = this.categorias.find(c => Number(c.id) === Number(this.categoriaFiltroId));
        if (catObj) {
          const sel = catObj.descripcion.toLowerCase().trim();
          const pCat = (p.categoria || this.getCategoriaDescripcion(p) || '').toLowerCase().trim();
          if (pCat && (pCat === sel || pCat.startsWith(sel) || sel.startsWith(pCat))) {
            return true;
          }
        }
        return false;
      });
    }

    if (this.textoBusqueda && this.textoBusqueda.trim().length > 0) {
      const term = this.textoBusqueda.trim().toLowerCase();
      filtrados = filtrados.filter(p => {
        const desc = (p.descripcion || '').toLowerCase();
        const cat = (this.getCategoriaDescripcion(p) || '').toLowerCase();
        return desc.includes(term) || cat.includes(term);
      });
    }

    this.dataSource.data = filtrados;
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  seleccionarProducto(producto: ProductoModel) {
    if (this.productoSeleccionado?.id === producto.id) {
      return;
    }
    this.productoSeleccionado = producto;
    this.cantidad = 1; // Cantidad por defecto 1
    this.precioUnitario = Number(producto.precio) || 0;
    this.calcularSubtotal();
  }

  incrementarCantidad() {
    this.cantidad = (Number(this.cantidad) || 0) + 1;
    this.calcularSubtotal();
  }

  decrementarCantidad() {
    const actual = Number(this.cantidad) || 1;
    if (actual > 1) {
      this.cantidad = actual - 1;
      this.calcularSubtotal();
    }
  }

  deseleccionarProducto() {
    this.productoSeleccionado = null;
    this.cantidad = 1;
    this.precioUnitario = 0;
    this.subtotal = 0;
  }

  calcularSubtotal() {
    const cant = Number(this.cantidad) || 0;
    const precio = Number(this.precioUnitario) || 0;
    this.subtotal = Math.round((cant * precio) * 100) / 100;
  }

  bloquearNegativos(event: KeyboardEvent) {
    if (event.key === '-' || event.key === 'e' || event.key === 'E' || event.key === '+' || event.key === '.') {
      event.preventDefault();
    }
  }

  bloquearSignosNegativos(event: KeyboardEvent) {
    if (event.key === '-' || event.key === 'e' || event.key === 'E') {
      event.preventDefault();
    }
  }

  getItemResultado(): CatalogoItemResultado | null {
    if (!this.productoSeleccionado) return null;
    const cant = Number(this.cantidad) || 1;
    const precio = Number(this.precioUnitario) || 0;
    return {
      producto: this.productoSeleccionado,
      producto_id: this.productoSeleccionado.id,
      descripcion: this.productoSeleccionado.descripcion,
      categoria_id: this.productoSeleccionado.categoria_id,
      cantidad: cant,
      precio_unitario: precio,
      total: Math.round((cant * precio) * 100) / 100
    };
  }

  async agregarItemYSeguir() {
    const item = this.getItemResultado();
    if (!item) return;

    if (item.cantidad <= 0) return;
    if (item.precio_unitario < 0) return;

    if (this.data?.onAgregarItem) {
      this.isProcessing = true;
      try {
        await this.data.onAgregarItem(item);
        this.itemsAgregadosCount++;
        // Reset selección manteniendo listo para el siguiente
        this.productoSeleccionado = null;
        this.cantidad = 1;
        this.precioUnitario = 0;
        this.subtotal = 0;
      } finally {
        this.isProcessing = false;
      }
    } else {
      // Si no hay callback, simplemente cierra devolviendo el item
      this.confirmarSeleccion();
    }
  }

  confirmarSeleccion() {
    const item = this.getItemResultado();
    if (!item) return;

    if (item.cantidad <= 0) return;
    if (item.precio_unitario < 0) return;

    this.dialogRef.close(item);
  }

  cerrar() {
    this.dialogRef.close(null);
  }
}
