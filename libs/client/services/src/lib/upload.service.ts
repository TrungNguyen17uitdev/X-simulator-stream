import { Injectable } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/storage';
import { UploadTaskSnapshot } from '@angular/fire/storage/interfaces';
import { BehaviorSubject } from 'rxjs';
import { finalize } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class UploadImageService {
  snapshot: UploadTaskSnapshot;
  constructor(private readonly angularFireStorage: AngularFireStorage) {}

  upload(file: File) {
    const fileUrl$ = new BehaviorSubject<string>(undefined);

    this.angularFireStorage
      .upload(`${Date.now().toString()}-${file.name}`, file)
      .snapshotChanges()
      .pipe(
        finalize(async () => {
          const url = await this.snapshot?.ref.getDownloadURL();
          fileUrl$.next(url);
        }),
      )
      .subscribe(snapshot => {
        this.snapshot = snapshot;
      });

    return fileUrl$;
  }
}
