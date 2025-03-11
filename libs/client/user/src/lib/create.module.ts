import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { Route, RouterModule } from '@angular/router';
import { CreateRuleComponent } from './create-rule/create-rule.component';
import { CreateTweetComponent } from './create-tweet/create-tweet.component';
import { RandomLocationComponent } from './create-tweet/random-location/random-location.component';
import { CreateUserComponent } from './create-user/create-user.component';
import { CreateService } from './create.service';
import { CountryPipe } from './pipe/country.pipe';

const routes: Route[] = [
  {
    path: 'user',
    component: CreateUserComponent,
  },
  {
    path: 'rule',
    component: CreateRuleComponent,
  },
  {
    path: 'tweet',
    component: CreateTweetComponent,
  },
  {
    path: '',
    redirectTo: 'tweet',
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    ReactiveFormsModule,
    FormsModule,
    MatFormFieldModule,
    MatBadgeModule,
    MatInputModule,
    MatButtonToggleModule,
    MatButtonModule,
    MatChipsModule,
    MatListModule,
    MatIconModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatAutocompleteModule,
  ],
  declarations: [
    CreateUserComponent,
    CreateRuleComponent,
    CreateTweetComponent,
    RandomLocationComponent,
    CountryPipe,
  ],
  providers: [CreateService],
})
export class CreateModule {}
