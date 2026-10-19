import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { EMPTY_DATA, type FitForgeData, type UserProfile } from '@/lib/fitness';

const STORAGE_KEY = '@fitforge/local-store';
const STORE_VERSION = 1;

interface StoreEnvelope {
  version: number;
  data: FitForgeData;
}

interface FitForgeContextValue {
  data: FitForgeData;
  isReady: boolean;
  loadError: string | null;
  retryLoad: () => void;
  updateData: (update: (current: FitForgeData) => FitForgeData) => Promise<void>;
  saveProfile: (profile: UserProfile) => Promise<void>;
  resetData: () => Promise<void>;
}

const FitForgeContext = createContext<FitForgeContextValue | null>(null);

export function FitForgeProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<FitForgeData>(EMPTY_DATA);
  const dataRef = useRef(data);
  const [isReady, setIsReady] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadAttempt, setLoadAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setIsReady(false);
      setLoadError(null);
      try {
        const serialized = await AsyncStorage.getItem(STORAGE_KEY);
        let nextData = EMPTY_DATA;
        if (serialized) {
          const envelope = JSON.parse(serialized) as StoreEnvelope;
          if (envelope.version !== STORE_VERSION || !envelope.data) {
            throw new Error('Your saved FitForge data uses an unsupported store version.');
          }
          nextData = { ...EMPTY_DATA, ...envelope.data };
        }
        if (!cancelled) {
          dataRef.current = nextData;
          setData(nextData);
          setIsReady(true);
        }
      } catch (error) {
        if (!cancelled) {
          setLoadError(
            error instanceof Error
              ? error.message
              : 'FitForge could not read your saved data.',
          );
          setIsReady(true);
        }
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [loadAttempt]);

  const retryLoad = useCallback(() => setLoadAttempt((attempt) => attempt + 1), []);

  const updateData = useCallback(
    async (update: (current: FitForgeData) => FitForgeData) => {
      const nextData = update(dataRef.current);
      const envelope: StoreEnvelope = { version: STORE_VERSION, data: nextData };
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(envelope));
      } catch {
        throw new Error('FitForge could not save your changes. Please try again.');
      }
      dataRef.current = nextData;
      setData(nextData);
    },
    [],
  );

  const saveProfile = useCallback(
    async (profile: UserProfile) => {
      await updateData((current) => ({ ...current, profile }));
    },
    [updateData],
  );

  const resetData = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      dataRef.current = EMPTY_DATA;
      setData(EMPTY_DATA);
    } catch {
      throw new Error('FitForge could not reset your saved data.');
    }
  }, []);

  const value = useMemo(
    () => ({ data, isReady, loadError, retryLoad, updateData, saveProfile, resetData }),
    [data, isReady, loadError, retryLoad, updateData, saveProfile, resetData],
  );

  return <FitForgeContext.Provider value={value}>{children}</FitForgeContext.Provider>;
}

export function useFitForge() {
  const context = useContext(FitForgeContext);
  if (!context) throw new Error('useFitForge must be used within FitForgeProvider');
  return context;
}
