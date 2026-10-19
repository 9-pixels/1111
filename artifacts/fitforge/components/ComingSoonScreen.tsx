import React from 'react';
import { Feather } from '@expo/vector-icons';
import { Text, View } from 'react-native';
import { Body, Eyebrow, Page, Panel, Title } from '@/components/FitForgeUI';
import { useColors } from '@/hooks/useColors';

export default function ComingSoonScreen({
  eyebrow,
  title,
  description,
  icon,
}: {
  eyebrow: string;
  title: string;
  description: string;
  icon: React.ComponentProps<typeof Feather>['name'];
}) {
  const colors = useColors();
  return (
    <Page contentStyle={{ justifyContent: 'center', flexGrow: 1 }}>
      <Panel style={{ padding: 23 }}>
        <View style={{ width: 48, height: 48, borderRadius: 15, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' }}>
          <Feather name={icon} size={22} color={colors.primary} />
        </View>
        <Eyebrow>{eyebrow}</Eyebrow>
        <Title size={29}>{title}</Title>
        <Body>{description}</Body>
        <Text style={{ color: colors.mutedForeground, fontFamily: 'Inter_500Medium', fontSize: 12 }}>
          This section is being built in the next FitForge phase.
        </Text>
      </Panel>
    </Page>
  );
}
