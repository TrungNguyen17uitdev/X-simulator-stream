import {
  Component,
  DoCheck,
  ElementRef,
  HostBinding,
  Input,
  OnDestroy,
  OnInit,
  Optional,
  Self,
  ViewChild,
} from '@angular/core';
import {
  ControlValueAccessor,
  FormBuilder,
  FormControl,
  FormGroup,
  FormGroupDirective,
  NgControl,
  NgForm,
  Validators,
} from '@angular/forms';
import {
  CanDisableCtor,
  CanUpdateErrorStateCtor,
  ErrorStateMatcher,
  mixinDisabled,
  mixinErrorState,
} from '@angular/material/core';
import { MatFormFieldControl } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { CountryPlace, getLatLngFromUrl, Place, randomInt } from '@app/client/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CreateService } from '../../create.service';

export class CustomErrorMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl): boolean {
    return control?.dirty && control?.invalid;
  }
}

class SearchInputBase {
  constructor(
    public _parentFormGroup: FormGroupDirective,
    public _parentForm: NgForm,
    public _defaultErrorStateMatcher: ErrorStateMatcher,
    public ngControl: NgControl,
  ) {}
}

const _SearchInputMixinBase: CanUpdateErrorStateCtor & CanDisableCtor = mixinDisabled(
  mixinErrorState(SearchInputBase),
);

@Component({
  selector: 'app-random-location',
  templateUrl: './random-location.component.html',
  styleUrls: ['./random-location.component.scss'],
  providers: [
    {
      provide: MatFormFieldControl,
      useExisting: RandomLocationComponent,
    },
    {
      provide: ErrorStateMatcher,
      useClass: CustomErrorMatcher,
    },
  ],
})
export class RandomLocationComponent
  extends _SearchInputMixinBase
  implements OnInit, OnDestroy, MatFormFieldControl<Place>, ControlValueAccessor, DoCheck {
  static nextId = 0;
  @ViewChild(MatInput, { read: ElementRef, static: true })
  input: ElementRef;

  @Input()
  set value(value: Place) {
    if (value) {
      this._value = value;
    } else {
      this._value = null;
    }
    this.stateChanges.next();
  }
  get value() {
    return this._value;
  }
  private _value: Place;

  @HostBinding()
  id = `random-location-form-field-id-${RandomLocationComponent.nextId++}`;

  @Input()
  set placeholder(value: string) {
    this._placeholder = value;
    this.stateChanges.next();
  }
  get placeholder() {
    return this._placeholder;
  }
  private _placeholder: string;

  focused: boolean;

  get empty(): boolean {
    return !this.value;
  }

  @HostBinding('class.floated')
  get shouldLabelFloat(): boolean {
    return false;
  }

  @Input()
  required: boolean;

  @Input()
  set disabled(value: boolean) {
    this._disabled = value;

    if (value) {
      this.form.controls['country'].disable();
    } else {
      this.form.controls['country'].enable();
    }
  }
  get disabled() {
    return this._disabled;
  }
  _disabled: boolean;

  controlType = 'custom-form-field';

  @HostBinding('attr.aria-describedby') describedBy = '';

  onChange: (value: Place) => {};
  onTouch: () => void;

  form: FormGroup;
  countries$: Observable<CountryPlace[]>;
  countries: CountryPlace[];

  constructor(
    @Optional() @Self() public ngControl: NgControl,
    private fb: FormBuilder,
    public _defaultErrorStateMatcher: ErrorStateMatcher,
    @Optional() _parentForm: NgForm,
    @Optional() _parentFormGroup: FormGroupDirective,
    private createService: CreateService,
  ) {
    super(_defaultErrorStateMatcher, _parentForm, _parentFormGroup, ngControl);
    if (this.ngControl != null) {
      this.ngControl.valueAccessor = this;
    }
    this.form = this.fb.group({
      country: this.fb.control(null, Validators.required),
      searchCountry: this.fb.control(''),
    });
  }

  writeValue(obj: Place) {
    this.value = obj;
  }
  registerOnChange(fn: any) {
    this.onChange = fn;
  }
  registerOnTouched(fn: any) {
    this.onTouch = fn;
  }
  setDisabledState(isDisabled: boolean) {
    this.disabled = isDisabled;
    this.stateChanges.next();
  }

  setDescribedByIds(ids: string[]) {
    this.describedBy = ids.join(' ');
  }

  onContainerClick() {}

  ngOnInit() {
    this.createService.getCountries().subscribe(countries => (this.countries = countries));

    this.countries$ = this.form.controls['searchCountry'].valueChanges.pipe(
      map((keyword: string) => this.filterCountries(keyword, this.countries)),
    );
  }

  ngDoCheck() {
    if (this.ngControl) {
      this.updateErrorState();
    }
  }

  ngOnDestroy() {
    this.stateChanges.complete();
  }

  touchSelect(inputSearchUser: HTMLInputElement) {
    this.form.get('searchCountry').setValue('');
    setTimeout(() => inputSearchUser.focus());
  }

  generate() {
    const countryCode = this.form.controls['country'].value;
    this.createService.randomPlace(countryCode).subscribe(places => {
      const place = places[randomInt(0, places.length - 1)];
      this.value = {
        full_name: place.name,
        bbox: getLatLngFromUrl(place.googleMapsLink),
      };
      this.onChange(this.value);
      this.stateChanges.next();
    });
  }

  private filterCountries(keyword: string, countries: CountryPlace[]): CountryPlace[] {
    return countries.filter(c => c.name.common.toLowerCase().includes(keyword.toLowerCase()));
  }
}
