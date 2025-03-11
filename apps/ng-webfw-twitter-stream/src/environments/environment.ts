// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  apiUrl: 'http://localhost:3333',
  randomUserApiUrl: 'https://randomuser.me/api',
  randomLocationApiUrl: 'https://hiveword.com/papi',
  countriesApiUrl: 'https://restcountries.com/v3.1',
  captionApiUrl: 'https://jsonplaceholder.typicode.com/posts',
  firebaseConfig: {
    apiKey: 'AIzaSyAenIlf2tdBgigAND1EC5qbtvE1g-cMo4E',
    authDomain: 'rem-app-113.firebaseapp.com',
    projectId: 'rem-app-113',
    storageBucket: 'rem-app-113.appspot.com',
    messagingSenderId: '342831982247',
    appId: '1:342831982247:web:8c7f4dd636412c7c569d82',
  },
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
