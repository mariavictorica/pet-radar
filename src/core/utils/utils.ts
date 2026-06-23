import { envs } from 'src/config/envs';

export const generateMapboxSinglePin = (lat: number, lon: number): string => {
  const token = envs.MAPBOX_TOKEN;
  const zoom = 14;
  const width = 800;
  const height = 400;
  return `https://api.mapbox.com/styles/v1/mapbox/light-v11/static/pin-s-dog+f44(${lon},${lat})/${lon},${lat},${zoom}/${width}x${height}?access_token=${token}`;
};

// Two-pin map: lostPin (red) = where lost, foundPin (green) = where found
export const generateMapboxTwoPins = (
  lostLat: number,
  lostLon: number,
  foundLat: number,
  foundLon: number,
): string => {
  const token = envs.MAPBOX_TOKEN;

  const centerLon = (lostLon + foundLon) / 2;
  const centerLat = (lostLat + foundLat) / 2;

  const width = 800;
  const height = 400;
  const zoom = 14;

  // Red pin = lost location, Green pin = found location
  const lostPin = `pin-s-l+f00(${lostLon},${lostLat})`;
  const foundPin = `pin-s-f+0f0(${foundLon},${foundLat})`;
  const overlays = `${lostPin},${foundPin}`;

  return `https://api.mapbox.com/styles/v1/mapbox/light-v11/static/${overlays}/${centerLon},${centerLat},${zoom}/${width}x${height}?access_token=${token}`;
};
