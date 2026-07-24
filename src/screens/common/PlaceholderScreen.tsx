import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { CustomerColors, Spacing, FontSizes } from '../../styles/theme';
import { PLACEHOLDER_META } from './placeholderMeta';

// Temporary stand-in for every screen not yet built (Build Order Step 1:
// "empty placeholder screens wired into the right stacks"). Each real
// screen replaces its PlaceholderScreen route one at a time in later phases
// — see the plan file's Screen Inventory for the web source each maps to.
// Looks up its title/web-source by route.name rather than route.params so
// it never has to collide with a route's real future param type.
export default function PlaceholderScreen({ route }: any) {
  const meta = PLACEHOLDER_META[route?.name] ?? { title: route?.name ?? 'Screen' };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{meta.title}</Text>
      <Text style={styles.subtitle}>Not yet implemented</Text>
      {meta.webSource && <Text style={styles.source}>web source: {meta.webSource}</Text>}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: CustomerColors.bg,
    padding: Spacing.xl,
    minHeight: 400,
  },
  title: { fontSize: FontSizes.lg, fontWeight: '700', color: CustomerColors.black, textAlign: 'center' },
  subtitle: { fontSize: FontSizes.sm, color: CustomerColors.textSecondary, marginTop: Spacing.sm },
  source: { fontSize: FontSizes.xs, color: CustomerColors.teal600, marginTop: Spacing.md, textAlign: 'center' },
});
