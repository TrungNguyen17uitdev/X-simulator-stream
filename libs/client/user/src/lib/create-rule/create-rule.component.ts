import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UploadImageService } from '@app/client/services';
import { ToastrService } from 'ngx-toastr';
import { CreateService } from '../create.service';

@Component({
  selector: 'app-create-rule',
  templateUrl: './create-rule.component.html',
  styleUrls: ['./create-rule.component.scss'],
})
export class CreateRuleComponent implements OnInit {
  createRuleFrom: FormGroup;
  fileToUpload: File;

  constructor(
    private fromBuilder: FormBuilder,
    private createService: CreateService,
    private uploadImageService: UploadImageService,
    private toastrService: ToastrService,
  ) {}

  get rules() {
    return this.createRuleFrom.get('rules') as FormArray;
  }

  ngOnInit() {
    this.createRuleFrom = this.fromBuilder.group({
      rules: this.fromBuilder.array([this.addTagForm()]),
    });
  }

  addTagForm() {
    return this.fromBuilder.group({
      tag: this.fromBuilder.control('', [Validators.required, Validators.min(1)]),
      thumb: this.fromBuilder.control('assets/location-default-thumb.png'),
    });
  }

  addTag() {
    const userFormArray = this.createRuleFrom.controls['rules'] as FormArray;
    userFormArray.push(this.addTagForm());
  }

  remove(index: number) {
    this.rules.removeAt(index);
  }

  handleChangeFile(fileTarget: HTMLInputElement, index: number) {
    this.fileToUpload = fileTarget.files[0];
    const fileReader = new FileReader();
    const control = this.createRuleFrom.get(['rules', index, 'thumb']);
    fileReader.onload = (e: any) => {
      control.setValue(e.target.result);
    };
    fileReader.readAsDataURL(this.fileToUpload);

    this.uploadImageService.upload(this.fileToUpload).subscribe(url => {
      control.setValue(url);
    });
  }

  submit() {
    this.createService.createRules(this.rules.value).subscribe(res => {
      if (res) {
        this.toastrService.success(`${this.rules.value.length} tweets added`);
        this.rules.clear();
        this.addTag();
      } else {
        this.toastrService.error('Something went wrong!');
      }
    });
  }
}
