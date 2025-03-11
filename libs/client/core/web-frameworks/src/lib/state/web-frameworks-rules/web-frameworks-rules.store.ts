import { Injectable } from '@angular/core';
import { Rule } from '@app/client/common';
import { Store, StoreConfig } from '@datorama/akita';

export interface WebFrameworksRulesState {
  rules: Rule[];
}

export function createInitialState(): WebFrameworksRulesState {
  return {
    rules: [],
  };
}

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'web-frameworks-rules', resettable: true })
export class WebFrameworksRulesStore extends Store<WebFrameworksRulesState> {
  constructor() {
    super(createInitialState());
  }
}
