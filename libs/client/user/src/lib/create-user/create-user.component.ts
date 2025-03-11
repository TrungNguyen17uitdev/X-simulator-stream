import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { randomAvatar } from '@app/client/common';
import { UploadImageService } from '@app/client/services';
import { ToastrService } from 'ngx-toastr';
import { iif, of } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators';
import { CreateService } from '../create.service';

@Component({
  selector: 'app-create-user',
  templateUrl: './create-user.component.html',
  styleUrls: ['./create-user.component.scss'],
})
export class CreateUserComponent implements OnInit {
  createUserFrom: FormGroup;
  fileToUpload: File;
  autoAdd = false;
  randomUserSelectOption: number;
  randomUserOptions = [5, 10, 20];

  constructor(
    private fromBuilder: FormBuilder,
    private createService: CreateService,
    private uploadImageService: UploadImageService,
    private toastrService: ToastrService,
  ) {}

  get users() {
    return this.createUserFrom.get('users') as FormArray;
  }

  ngOnInit() {
    this.createUserFrom = this.fromBuilder.group({
      users: this.fromBuilder.array([this.addUserForm()]),
    });
  }

  addUserForm() {
    return this.fromBuilder.group({
      name: this.fromBuilder.control('', [Validators.required, Validators.min(1)]),
      profile_image_url: this.fromBuilder.control(randomAvatar()),
    });
  }

  addUser() {
    const userFormArray = this.createUserFrom.controls['users'] as FormArray;
    userFormArray.push(this.addUserForm());
  }

  remove(index: number) {
    this.users.removeAt(index);
  }

  handleChangeFile(fileTarget: HTMLInputElement, index: number) {
    this.fileToUpload = fileTarget.files[0];
    const control = this.createUserFrom.get(['users', index, 'profile_image_url']);
    const fileReader = new FileReader();
    fileReader.onload = (e: any) => {
      control.setValue(e.target.result);
    };
    fileReader.readAsDataURL(this.fileToUpload);

    this.uploadImageService.upload(this.fileToUpload).subscribe(url => {
      control.setValue(url);
    });
  }

  changeAutoAdd(event: MatSlideToggleChange) {
    this.autoAdd = event.checked;
    if (event.checked) {
      this.createUserFrom.disable();
    } else {
      this.createUserFrom.enable();
    }
  }

  submit() {
    let users = this.users.value;
    const quantity = this.autoAdd ? this.randomUserSelectOption : users.length;

    iif(
      () => this.autoAdd,
      this.createService.randomUser(this.randomUserSelectOption).pipe(
        map(res =>
          res.results.map(user => ({
            name: user.name.title,
            profile_image_url: randomAvatar(),
          })),
        ),
      ),
      of(users),
    )
      .pipe(
        switchMap(users => this.createService.createUsers(users)),
        take(1),
      )
      .subscribe(res => {
        if (res) {
          this.toastrService.success(`${quantity} users added`);
          this.users.clear();
          this.addUser();
        } else {
          this.toastrService.error('Something went wrong!');
        }
      });
  }
}
