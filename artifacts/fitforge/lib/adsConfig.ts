// Replace the release unit IDs after FitForge's AdMob account is created.
export const adUnits = {
  test: {
    banner: 'ca-app-pub-3940256099942544/6300978111',
    interstitial: 'ca-app-pub-3940256099942544/1033173712',
    rewarded: 'ca-app-pub-3940256099942544/5224354917',
  },
  release: {
    banner: '',
    interstitial: '',
    rewarded: '',
  },
};

export function getAdUnitId(kind: keyof typeof adUnits.test) {
  return __DEV__ ? adUnits.test[kind] : adUnits.release[kind] || null;
}
