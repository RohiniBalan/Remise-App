import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Save, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react-native';
import { AdminColors, Spacing, FontSizes, BorderRadius } from '../../styles/theme';

// Shared chrome for every admin content-editor screen: status banner +
// scrollable field area + Save/Reset footer. See useAdminContent.ts for
// the paired state-machine hook.
export default function AdminContentLayout({
  loading,
  saving,
  status,
  onSave,
  onReset,
  children,
}: {
  loading: boolean;
  saving: boolean;
  status: { type: 'success' | 'error' | ''; message: string };
  onSave: () => void;
  onReset: () => void;
  children: React.ReactNode;
}) {
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={AdminColors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: Spacing.lg, paddingBottom: Spacing.xxl }}>
        {status.type ? (
          <View style={[styles.banner, status.type === 'error' ? styles.bannerError : styles.bannerSuccess]}>
            {status.type === 'error' ? <AlertCircle size={14} color="#DC2626" /> : <CheckCircle size={14} color="#16A34A" />}
            <Text style={[styles.bannerText, status.type === 'error' && { color: '#DC2626' }]}>{status.message}</Text>
          </View>
        ) : null}
        {children}
      </ScrollView>
      <View style={styles.footer}>
        <TouchableOpacity style={styles.resetBtn} onPress={onReset} disabled={saving}>
          <RefreshCw size={14} color="#374151" />
          <Text style={styles.resetBtnText}>Reset</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.saveBtn} onPress={onSave} disabled={saving}>
          {saving ? <ActivityIndicator size="small" color="#fff" /> : <><Save size={14} color="#fff" /><Text style={styles.saveBtnText}>Save Changes</Text></>}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: AdminColors.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: AdminColors.bg },
  banner: { flexDirection: 'row', gap: Spacing.sm, alignItems: 'center', padding: Spacing.md, borderRadius: BorderRadius.md, marginBottom: Spacing.md },
  bannerSuccess: { backgroundColor: '#F0FDF4' },
  bannerError: { backgroundColor: '#FEF2F2' },
  bannerText: { fontSize: FontSizes.xs, fontWeight: '600', color: '#16A34A', flex: 1 },
  footer: { flexDirection: 'row', gap: Spacing.sm, padding: Spacing.md, borderTopWidth: 1, borderTopColor: AdminColors.border, backgroundColor: '#fff' },
  resetBtn: { flexDirection: 'row', gap: 6, alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing.lg, borderRadius: BorderRadius.md, backgroundColor: AdminColors.bg, borderWidth: 1, borderColor: AdminColors.border },
  resetBtnText: { color: '#374151', fontWeight: '700', fontSize: FontSizes.sm },
  saveBtn: { flex: 1, flexDirection: 'row', gap: 6, alignItems: 'center', justifyContent: 'center', backgroundColor: AdminColors.primary, paddingVertical: Spacing.md, borderRadius: BorderRadius.md },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: FontSizes.sm },
});
