import { Component, input,output, model, viewChild, ViewChildren, ElementRef, ContentChild, 
  TemplateRef, computed, signal, QueryList, AfterViewInit, inject, NgZone, 
  effect,  untracked, booleanAttribute} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';
import { MatSelectModule,MatSelect } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { ActiveDescendantKeyManager } from '@angular/cdk/a11y'; // Importante: instalar @angular/cdk si no lo tienes
import { MatOption } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { ShowErrorDirective } from '../../directives/show-error.directive';

@Component({
  selector: 'app-select-search',
  standalone: true,
  imports: [CommonModule, MatSelectModule, MatFormFieldModule, MatInputModule,
            MatButtonModule, MatIconModule, FormsModule, ShowErrorDirective],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      // Usar forwardRef sigue siendo necesario aquí porque la clase 
      // se referencia a sí misma antes de ser totalmente definida
      useExisting: SelectSearchComponent, 
      multi: true
    }
  ],
  
  templateUrl: './select-search.html',
  styleUrl: './select-search.scss'
})

/*GUIA DE USO
 Propiedad    ,Tipo     ,Descripción
 label        ,string   ,El título que aparece arriba del selector.
 placeholder  ,string   ,Texto de ayuda dentro del buscador.
 dataSource   ,any[]    ,La lista de objetos que quieres mostrar.
 text         ,string   ,"El nombre del campo que quieres mostrar (ej: ""nombre"").", si necesitas mostrar mas de un campo puedes usar ng-template
 value        ,string   ,"El nombre del campo que es el ID (ej: ""id"")."
 required     ,boolean  , "Indica si el campo es requerido para validacion"
 showCleanButton     ,boolean  , "muestra un boton con una X para limpiar la seleccion (poner a el valor a undefined)"
 searchFields ,string[] ,(Opcional) Otros campos por los que quieres que busque.
  ------
  ver uso al final de esta pagina
*/
export class SelectSearchComponent implements ControlValueAccessor, AfterViewInit{
  private readonly zone = inject(NgZone);

  // Inputs y Modelos
  label = input<string>('Seleccionar...');
  placeholder = input<string>('Buscar...');
  dataSource = input<any[]>([]);
  text = input<string>('text');
  value = input<string>('value');
  // El transform: booleanAttribute permite que al recibir un parametro required sin asignacion lo convierta en true y si no existe el paramtro es false.
  // esto con el objetivo de usar el required como se hace normalmente.
  required = input(false, { transform: booleanAttribute });
  disabled = model<boolean>(false);
  showCleanButton = input(false, { transform: booleanAttribute });
  searchFields = input<string[]>([]);
  // Definimos el evento de salida
  selectionChange = output<{value:any,object:any}>();
  keyupEnter = output<void>();
  selectedValue = model<any>();

  // Señales de estado
  filterText = signal('');
  itemsAMostrar = signal(20);

  // Referencia al mat-select del html para poder abrirlo o enfocarlo
  miSelect = viewChild<MatSelect>('miSelect');
  // Referencias de vista
  @ContentChild(TemplateRef) externalTemplate?: TemplateRef<any>;
  @ViewChildren(MatOption) options!: QueryList<MatOption>;
  txtFiltro = viewChild<ElementRef<HTMLInputElement>>('txtFiltro');
  
  private keyManager!: ActiveDescendantKeyManager<MatOption>;

  constructor() {
    // Cada vez que el filtro cambie, reiniciamos el límite de carga
    effect(() => {
      // Escuchamos los cambios en el filtro
      this.filterText();

      untracked(() => {
        this.itemsAMostrar.set(20);
        // Tras actualizar la lista filtrada, colocamos el foco en el primer ítem disponible
        setTimeout(() => {
          if (this.keyManager) {
            this.keyManager.setFirstItemActive();
          }
        });
      });
    });
  }

  // Lógica de filtrado con Carga Híbrida (Items filtrados + Item seleccionado)
  filteredItems = computed(() => {
    const search = this.filterText().toLowerCase().trim();
    const allItems = this.dataSource() || [];
    const selected = this.selectedValue();
    const valField = this.value();

    // 1. Filtrar
    const filtrados = allItems.filter(item => {
      if (!search) return true;
      const campos = [this.text(), ...this.searchFields()];
      return campos.some(c => String(item[c] || '').toLowerCase().includes(search));
    });

    // 2. Recortar a la cantidad actual de "Infinite Scroll"
    let resultado = filtrados.slice(0, this.itemsAMostrar());

    // 3. Inyectar el seleccionado si no está en la porción visible (para que Material lo reconozca)
    if (selected && !search) {
      const estaEnLista = resultado.some(item => item[valField] === selected);
      if (!estaEnLista) {
        const itemSeleccionado = allItems.find(item => item[valField] === selected);
        if (itemSeleccionado) resultado = [itemSeleccionado, ...resultado];
      }
    }

    return resultado;
  });

  ngAfterViewInit() {
    this.keyManager = new ActiveDescendantKeyManager(this.options).withWrap();
  }

