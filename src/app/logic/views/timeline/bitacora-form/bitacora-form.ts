
//ANGULAR MATERIAL
import { MatExpansionModule } from '@angular/material/expansion';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';

//MODELS
import { ReservaModel } from '../../../models/reserva.model';
import { BitacoraModel } from '../../../models/bitacora.model';

//ANGULAR
import { Component, effect, Input, OnInit } from '@angular/core';
import { FormsModule} from '@angular/forms';
import { MatInputModule } from '@angular/material/input';

//SERVICES
import { BitacoraService } from '../../../services/bitacora.service';
import { ComunicacionService } from '../../../services/local/comunicacion.service';

@Component({
  selector: 'app-bitacora-form',
  standalone: true,
  imports: [MatExpansionModule,MatListModule,MatIconModule,MatFormFieldModule,FormsModule,MatInputModule,MatDialogModule,MatCardModule],
  templateUrl: './bitacora-form.html',
  styleUrl: './bitacora-form.scss'
})
export class BitacoraFormComponent implements OnInit  {
    @Input() reserva!: ReservaModel;
    bitacora:BitacoraModel=new BitacoraModel();  
    bitacoras:BitacoraModel[]=[];  

    constructor(private bitacoraService:BitacoraService,private comunicacionService:ComunicacionService) {
        effect(() => {           
            const { reserva_id } = this.comunicacionService.loadBitacoraSignal();             
            if (reserva_id !== null) {            
              this.cargarBitacoras(reserva_id);              
            }
        });
    }

    ngOnInit() {
      setTimeout(() => {
          if (this.reserva) {           
            this.cargarBitacoras(this.reserva.id);
          }
      });
    }    
  
    cargarBitacoras(id:number){
      this.bitacoraService.listar(id).subscribe({
        next:(res)=>{
           this.bitacoras=res;                
        },
        error:(error)=>{
           //Sin acciones
        }
      })
    }     

}
