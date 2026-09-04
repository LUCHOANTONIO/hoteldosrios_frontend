export interface AlertOptions {
    messagesClass?:string;
    title?:string;
    titleClass?:string;
    headerClass?:string;
    OKText?:string;
    cancelText?:string;
    cancelShow?:boolean;
    width?: string,
    maxWidth?: string,
    disableClose?:boolean,
    enterAnimationDuration?:number;
    exitAnimationDuration?:number;
    duration?:number;
    icon?: "check_circle"|"info"|"warning"| "error" | "help" |string;//icon material
    type?:  "success" | "info"| "warning" | "error"; 
}