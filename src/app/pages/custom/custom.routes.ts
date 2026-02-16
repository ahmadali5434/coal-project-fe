import { Routes } from "@angular/router";

export const CUSTOMROUTES: Routes = [
    {
        path: '',
        loadComponent: () =>
            import('./custom.component').then((m) => m.CustomComponent),
    },
];