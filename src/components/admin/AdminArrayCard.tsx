import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ChevronUp, ChevronDown, Trash2 } from 'lucide-react-native';
import { AdminColors, Spacing, FontSizes, BorderRadius } from '../../styles/theme';

// Shared card chrome for every "array of editable items" admin content page
// (Characters, Best Sellers, Shop By Age, Shop By Category, Bento Grid,
// Hot Drops videos, Studio videos, Ralleyz items) — up/down reorder +
// delete, matching web's index-swap reorder buttons (no drag-drop there
// either) + per-item delete confirm.
export default function AdminArrayCard({
  index,
  total,
  onMoveUp,
  onMoveDown,
  onDelete,
  children,
}: {
  index: number;
  total: number;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.toolbar}>
        <Text style={styles.indexText}>#{index + 1}</Text>
        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionBtn} onPress={onMoveUp} disabled={index === 0}>
            <ChevronUp size={14} color={index === 0 ? '#D1D5DB' : AdminColors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={onMoveDown} disabled={index === total - 1}>
            <ChevronDown size={14} color={index === total - 1 ? '#D1D5DB' : AdminColors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={onDelete}>
            <Trash2 size={14} color="#DC2626" />
          </TouchableOpacity>
        </View>
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: BorderRadius.md, borderWidth: 1, borderColor: AdminColors.border, padding: Spacing.md, marginBottom: Spacing.md },
  toolbar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  indexText: { fontSize: FontSizes.xs, fontWeight: '700', color: AdminColors.textMuted },
  actions: { flexDirection: 'row', gap: 4 },
  actionBtn: { width: 26, height: 26, alignItems: 'center', justifyContent: 'center', backgroundColor: AdminColors.bg, borderRadius: BorderRadius.sm },
});
