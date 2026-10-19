import React, { useEffect, useState } from 'react';
import { Platform, View } from 'react-native';
import Constants from 'expo-constants';
import { getAdUnitId } from '@/lib/adsConfig';
import { useColors } from '@/hooks/useColors';

type AdsSdk = typeof import('react-native-google-mobile-ads');
let adsInitialization: Promise<unknown> | null = null;

function isExpoGo() {
  return Constants.executionEnvironment === Constants.ExecutionEnvironment.StoreClient;
}

export function BannerAdSlot() {
  const colors = useColors();
  const [sdk, setSdk] = useState<AdsSdk | null>(null);
  const unitId = getAdUnitId('banner');
  useEffect(() => {
    if (Platform.OS === 'web' || isExpoGo() || !unitId) return;
    let mounted = true;
    void import('react-native-google-mobile-ads')
      .then(async (loaded) => {
        adsInitialization ??= loaded.MobileAds().initialize();
        await adsInitialization;
        if (mounted) setSdk(loaded);
      })
      .catch(() => { if (mounted) setSdk(null); });
    return () => { mounted = false; };
  }, [unitId]);
  if (!sdk?.BannerAd || !unitId || Platform.OS === 'web' || isExpoGo()) return null;
  const Banner = sdk.BannerAd;
  return (
    <View style={{ minHeight: 50, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
      <Banner unitId={unitId} size={sdk.BannerAdSize.ANCHORED_ADAPTIVE_BANNER} />
    </View>
  );
}

export async function showWorkoutInterstitial() {
  const unitId = getAdUnitId('interstitial');
  if (!unitId || Platform.OS === 'web' || isExpoGo()) return;
  try {
    const sdk = await import('react-native-google-mobile-ads');
    adsInitialization ??= sdk.MobileAds().initialize();
    await adsInitialization;
    const ad = sdk.InterstitialAd.createForAdRequest(unitId);
    await new Promise<void>((resolve) => {
      let finished = false;
      let unsubscribeLoaded = () => {};
      let unsubscribeClosed = () => {};
      let unsubscribeFailed = () => {};
      const finish = () => {
        if (finished) return;
        finished = true;
        clearTimeout(timeout);
        unsubscribeLoaded();
        unsubscribeClosed();
        unsubscribeFailed();
        resolve();
      };
      const timeout = setTimeout(finish, 6000);
      unsubscribeLoaded = ad.addAdEventListener(sdk.AdEventType.LOADED, () => {
        void ad.show().catch(finish);
      });
      unsubscribeClosed = ad.addAdEventListener(sdk.AdEventType.CLOSED, finish);
      unsubscribeFailed = ad.addAdEventListener(sdk.AdEventType.ERROR, finish);
      ad.load();
    });
  } catch {
    // The workout is already saved; an ad load failure must not interrupt it.
  }
}
