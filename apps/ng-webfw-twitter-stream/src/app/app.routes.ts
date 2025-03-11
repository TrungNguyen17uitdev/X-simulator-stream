import { Routes } from '@angular/router';
import { CreateModule } from '@app/client/user';

export const appRoutes: Routes = [
  {
    path: '',
    redirectTo: 'web-fw',
    pathMatch: 'full',
  },
  {
    path: 'web-fw',
    loadChildren: () =>
      import('@app/client/core/web-frameworks').then(m => m.ClientCoreWebFrameworksModule),
  },
  {
    path: 'create',
    loadChildren: () => CreateModule,
  },
];
