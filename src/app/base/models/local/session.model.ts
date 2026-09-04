export class SessionModel{
    USUARIO_ID:number=0;
    USUARIO_NOMBRE:string="";
    USUARIO_PRIMER_APELLIDO:string="";
    USUARIO_SEGUNDO_APELLIDO:string="";
    REGIONAL_ID:number=0;
    REGIONAL_NOMBRE:string="";
    AGENCIA_ID:number=0;
    AGENCIA_NOMBRE:string="";
    ROL_NOMBRE:string="";
    ROL_ID:number=0;
    SESSION_LIFETIME:number=0;
    //CONFIGURACION
    Configuraciones:{MOSTRAR_MENU_VERTICAL:boolean,
                     MOSTRAR_MENU_HORIZONTAL:boolean
                    }={MOSTRAR_MENU_VERTICAL:false,
                        MOSTRAR_MENU_HORIZONTAL:false
                    };
    // PARAMETROS OPCIONALES
    PARAMETRO_1:number=0;
    PARAMETRO_2:number=0;
}
