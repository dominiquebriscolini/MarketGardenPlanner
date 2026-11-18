import atlasUrl from './assets/grainrad-plants/atlas.png';
import manifest from './assets/grainrad-plants/manifest.json';

const assets = new Map(Object.entries(manifest.assets));
const styles = new Map(Object.entries(manifest.presentation.cultures));
const profileSpecies = new Map(Object.entries(manifest.byProfile));

export const grainradPlantAtlas = {
  url: atlasUrl,
  width: manifest.width,
  height: manifest.height,
  sequence: manifest.sequence,
  poseMs: manifest.poseMs,
  growthScale: manifest.growthScale,
  presentation: {
    dark: manifest.presentation.dark,
    light: manifest.presentation.light,
    underground: manifest.presentation.underground,
  },
};

export function grainradPlantForSpecies(speciesId: string) {
  const sprite = assets.get(speciesId);
  const presentation = styles.get(speciesId);
  return sprite && presentation ? {speciesId, sprite, presentation} : undefined;
}

export function grainradPlantForProfile(profileId: string) {
  const speciesId = profileSpecies.get(profileId);
  return speciesId === undefined ? undefined : grainradPlantForSpecies(speciesId);
}
