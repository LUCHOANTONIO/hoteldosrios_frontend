import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { RespuestaRequest } from '../../base/models/local/respuesta.request.model';
import {
  InvCategoriaModel,
  InvUnidadMedidaModel,
  InvProductoModel,
  InvCompraModel,
  InvConsolidadoResponse,
  InvKardexRowModel,
  InvKardexProductoResponse
} from '../models/almacen.model';

@Injectable({
  providedIn: 'root'
})
export class AlmacenService {
  private URL_API = `${environment.URL_API_BASE}/almacen`;

  constructor(private http: HttpClient) {}

  // Unidades de Medida
  listarUnidadesMedida(): Observable<InvUnidadMedidaModel[]> {
    return this.http.get<InvUnidadMedidaModel[]>(`${this.URL_API}/unidades_medida`);
  }

  crearUnidadMedida(data: { descripcion: string }): Observable<RespuestaRequest<any>> {
    return this.http.post<RespuestaRequest<any>>(`${this.URL_API}/unidades_medida`, data);
  }

  // Categorías
  listarCategorias(): Observable<InvCategoriaModel[]> {
    return this.http.get<InvCategoriaModel[]>(`${this.URL_API}/categorias`);
  }

  crearCategoria(data: Partial<InvCategoriaModel>): Observable<RespuestaRequest<any>> {
    return this.http.post<RespuestaRequest<any>>(`${this.URL_API}/categorias`, data);
  }

  actualizarCategoria(id: number, data: Partial<InvCategoriaModel>): Observable<RespuestaRequest<any>> {
    return this.http.put<RespuestaRequest<any>>(`${this.URL_API}/categorias/${id}`, data);
  }

  eliminarCategoria(id: number): Observable<RespuestaRequest<any>> {
    return this.http.delete<RespuestaRequest<any>>(`${this.URL_API}/categorias/${id}`);
  }

  // Productos
  listarProductos(): Observable<InvProductoModel[]> {
    return this.http.get<InvProductoModel[]>(`${this.URL_API}/productos`);
  }

  crearProducto(data: Partial<InvProductoModel>): Observable<RespuestaRequest<any>> {
    return this.http.post<RespuestaRequest<any>>(`${this.URL_API}/productos`, data);
  }

  actualizarProducto(id: number, data: Partial<InvProductoModel>): Observable<RespuestaRequest<any>> {
    return this.http.put<RespuestaRequest<any>>(`${this.URL_API}/productos/${id}`, data);
  }

  eliminarProducto(id: number): Observable<RespuestaRequest<any>> {
    return this.http.delete<RespuestaRequest<any>>(`${this.URL_API}/productos/${id}`);
  }

  // Compras
  listarCompras(): Observable<InvCompraModel[]> {
    return this.http.get<InvCompraModel[]>(`${this.URL_API}/compras`);
  }

  obtenerCompra(id: number): Observable<InvCompraModel> {
    return this.http.get<InvCompraModel>(`${this.URL_API}/compras/${id}`);
  }

  crearCompra(data: InvCompraModel): Observable<RespuestaRequest<any>> {
    return this.http.post<RespuestaRequest<any>>(`${this.URL_API}/compras`, data);
  }

  actualizarCompra(id: number, data: InvCompraModel): Observable<RespuestaRequest<any>> {
    return this.http.put<RespuestaRequest<any>>(`${this.URL_API}/compras/${id}`, data);
  }

  eliminarCompra(id: number): Observable<RespuestaRequest<any>> {
    return this.http.delete<RespuestaRequest<any>>(`${this.URL_API}/compras/${id}`);
  }

  // Inventario y Kardex UEPS
  listarInventario(categoriaId?: number | null, soloAlertas: boolean = false): Observable<InvConsolidadoResponse> {
    let params = new HttpParams();
    if (categoriaId) {
      params = params.set('categoria_id', String(categoriaId));
    }
    if (soloAlertas) {
      params = params.set('solo_alertas', 'true');
    }
    return this.http.get<InvConsolidadoResponse>(`${this.URL_API}/inventario`, { params });
  }

  listarKardex(): Observable<InvKardexRowModel[]> {
    return this.http.get<InvKardexRowModel[]>(`${this.URL_API}/kardex`);
  }

  obtenerKardexProducto(productoId: number): Observable<InvKardexProductoResponse> {
    return this.http.get<InvKardexProductoResponse>(`${this.URL_API}/kardex/${productoId}`);
  }

  registrarMovimientoUeps(payload: {
    producto_id: number;
    tipo_movimiento: 'SALIDA_CONSUMO' | 'SALIDA_AJUSTE' | 'ENTRADA_AJUSTE';
    cantidad: number;
    costo_unitario?: number;
    referencia_doc?: string;
    observacion?: string;
  }): Observable<RespuestaRequest<any>> {
    return this.http.post<RespuestaRequest<any>>(`${this.URL_API}/movimientos`, payload);
  }
}
