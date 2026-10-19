import React, { type ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  type PressableProps,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { KeyboardAwareScrollViewCompat } from '@/components/KeyboardAwareScrollViewCompat';

export function Page({
  children,
  contentStyle,
  scroll = true,
}: {
  children: ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
  scroll?: boolean;
}) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const content = (
    <View
      style={[
        styles.pageContent,
        { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 28 },
        contentStyle,
      ]}
    >
      {children}
    </View>
  );
  if (!scroll) return <View style={[styles.page, { backgroundColor: colors.background }]}>{content}</View>;
  return (
    <KeyboardAwareScrollViewCompat
      style={[styles.page, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      bottomOffset={24}
    >
      {content}
    </KeyboardAwareScrollViewCompat>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  const colors = useColors();
  return <Text style={[styles.eyebrow, { color: colors.primary }]}>{children}</Text>;
}

export function Title({ children, size = 32 }: { children: ReactNode; size?: number }) {
  const colors = useColors();
  return <Text style={[styles.title, { color: colors.foreground, fontSize: size }]}>{children}</Text>;
}

export function Body({ children, style }: { children: ReactNode; style?: StyleProp<TextStyle> }) {
  const colors = useColors();
  return <Text style={[styles.body, { color: colors.mutedForeground }, style]}>{children}</Text>;
}

export function Panel({
  children,
  style,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const colors = useColors();
  return (
    <View
      style={[
        styles.panel,
        { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius },
        style,
      ]}
    >
      {children}
    </View>
  );
}

export function ActionButton({
  children,
  onPress,
  disabled,
  secondary = false,
  style,
  testID,
}: {
  children: ReactNode;
  onPress: PressableProps['onPress'];
  disabled?: boolean;
  secondary?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}) {
  const colors = useColors();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      testID={testID}
      style={({ pressed }) => [
        styles.actionButton,
        {
          backgroundColor: secondary ? colors.secondary : colors.primary,
          opacity: disabled ? 0.42 : pressed ? 0.78 : 1,
        },
        style,
      ]}
    >
      {typeof children === 'string' ? (
        <Text style={[styles.actionText, { color: secondary ? colors.foreground : colors.primaryForeground }]}>
          {children}
        </Text>
      ) : (
        children
      )}
    </Pressable>
  );
}

export function LoadingView({ label = 'Loading FitForge…' }: { label?: string }) {
  const colors = useColors();
  return (
    <View style={[styles.centered, { backgroundColor: colors.background }]}>
      <ActivityIndicator color={colors.primary} size="large" />
      <Text style={[styles.body, { color: colors.mutedForeground }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  pageContent: { width: '100%', maxWidth: 560, alignSelf: 'center', paddingHorizontal: 22, gap: 18 },
  eyebrow: { fontFamily: 'Inter_700Bold', fontSize: 11, letterSpacing: 1.6, lineHeight: 16 },
  title: { fontFamily: 'Inter_700Bold', letterSpacing: -0.7, lineHeight: 38 },
  body: { fontFamily: 'Inter_400Regular', fontSize: 14, lineHeight: 21 },
  panel: { padding: 18, borderWidth: 1, gap: 12 },
  actionButton: {
    minHeight: 54,
    paddingHorizontal: 20,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: { fontFamily: 'Inter_700Bold', fontSize: 15, letterSpacing: 0.1 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14, padding: 24 },
});