  handleKeydown(event: KeyboardEvent, select: MatSelect) {
    // Si presiona Enter y hay un ítem activo en el KeyManager
    if (event.key === 'Enter') {
      // Evita que mat-select vuelva a procesar el Enter internamente
      event.preventDefault();
      event.stopPropagation();

      if (this.keyManager.activeItem) {
        this.onSelect(this.keyManager.activeItem.value);
        select.close();
        
        // Pequeño delay para que el cierre del panel no interfiera con el siguiente foco
        setTimeout(() => {
          this.keyupEnter.emit();
        }, 50);
      } else {
        // Si no hay nada seleccionado pero presiona Enter, también emitimos
        this.keyupEnter.emit();
      }
      return;
    }

    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      event.preventDefault();
      this.keyManager.onKeydown(event);
      this.scrollActiveItemIntoView();

      // Carga incremental al llegar al final con el teclado
      if (event.key === 'ArrowDown' && this.keyManager.activeItemIndex >= this.options.length - 1) {
        this.itemsAMostrar.update(n => n + 20);
      }
    }
  }

  private scrollActiveItemIntoView() {
    const activeItem = this.keyManager.activeItem;
    if (activeItem) {
      (activeItem as any)._element.nativeElement.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    }
  }

  onScroll(event: any) {
    const target = event.target;
    if (target.scrollTop + target.clientHeight >= target.scrollHeight - 5) {
      this.zone.run(() => this.itemsAMostrar.update(n => n + 20));
    }
  }

  enfocar() {
    this.zone.runOutsideAngular(() => {
      setTimeout(() => {
        this.txtFiltro()?.nativeElement.focus();
        const panel = document.querySelector('.mat-mdc-select-panel');
        if (panel) panel.addEventListener('scroll', (e) => this.onScroll(e));

        this.zone.run(() => {
          const current = this.selectedValue();
          if (current) {
            const index = this.options.toArray().findIndex(opt => opt.value === current);
            if (index !== -1) {
              this.keyManager.setActiveItem(index);
              this.scrollActiveItemIntoView();
            }
          } else {
            this.keyManager.setFirstItemActive();
          }
        });
      }, 150);
    });
  }

  limpiarFiltro() {
    this.filterText.set('');
  }

  // ControlValueAccessor
  onChange = (_: any) => {};
  onTouched = () => {};
  writeValue(val: any) { this.selectedValue.set(val); }
  registerOnChange(fn: any) { this.onChange = fn; }
  registerOnTouched(fn: any) { this.onTouched = fn; }

  onSelect(val: any) {
    this.selectedValue.set(val);
    this.onChange(val);
    
    // Buscando el objeto original dentro del dataSource
    const fullObject = this.dataSource().find(item => item[this.value()] === val);
    // Emitiendo el objeto encontrado (o undefined si se limpió)
    // Emitiendo el evento hacia afuera para el componente padre
    this.selectionChange.emit({value:val,object:fullObject});
  }

  reset(event?: Event) {
    // Importante: stopPropagation evita que al hacer clic en el botón de borrar
    // se abra o cierre el panel del select accidentalmente.
    if (event) {
      event.stopPropagation();
    }

    this.selectedValue.set(undefined);
    this.onChange(undefined);
    this.selectionChange.emit(undefined);
    
    // Opcional: limpiar también el filtro si lo deseas
    this.filterText.set('');
  }

  // MÉTODO PÚBLICO: Permite que otros componentes hagan selectSearch.focus()
  focus() {
    // Abrimos el select y, por la lógica que ya tienes en enfocar(), 
    // el input de búsqueda recibirá el foco automáticamente.
    this.miSelect()?.open();
  }

  // ESTE MÉTODO ES EL KEY: Angular lo llamará automáticamente, cuando se aplique disabled sobre los controles del formulario.
  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }
}

/*
USO
PARA CONFIGURAR EL 
app-select-search y no tener problemas de columnas de Bootstrap se debe cambiar el código: en el formulario dialog: 
<mat-dialog-content class="mat-typography row row-cols-1 row-cols-md-2 px-0 pt-2">

por 
<mat-dialog-content class="mat-typography px-3 pt-2">
        <div class="row row-cols-1 row-cols-md-2">

invocacion:
  MOSTRAR UN SOLO CAMPO::::
     <app-select-search class="col"
        label="Regional"      
        [(ngModel)]="usuario.regional_id" 
        [dataSource]="regionales" 
        (selectionChange)="cargarComboAgenciaPorIdRegional($event?.value)"
        text="nombre"
        value="id"
        name="regional_id"
        showCleanButton="true"
        required
        [searchFields]="['nombre']">
    </app-select-search>

  MOSTRAR DOS O MAS CAMPOS y con estilos:::

    <app-select-search class="col"
      label="Regional"      
      [(ngModel)]="usuario.regional_id" 
      [dataSource]="regionales" 
      (selectionChange)="cargarComboAgenciaPorIdRegional($event?.value)"
      text=""
      value="id"
      name="regional_id"
      showCleanButton="true"
      required
      [searchFields]="['id', 'nombre']">
      <ng-template let-regional>
          <span class="text-primary">{{ regional.id }}</span> - 
          {{ regional.nombre }} 
          <small class="text-secondary">({{ regional.observacion }})</small>
      </ng-template>
    </app-select-search>
    
 */