import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { ChangeDetectionStrategy, Component, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  MatAutocompleteSelectedEvent,
  MatAutocompleteTrigger,
} from '@angular/material/autocomplete';
import { MatChipInputEvent } from '@angular/material/chips';
import { Rule } from '@app/client/common';
import { DynamicDialogConfig, DynamicDialogRef } from '@app/client/core/dynamic-dialog';
import { TweetRule } from '@app/client/models';
import { BehaviorSubject, Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { WebFrameworksService } from '../../web-frameworks.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsComponent implements OnInit {
  form: FormGroup;
  tags$: Observable<Rule[]>;
  searchTags$ = new BehaviorSubject('');

  selectable = true;
  removable = true;
  addOnBlur = true;
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];

  @ViewChild('searchInput', { read: MatAutocompleteTrigger })
  searchInputTrigger: MatAutocompleteTrigger;

  constructor(
    private readonly dynamicDialogRef: DynamicDialogRef<{ _id: string; tag: string }[]>,
    private readonly dynamicDialogConfig: DynamicDialogConfig<TweetRule[]>,
    private readonly fb: FormBuilder,
    private readonly webFrameworksService: WebFrameworksService,
  ) {}

  ngOnInit(): void {
    this.initForm();

    this.tags$ = this.searchTags$.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      switchMap((keyword: string) => this.webFrameworksService.searchTags(keyword)),
    );
  }

  get isConfirmedDisabled(): boolean {
    return this.rulesControl.length === this.dynamicDialogConfig.data.length;
  }

  get rulesControl(): FormArray {
    return this.form.get('rules') as FormArray;
  }

  remove(index: number) {
    this.rulesControl.removeAt(index);
  }

  add(event: MatChipInputEvent) {
    const value = event.value;

    if ((value || '').trim()) {
      this.rulesControl.push(this.fb.control(value));
    }
  }

  touchSearchTag() {
    this.searchTags$.next(this.searchTags$.value);
    this.searchInputTrigger.openPanel();
  }

  selectedTag(event: MatAutocompleteSelectedEvent) {
    if (!this.rulesControl.value.find(rule => rule.id === event.option.value._id)) {
      const tag = this.fb.control({
        id: event.option.value._id,
        tag: event.option.value.tag,
        thumb: event.option.value.thumb,
      });
      this.rulesControl.push(tag);
      this.form.get('tagSearch').setValue(null);
    }
  }

  addNewRuleControl() {
    this.rulesControl.push(this.createRuleGroup());
  }

  private initForm() {
    const rules = this.dynamicDialogConfig.data;
    this.form = this.fb.group({
      tagSearch: null,
      rules: this.fb.array(this.constructRulesFormArray(rules)),
    });
  }

  private constructRulesFormArray(rules: TweetRule[]) {
    return !rules.length ? [] : rules.map(rule => this.fb.control(rule));
  }

  private createRuleGroup(rule?: TweetRule) {
    if (rule == null) {
      return this.fb.group({
        tag: [null, Validators.required],
        label: [],
        color: [],
        marker: [],
        query: ['', Validators.required],
      });
    }

    return this.fb.group({
      tag: [{ value: rule, disabled: true }, Validators.required],
      label: [{ value: rule.label, disabled: true }],
      color: [{ value: rule.color, disabled: true }],
      marker: [{ value: rule.marker, disabled: true }],
      query: [{ value: rule.value, disabled: true }, Validators.required],
    });
  }

  confirm() {
    const rules = this.form.value.rules;
    this.dynamicDialogRef.close(rules);
  }

  cancel() {
    this.dynamicDialogRef.close();
  }

  removeRule(ruleControl: AbstractControl, index: number) {
    if (!ruleControl.get('tag').disabled) {
      this.rulesControl.removeAt(index);
    } else {
      const tagValue = ruleControl.get('tag').value;
      const ruleId = this.dynamicDialogConfig.data.find(rule => rule.tag === tagValue).id;
      this.webFrameworksService.deleteRules([ruleId]);
      this.dynamicDialogRef.close();
    }
  }
}
