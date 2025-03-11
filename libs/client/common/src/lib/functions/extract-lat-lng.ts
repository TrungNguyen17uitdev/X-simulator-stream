export function getLatLngFromUrl(url: string): [number, number] | null {
  try {
    const urlObj = new URL(url);
    const params = new URLSearchParams(urlObj.search);

    if (params.has('ll')) {
      const [lat, lng] = params.get('ll')!.split(',').map(Number);
      return [lat, lng];
    }
  } catch (error) {
    console.error('Invalid URL:', error);
  }

  return null;
}
