export interface User {
  name: string;
  profile_image_url: string;
}

export interface RandomUser {
  gender: string;
  name: Name;
  location: Location;
  email: string;
}

export interface Name {
  title: string;
  first: string;
  last: string;
}
