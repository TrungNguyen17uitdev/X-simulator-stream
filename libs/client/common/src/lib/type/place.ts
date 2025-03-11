export interface Place {
  full_name: string;
  bbox: [number, number];
}

export interface CountryPlace {
  name: Name;
  cca2: string;
  languages: LanguagesMap;
}

export interface PlaceLocation {
  country: string;
  name: string;
  wikipediaLink: string;
  googleMapsLink: string;
  id: number;
  asciiName: string;
  state: string;
  countryDigraph: string;
  continentCode: string;
}

interface Name {
  common: string;
  official: string;
  nativeName: NativeName;
}

type NativeName = Record<string, Languages>;

interface Languages {
  official: string;
  common: string;
}

type LanguagesMap = Record<string, string>;
