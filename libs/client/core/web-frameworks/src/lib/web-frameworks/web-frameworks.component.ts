import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogService } from '@app/client/core/dynamic-dialog';
import { WebFrameworksChartData } from '@app/client/models';
import { TweetTagMapService } from '@app/client/services';
import { combineLatest, Observable } from 'rxjs';
import { map, switchMap, take, tap } from 'rxjs/operators';
import { SettingsComponent } from '../dialogs/settings/settings.component';
import { WebFrameworksRulesQuery } from '../state/web-frameworks-rules/web-frameworks-rules.query';
import { WebFrameworksTweetsQuery } from '../state/web-frameworks-tweets/web-frameworks-tweets.query';
import { WebFrameworksQuery } from '../state/web-frameworks/web-frameworks.query';
import { WebFrameworksService } from '../web-frameworks.service';

@Component({
  selector: 'app-web-frameworks',
  templateUrl: './web-frameworks.component.html',
  styleUrls: ['./web-frameworks.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WebFrameworksComponent implements OnInit, OnDestroy {
  subscribedAt$ = this.webFrameworksQuery.subscribedAt$;
  isSubscribed$ = this.webFrameworksQuery.isSubscribed$;
  rules: string[] = [];
  areInitialize = false;
  chartData$ = this.webFrameworksQuery
    .select(state => {
      const { subscribedAt, ...frameworks } = state;
      return frameworks;
    })
    .pipe(
      map(state =>
        Object.entries(state).reduce(
          (acc: WebFrameworksChartData, [key, value]) => {
            const tag = this.tweetTagMapService.getTag(key);
            if (tag) {
              acc.results.push({ name: tag.tag, value: (value as string[])?.length ?? 0 });
              if (tag.color) {
                acc.customColors.push({ name: tag.tag, value: tag.color });
              }
            }
            return acc;
          },
          { results: [], customColors: [] },
        ),
      ),
      tap(chartData => {
        chartData.results.sort((a, b) => b.value - a.value);
      }),
    );

  // vm$: Observable<WebFrameworksVm>;
  vm$: Observable<any>;

  constructor(
    private readonly webFrameworksService: WebFrameworksService,
    private readonly tweetTagMapService: TweetTagMapService,
    private readonly dynamicDialogService: DynamicDialogService,
    private readonly webFrameworksQuery: WebFrameworksQuery,
    private readonly webFrameworksTweetsQuery: WebFrameworksTweetsQuery,
    private readonly webFrameworksRulesQuery: WebFrameworksRulesQuery,
  ) {}

  ngOnInit(): void {
    this.webFrameworksRulesQuery.rules$.subscribe(rules => {
      this.rules = rules.map((rule: any) => rule.id);
    });
    this.webFrameworksService.init(this.rules);

    this.vm$ = combineLatest([
      this.chartData$,
      this.webFrameworksTweetsQuery.tweetList$,
      this.webFrameworksTweetsQuery.geoTweetList$,
    ]).pipe(
      map(([chartData, tweets, geoTweets]) => ({
        chartData,
        tweets: tweets.filter(t => {
          for (let i = 0; i < this.rules.length; i++) {
            if (t.tagIds.includes(this.rules[i])) {
              return true;
            }
          }
          return false;
        }),
        geoTweets,
      })),
    );
  }

  toggleStream(isSubscribed: boolean) {
    if (isSubscribed) {
      this.webFrameworksService.unsubscribeStream();
    } else {
      this.webFrameworksService.init(this.rules);
    }
  }

  onSettingsClicked() {
    this.webFrameworksRulesQuery.rules$
      .pipe(
        take(1),
        switchMap(rules => {
          const config = new DynamicDialogConfig<typeof rules>();
          config.data = rules;
          config.header = 'Adjust Twitter Queries';
          config.closable = true;
          const ref = this.dynamicDialogService.open<{ thumb: string; tag: string }[]>(
            SettingsComponent,
            config,
          );
          return ref.afterClosed;
        }),
      )
      .subscribe(rulesToAdd => {
        if (rulesToAdd) {
          this.webFrameworksService.setRules(rulesToAdd);
        }
      });
  }

  ngOnDestroy() {
    this.webFrameworksService.unsubscribeStream();
  }
}
