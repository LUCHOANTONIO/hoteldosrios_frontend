//ANGULAR MATERIAL
import { MatExpansionModule } from '@angular/material/expansion';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';

//MODELS
import { ReservaModel } from '../../../models/reserva.model';
import { NotaModel } from '../../../models/nota.model';

//ANGULAR
import { Component, Input, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { AlertService } from '../../../../base/services/local/alert.service';

//SERVICES
import { NotaService } from '../../../services/nota.service';
import { ComunicacionService } from '../../../services/local/comunicacion.service';

@Component({
  selector: 'app-nota-form',
  standalone: true,
  imports: [MatExpansionModule,MatListModule,MatIconModule,MatFormFieldModule,FormsModule,MatInputModule,MatDialogModule,MatCardModule],
  templateUrl: './nota-form.html',
  styleUrl: './nota-form.scss'
})
export class NotaFormComponent implements OnInit  {
    @Input() reserva!: ReservaModel;
    @Input() items!:any;
    nota:NotaModel=new NotaModel();  
    notas:NotaModel[]=[];  

    constructor(private notaService:NotaService,private alertService:AlertService,private comunicacionService: ComunicacionService) {
          
    } 

    ngOnInit() {
      setTimeout(() => {
          if (this.reserva) {           
            this.cargarNotas(this.reserva.id);
          }
      });
    }

    submitNota(f: NgForm) {               
        if (f.valid) {                       
            this.procesarNota(); 
        } else {
            this.alertService.show("Debe llenar los campos", { duration: 3000, type: 'info' });
        }
    }
  
    cargarNotas(id:number){
      this.notaService.listar(id).subscribe({
        next:(res)=>{
           this.notas=res;                
        },
        error:(error)=>{
           //Sin acciones
        }
      })
    }
  
    procesarNota(){   
      this.nota.reserva_id=this.reserva.id;     
      this.notaService.crear(this.nota).subscribe({
        next:(res)=>{
          if(res.correcto){
            const data = JSON.parse(res.dato);                        
            this.notas = data.notas as NotaModel[];
            this.reserva = data.reserva as ReservaModel;
            this.nota.descripcion="";
            this.items.update({id:this.reserva.id,cliente:this.reserva.cliente,start:this.reserva.fecha_ini,end:this.reserva.fecha_fin,group:this.reserva.habitacion_id,className:this.reserva.color,saldo:this.reserva.saldo,tiene_mensaje:this.reserva.tiene_mensaje});
            this.comunicacionService.executeActionReserva.set(true);
          } else {
            this.alertService.show(res.mensaje, { duration: 5000, type: 'info' });
          }                                           
        },
        error:(error)=>{
           //acciones
        }
      })
    }

}
