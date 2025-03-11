import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  MatAutocomplete,
  MatAutocompleteSelectedEvent,
  MatAutocompleteTrigger,
} from '@angular/material/autocomplete';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { getLatLngFromUrl, Place, randomInt, Rule, Tweet, User } from '@app/client/common';
import { SocketService } from '@app/client/services';
import { ToastrService } from 'ngx-toastr';
import { BehaviorSubject, forkJoin, iif, Observable, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, switchMap, take } from 'rxjs/operators';
import { CreateService } from '../create.service';

@Component({
  selector: 'app-create-tweet',
  templateUrl: './create-tweet.component.html',
  styleUrls: ['./create-tweet.component.scss'],
})
export class CreateTweetComponent implements OnInit {
  createTweetFrom: FormGroup;
  tags$: Observable<Rule[]>;
  users$: Observable<User[]>;
  searchTags$ = new BehaviorSubject('');
  autoAdd = false;
  randomTweetSelectOption: number;
  randomTweetOptions = [5, 10, 15];

  @ViewChild('searchInput') searchInput: ElementRef<HTMLInputElement>;
  @ViewChild('searchInput', { read: MatAutocompleteTrigger })
  searchInputTrigger: MatAutocompleteTrigger;
  @ViewChild('auto') matAutocomplete: MatAutocomplete;

  constructor(
    private fromBuilder: FormBuilder,
    private createService: CreateService,
    private toastrService: ToastrService,
    private readonly socketService: SocketService,
  ) {}

  ngOnInit() {
    this.createTweetFrom = this.fromBuilder.group({
      caption: this.fromBuilder.control('', [Validators.required, Validators.minLength(1)]),
      matching_rules: this.fromBuilder.array([]),
      tagSearch: this.fromBuilder.control(''),
      user: this.fromBuilder.control(null, Validators.required),
      userSearch: this.fromBuilder.control(null),
      place: this.fromBuilder.control(null, Validators.required),
    });

    this.tags$ = this.searchTags$.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      switchMap((keyword: string) => this.createService.getRules(keyword)),
    );

    this.users$ = this.createTweetFrom.get('userSearch').valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      switchMap((keyword: string) => this.createService.getUsers(keyword)),
    );
  }

  selectable = true;
  removable = true;
  addOnBlur = true;
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];

  get tags() {
    return this.createTweetFrom.controls['matching_rules'] as FormArray;
  }

  get selectUser() {
    return this.createTweetFrom.get('user').value;
  }

  changeAutoAdd(event: MatSlideToggleChange) {
    this.autoAdd = event.checked;
    if (event.checked) {
      this.createTweetFrom.disable();
    } else {
      this.createTweetFrom.enable();
    }
  }

  add(event: MatChipInputEvent) {
    const value = event.value;

    if ((value || '').trim()) {
      this.tags.push(this.fromBuilder.control(value));
    }
  }

  remove(index: number) {
    this.tags.removeAt(index);
  }

  selectedTag(event: MatAutocompleteSelectedEvent) {
    const tag = this.fromBuilder.control(event.option.value);
    this.tags.push(tag);
    this.createTweetFrom.get('tagSearch').setValue(null);
  }

  touchSearchUser(inputSearchUser: HTMLInputElement) {
    this.createTweetFrom.get('userSearch').setValue('');
    setTimeout(() => inputSearchUser.focus());
  }

  touchSearchTag() {
    this.searchTags$.next(this.searchTags$.value);
    this.searchInputTrigger.openPanel();
  }

  submit() {
    const quantity = this.autoAdd ? this.randomTweetSelectOption : 1;

    iif(() => this.autoAdd, this.randomTweet(), this.mapTweet())
      .pipe(
        switchMap(tweets => this.createService.createTweets(tweets)),
        take(1),
      )
      .subscribe(tweets => {
        if (tweets) {
          this.socketService.emit('create-tweets', tweets);
          this.toastrService.success(`${quantity} tweets added`);
          this.createTweetFrom.reset();
          this.createTweetFrom.enable();
          (this.createTweetFrom.controls['matching_rules'] as FormArray).clear();
        } else {
          this.toastrService.error('Something went wrong!');
        }
      });
  }

  private mapTweet() {
    if (this.autoAdd) return of([]);
    return of([
      {
        caption: this.createTweetFrom.value.caption,
        matching_rules: this.createTweetFrom.value.matching_rules.map(r => r._id),
        place: this.createTweetFrom.value.place,
        user: this.createTweetFrom.value.user._id,
        public_metrics: this.randomPublicMetrics(),
      },
    ]);
  }

  private randomTweet() {
    if (!this.autoAdd) return;
    const newUsers$ = this.createService
      .getRandomUsers(this.randomTweetSelectOption)
      .pipe(map(users => users.map(u => u._id)));
    const caption$ = this.createService.getRandomCaption().pipe(
      map(posts => {
        const _rules = new Set<string>();
        while (_rules.size < this.randomTweetSelectOption) {
          _rules.add(posts[randomInt(0, posts.length - 1)].body);
        }
        return Array.from(_rules);
      }),
    );
    const tags$ = this.createService.getRules('').pipe(
      map(rules => {
        const _rules: string[][] = [];
        for (let i = 0; i < this.randomTweetSelectOption; i++) {
          const length = randomInt(1, rules.length);
          const r = new Set(
            new Array(length).fill(null).map(() => rules[randomInt(0, rules.length - 1)]._id),
          );
          _rules.push(Array.from(r));
        }
        return _rules;
      }),
    );
    const places$ = this.createService.getCountries().pipe(
      switchMap(c => {
        return this.createService.randomPlace(c[randomInt(0, c.length - 1)].cca2);
      }),
      map(places =>
        places.map<Place>(p => ({
          bbox: getLatLngFromUrl(p.googleMapsLink),
          full_name: p.name,
        })),
      ),
    );

    return forkJoin([caption$, newUsers$, tags$, places$]).pipe(
      map(([caption, newUsers, tags, places]) => {
        const tws: Tweet[] = [];
        for (let i = 0; i < this.randomTweetSelectOption; i++) {
          tws.push({
            caption: caption[i],
            matching_rules: tags[i],
            place: places[i],
            user: newUsers[i],
            public_metrics: this.randomPublicMetrics(),
          });
        }
        return tws;
      }),
    );
  }

  private randomPublicMetrics() {
    return {
      like_count: randomInt(1, 1000),
      reply_count: randomInt(1, 1000),
      retweet_count: randomInt(1, 1000),
    };
  }
}
