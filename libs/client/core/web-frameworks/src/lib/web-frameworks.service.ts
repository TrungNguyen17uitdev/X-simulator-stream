import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Rule } from '@app/client/common';
import { SocketService, TweetTagMapService } from '@app/client/services';
import { applyTransaction } from '@datorama/akita';
import { Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';
import { APP_CONFIG, AppConfig } from './app.config';
import { WebFrameworksRulesStore } from './state/web-frameworks-rules/web-frameworks-rules.store';
import { WebFrameworksTweetsStore } from './state/web-frameworks-tweets/web-frameworks-tweets.store';
import { WebFrameworksStore } from './state/web-frameworks/web-frameworks.store';

@Injectable({ providedIn: 'root' })
export class WebFrameworksService {
  private readonly $unsubscribed = new Subject();

  constructor(
    private readonly http: HttpClient,
    private readonly socketService: SocketService,
    private readonly webFrameworksStore: WebFrameworksStore,
    private readonly webFrameworksTweetsStore: WebFrameworksTweetsStore,
    private readonly webFrameworksRulesStore: WebFrameworksRulesStore,
    private readonly tweetTagMapService: TweetTagMapService,
    @Inject(APP_CONFIG) private readonly appConfig: AppConfig,
  ) {}

  init(rules: string[]) {
    const _rules = rules?.length
      ? rules
      : ['67b5e8a2c6bd6f4f28ff6723', '67b5e8a2c6bd6f4f28ff6724', '67b5e8a2c6bd6f4f28ff6725'];

    this.socketService.emit('subscribe', _rules);
    this.webFrameworksStore.update({ subscribedAt: Date.now() });
    this.listenToTweetStream();
    this.getRules();
  }

  setRules(rules: Rule[]): void {
    this.http.post<Rule[]>(`${this.appConfig.apiUrl}/api/rules`, rules).subscribe(data => {
      const newRules: Rule[] = data.map(rule => {
        return {
          id: rule._id,
          thumb: rule.thumb,
          tag: rule.tag,
        };
      });
      this.tweetTagMapService.setTag(newRules);
      applyTransaction(() => {
        this.webFrameworksRulesStore.update(() => ({
          rules: newRules,
        }));
        const ruleCount = {};
        for (const newRule of newRules) {
          ruleCount[newRule.tag] = [];
        }
        this.webFrameworksStore.update(ruleCount);
      });
    });
  }

  deleteRules(rules: string[]): void {
    this.http.put(`${this.appConfig.apiUrl}/api/rules`, rules).subscribe(() => {
      const deletedRules = this.webFrameworksRulesStore
        .getValue()
        .rules.filter(rule => rules.includes(rule._id));
      applyTransaction(() => {
        this.webFrameworksRulesStore.update(state => ({
          rules: state.rules.filter(rule => !rules.includes(rule._id)),
        }));
        for (const rule of deletedRules) {
          localStorage.removeItem(rule.tag);
          this.webFrameworksStore.update(state =>
            Object.keys(state).reduce((newState, key) => {
              if (key === rule.tag) {
                delete newState[rule.tag];
              }
              return newState;
            }, state),
          );
        }
      });
    });
  }

  private getRules() {
    this.http
      .get<{ _id: string; thumb: string; tag: string }[]>(`${this.appConfig.apiUrl}/api/rules`)
      .subscribe(data => {
        const defaultTags = [
          '67b5e8a2c6bd6f4f28ff6723',
          '67b5e8a2c6bd6f4f28ff6724',
          '67b5e8a2c6bd6f4f28ff6725',
        ];
        const nonDefaultRules = data.filter(rule => defaultTags.includes(rule._id));
        applyTransaction(() => {
          this.webFrameworksRulesStore.update(() => {
            const rules: Rule[] = nonDefaultRules.map(rule => {
              const storedTag = localStorage.getItem(rule._id);
              const tag: Rule = storedTag
                ? JSON.parse(storedTag)
                : {
                    thumb: rule.thumb,
                    tag: rule.tag,
                  };
              this.tweetTagMapService.addTag(tag);
              return {
                id: rule._id,
                thumb: rule.thumb,
                ...tag,
              };
            });
            console.log('{ rules }', rules);
            return { rules };
          });

          for (const nonDefaultRule of nonDefaultRules) {
            this.webFrameworksStore.update({ [nonDefaultRule.tag]: 0 });
          }
        });
      });
  }

  searchTags(keyword: string) {
    return this.http.get<Rule[]>(`${this.appConfig.apiUrl}/api/tweet/rule`, {
      params: { keyword },
    });
  }

  private listenToTweetStream() {
    this.socketService
      .on('tweetData')
      .pipe(
        tap(tweet => {
          applyTransaction(() => {
            this.webFrameworksStore.updateFromTweet(tweet);
            this.webFrameworksTweetsStore.updateFromTweet(tweet);
          });
        }),
        takeUntil(this.$unsubscribed),
      )
      .subscribe();
  }

  unsubscribeStream() {
    this.socketService.emit('unsubscribe');
    this.$unsubscribed.next();
    this.webFrameworksStore.update({ subscribedAt: 0 });
  }
}
