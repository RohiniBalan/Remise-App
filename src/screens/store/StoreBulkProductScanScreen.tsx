import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Trash2, ImageIcon, Plus, CheckCircle2 } from 'lucide-react-native';
import { storeProductApi } from '../../api/storeProductApi';
import { useStoreDashboard } from '../../context/StoreDashboardContext';
import {
  CustomerColors,
  Spacing,
  FontSizes,
  BorderRadius,
} from '../../styles/theme';
import {
  buildProductFormData,
  ProductFormFields,
} from '../../utils/productForm';
import ProductFieldsForm from '../../components/store/ProductFieldsForm';

export interface BulkProductRow extends ProductFormFields {
  id: string;
  imageUrl: string;
}

type Step = 'review' | 'saving' | 'done';

// New, separate entry point from the existing single-photo "Scan Paper" flow
// (StoreProductFormScreen) — reached via StoreProductsScreen's new "Scan
// Grocery List" button, which does the picking + scanBulkProducts() call and
// hands the resulting rows here as route params. Renders one editable card
// per detected product (same ProductFieldsForm used by the single form),
// then "Add All Products" loops storeProductApi.create() per card via the
// existing single-create endpoint, continuing past individual failures —
// same continue-on-failure idea as web's BulkSmartUploadModal, just without
// a backend bulk endpoint (none exists, none is needed).
export default function StoreBulkProductScanScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { store, categories, refresh } = useStoreDashboard();

  const [rows, setRows] = useState<BulkProductRow[]>(
    route.params?.scanned || [],
  );
  const [step, setStep] = useState<Step>('review');
  const [summary, setSummary] = useState<{
    added: number;
    failed: { name: string; reason: string }[];
  }>({ added: 0, failed: [] });

  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  const setRow = (id: string, k: keyof ProductFormFields, v: string) =>
    setRows(rs => rs.map(r => (r.id === id ? { ...r, [k]: v } : r)));

  const removeRow = (id: string) => setRows(rs => rs.filter(r => r.id !== id));

  const handleAddAll = async () => {
    setStep('saving');
    let added = 0;
    const failed: { name: string; reason: string }[] = [];
    for (const row of rows) {
      if (!row.title.trim() || !row.price.trim()) {
        failed.push({
          name: row.title || '(unnamed)',
          reason: 'Missing name or price.',
        });
        continue;
      }
      try {
        const fd = buildProductFormData(row, store?._id || '', {
          imageUrl: row.imageUrl,
        });
        await storeProductApi.create(fd);
        added++;
      } catch (err: any) {
        failed.push({
          name: row.title,
          reason: err?.response?.data?.message || 'Failed to create product.',
        });
      }
    }
    setSummary({ added, failed });
    setStep('done');
  };

  if (step === 'done') {
    return (
      <View style={styles.doneContainer}>
        <View style={styles.doneIcon}>
          <CheckCircle2 size={32} color={CustomerColors.success} />
        </View>
        <Text style={styles.doneTitle}>
          {summary.added} product{summary.added === 1 ? '' : 's'} added
          successfully!
        </Text>
        {summary.failed.length > 0 && (
          <>
            <Text style={styles.doneSubtitle}>
              {summary.failed.length} could not be added
            </Text>
            <View style={styles.failedBox}>
              {summary.failed.map((f, i) => (
                <Text key={i} style={styles.failedText}>
                  <Text style={{ fontWeight: '700' }}>{f.name}</Text> —{' '}
                  {f.reason}
                </Text>
              ))}
            </View>
          </>
        )}
        <TouchableOpacity
          style={styles.doneBtn}
          onPress={() => {
            refresh();
            navigation.goBack();
          }}
        >
          <Text style={styles.doneBtnText}>Done</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.banner}>
        <Text style={styles.bannerText}>
          {rows.length} product{rows.length === 1 ? '' : 's'} detected — review,
          edit price/stock, then add all
        </Text>
      </View>

      <FlatList
        data={rows}
        keyExtractor={r => r.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No products left to add.</Text>
        }
        renderItem={({ item: row }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.imageBox}>
                {row.imageUrl && !failedImages[row.id] ? (
                  <Image
                    source={{ uri: row.imageUrl }}
                    style={styles.imagePreview}
                    onError={() =>
                      setFailedImages(f => ({ ...f, [row.id]: true }))
                    }
                  />
                ) : (
                  <ImageIcon size={20} color="#D1D5DB" />
                )}
              </View>
              <Text style={styles.cardHeaderTitle} numberOfLines={1}>
                {row.title || 'Untitled product'}
              </Text>
              <TouchableOpacity
                onPress={() => removeRow(row.id)}
                style={styles.removeBtn}
              >
                <Trash2 size={16} color={CustomerColors.primary} />
              </TouchableOpacity>
            </View>
            <ProductFieldsForm
              form={row}
              set={(k, v) => setRow(row.id, k, v)}
              categories={categories}
            />
          </View>
        )}
      />

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.addAllBtn}
          onPress={handleAddAll}
          disabled={rows.length === 0 || step === 'saving'}
        >
          {step === 'saving' ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Plus size={16} color="#fff" />
              <Text style={styles.addAllBtnText}>
                Add All Products ({rows.length})
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: CustomerColors.bg },
  banner: {
    backgroundColor: CustomerColors.mint,
    borderWidth: 1,
    borderColor: CustomerColors.steelBorder,
    borderRadius: BorderRadius.md,
    margin: Spacing.md,
    padding: Spacing.md,
  },
  bannerText: {
    color: CustomerColors.teal700,
    fontSize: FontSizes.xs,
    fontWeight: '700',
  },
  list: { paddingHorizontal: Spacing.md, paddingBottom: Spacing.xxl },
  emptyText: {
    textAlign: 'center',
    color: CustomerColors.textSecondary,
    marginTop: Spacing.xxl,
  },
  card: {
    backgroundColor: CustomerColors.white,
    borderWidth: 1,
    borderColor: CustomerColors.steelBorder,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  imageBox: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: CustomerColors.steelBorder,
    backgroundColor: CustomerColors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  imagePreview: { width: '100%', height: '100%' },
  cardHeaderTitle: {
    flex: 1,
    fontSize: FontSizes.sm,
    fontWeight: '800',
    color: CustomerColors.black,
  },
  removeBtn: { padding: Spacing.xs },
  footer: {
    padding: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: CustomerColors.steelBorder,
    backgroundColor: CustomerColors.white,
  },
  addAllBtn: {
    flexDirection: 'row',
    gap: Spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: CustomerColors.primary,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  addAllBtnText: { color: '#fff', fontWeight: '800', fontSize: FontSizes.base },
  doneContainer: {
    flex: 1,
    backgroundColor: CustomerColors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
    gap: Spacing.sm,
  },
  doneIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  doneTitle: {
    fontSize: FontSizes.base,
    fontWeight: '800',
    color: CustomerColors.black,
    textAlign: 'center',
  },
  doneSubtitle: {
    fontSize: FontSizes.sm,
    color: '#D97706',
    textAlign: 'center',
  },
  failedBox: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    width: '100%',
    gap: Spacing.xs,
  },
  failedText: { fontSize: FontSizes.xs, color: '#B45309' },
  doneBtn: {
    backgroundColor: CustomerColors.teal600,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.md,
    width: '100%',
    alignItems: 'center',
  },
  doneBtnText: { color: '#fff', fontWeight: '800', fontSize: FontSizes.base },
});
