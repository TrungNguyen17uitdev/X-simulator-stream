import { Component } from '@angular/core';
import { CreateService } from '@app/client/user';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  constructor(private createService: CreateService) {}
}
