// import { Injectable } from '@angular/core';
// import { MenuModel } from '../models/menu.model';

// @Injectable({
//   providedIn: 'root'
// })
// export  class  Utils {
//     static convertArrayMenuToTree(menus: MenuModel[]): MenuModel {
//         // Inicializar cada menú con un array vacío de subMenus
//         menus.forEach(menu => menu.subMenus = []);
//         const tree: MenuModel[] = [];
//         // Construir la estructura de árbol
//         menus.forEach(menu => {
//           if (menu.padre_id === null) {
//             // Menú de nivel superior
//             tree.push(menu);
//           } else {
//             // Encontrar el menú padre y añadir el menú actual a sus subMenus
//             const parent = menus.find(m => m.id === menu.padre_id);
//             if (parent) {
//               parent.subMenus.push(menu);
//             }
//           }
//         });
    
//         let raiz = new MenuModel();
//         raiz.id = null;
//         raiz.nombre = "RAIZ";
//         raiz.subMenus = tree;
//         return raiz;
//       }
// }


