import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import {
  CountryPlace,
  getLatLngFromUrl,
  Place,
  PlaceLocation,
  randomInt,
  RandomUser,
  Rule,
  Tweet,
  User,
} from '@app/client/common';
import { APP_CONFIG, AppConfig } from '@app/client/core/web-frameworks';
import { SocketService } from '@app/client/services';
import { forkJoin, interval } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class CreateService {
  constructor(
    private http: HttpClient,
    @Inject(APP_CONFIG) private appConfig: AppConfig,
    private socketService: SocketService,
  ) {
    interval(30_000)
      .pipe(
        switchMap(() => this.randomTweet()),
        switchMap(tweets => this.createTweets(tweets)),
      )
      .subscribe(tweets => {
        console.log('CreateService', tweets);
        this.socketService.emit('create-tweets', tweets);
      });
  }

  getRules(keyword: string) {
    return this.http.get<Rule[]>(`${this.appConfig.apiUrl}/api/tweet/rule`, {
      params: { keyword },
    });
  }

  getUsers(keyword: string) {
    return this.http.get<User[]>(`${this.appConfig.apiUrl}/api/tweet/user`, {
      params: { keyword },
    });
  }

  getRandomUsers(count: number) {
    return this.http.get<{ _id: string }[]>(`${this.appConfig.apiUrl}/api/tweet/random-user`, {
      params: { count: `${count}` },
    });
  }

  getRandomCaption() {
    return this.http.get<{ body: string }[]>(this.appConfig.captionApiUrl);
  }

  getCountries() {
    return this.http.get<CountryPlace[]>(`${this.appConfig.countriesApiUrl}/all`, {
      params: { fields: 'name,cca2,languages' },
    });
  }

  randomPlace(countryCode: string) {
    return this.http.get<PlaceLocation[]>(`${this.appConfig.apiUrl}/api/tweet/places`, {
      params: { country: countryCode },
    });
  }

  randomUser(quantity: number) {
    return this.http.get<{ results: RandomUser[] }>(`${this.appConfig.randomUserApiUrl}`, {
      params: { result: `${quantity}` },
    });
  }

  createTweets(tweets: Tweet[]) {
    return this.http.post<{ data: Tweet[] }>(`${this.appConfig.apiUrl}/api/tweet`, { tweets });
  }

  createUsers(users: User[]) {
    return this.http.post<boolean>(`${this.appConfig.apiUrl}/api/tweet/user`, { users });
  }

  createRules(rules: Rule[]) {
    return this.http.post<boolean>(`${this.appConfig.apiUrl}/api/tweet/rule`, { rules });
  }

  randomTweet() {
    const LENGTH = 1;

    const newUsers$ = this.getRandomUsers(LENGTH).pipe(map(users => users.map(u => u._id)));
    const caption$ = this.getRandomCaption().pipe(
      map(posts => {
        const _rules = new Set<string>();
        while (_rules.size < LENGTH) {
          _rules.add(posts[randomInt(0, posts.length - 1)].body);
        }
        return Array.from(_rules);
      }),
    );
    const tags$ = this.getRules('').pipe(
      map(rules => {
        const _rules: string[][] = [];
        for (let i = 0; i < LENGTH; i++) {
          const length = randomInt(1, rules.length);
          const r = new Set(
            new Array(length).fill(null).map(() => rules[randomInt(0, rules.length - 1)]._id),
          );
          _rules.push(Array.from(r));
        }
        return _rules;
      }),
    );
    const places$ = this.getCountries().pipe(
      switchMap(c => {
        return this.randomPlace(c[randomInt(0, c.length - 1)].cca2);
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
        for (let i = 0; i < LENGTH; i++) {
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
