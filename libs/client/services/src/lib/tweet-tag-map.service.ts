import { Injectable } from '@angular/core';
import { Rule } from '@app/client/common';

@Injectable({ providedIn: 'root' })
export class TweetTagMapService {
  private readonly _tags: Map<string, Rule> = new Map<string, Rule>([]);

  get tags(): Rule[] {
    return [...this._tags.values()];
  }

  getTag(key: string): Rule {
    return this._tags.get(key);
  }

  addTag(tag: Rule) {
    this._tags.set(tag.tag, tag);
  }

  setTag(tags: Rule[]) {
    this._tags.clear();
    tags.forEach(tag => {
      this._tags.set(tag.tag, tag);
    });
  }
}
