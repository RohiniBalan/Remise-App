import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, FlatList } from 'react-native';
import { ChevronDown, X } from 'lucide-react-native';
import { CustomerColors, Spacing, FontSizes, BorderRadius } from '../../styles/theme';
import { AVAILABILITY_OPTIONS, ProductFormFields } from '../../utils/productForm';
import { mergeCategories } from '../../utils/storeCategories';

// Extracted from StoreProductFormScreen so both the single manual/scan form
// and each card in StoreBulkProductScanScreen render the identical field
// set (everything ProductModal on web has, minus the image picker, which
// stays screen-specific since single-form uses a gallery/camera picker and
// bulk cards just show/edit the AI-generated image URL).
export default function ProductFieldsForm({
  form, set, categories,
}: {
  form: ProductFormFields;
  set: (k: keyof ProductFormFields, v: string) => void;
  categories: any[];
}) {
  // Default (built-in) categories + whatever the store has added itself —
  // same merge used on the Categories tab and the Analytics filters, so the
  // picker here isn't limited to only the store's custom entries.
  const categoryOptions = useMemo(
    () => mergeCategories(categories || []).map(c => ({ key: c.name, label: c.name })),
    [categories],
  );

  return (
    <>
      <Field label="Product Title *" value={form.title} onChangeText={v => set('title', v)} placeholder="e.g. Organic Face Moisturizer" />
      <Text style={styles.label}>Description</Text>
      <TextInput style={[styles.input, { height: 80 }]} multiline value={form.description} onChangeText={v => set('description', v)} placeholder="Describe the product…" />
      <View style={styles.row2}>
        <Field label="Price (₹) *" value={form.price} onChangeText={v => set('price', v)} keyboardType="numeric" style={{ flex: 1 }} />
        <Field label="Discounted Price (₹)" value={form.discountedPrice} onChangeText={v => set('discountedPrice', v)} keyboardType="numeric" style={{ flex: 1 }} />
      </View>

      <SelectField
        label="Category"
        value={form.category}
        placeholder="Select Category"
        options={categoryOptions}
        onSelect={key => set('category', key)}
      />

      <Field label="Brand" value={form.brand} onChangeText={v => set('brand', v)} placeholder="e.g. Nivea" />
      <Field label="Stock Quantity" value={form.totalStock} onChangeText={v => set('totalStock', v)} keyboardType="numeric" />

      <Text style={styles.label}>Availability</Text>
      <View style={styles.chipRow}>
        {AVAILABILITY_OPTIONS.map(a => (
          <TouchableOpacity key={a} style={[styles.chip, form.availability === a && styles.chipActive]} onPress={() => set('availability', a)}>
            <Text style={[styles.chipText, form.availability === a && styles.chipTextActive]}>{a}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Field label="Tags (comma-separated)" value={form.tags} onChangeText={v => set('tags', v)} placeholder="e.g. skincare, organic" />
    </>
  );
}

function Field({ label, style, ...props }: { label: string; style?: any } & React.ComponentProps<typeof TextInput>) {
  return (
    <View style={[{ marginBottom: Spacing.md }, style]}>
      <Text style={styles.label}>{label}</Text>
      <TextInput style={styles.input} {...props} />
    </View>
  );
}

// Modal-based dropdown since RN has no native <select>. Same pattern used
// on the Store Settings screen (State/City) and the Analytics filters.
function SelectField({
  label, value, placeholder, options, disabled, onSelect,
}: {
  label: string;
  value: string;
  placeholder: string;
  options: { key: string; label: string }[];
  disabled?: boolean;
  onSelect: (key: string, label: string) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <View style={{ marginBottom: Spacing.md }}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        style={[styles.input, styles.selectInput, disabled && styles.selectDisabled]}
        onPress={() => !disabled && setOpen(true)}
        disabled={disabled}
      >
        <Text style={value ? styles.selectValue : styles.selectPlaceholder} numberOfLines={1}>
          {value || placeholder}
        </Text>
        <ChevronDown size={16} color={CustomerColors.textSecondary} />
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setOpen(false)}>
          <View style={styles.modalSheet} onStartShouldSetResponder={() => true}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{label}</Text>
              <TouchableOpacity onPress={() => setOpen(false)}>
                <X size={20} color={CustomerColors.textSecondary} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={options}
              keyExtractor={item => item.key}
              style={{ maxHeight: 400 }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => { onSelect(item.key, item.label); setOpen(false); }}
                >
                  <Text style={[styles.modalItemText, item.label === value && styles.modalItemTextActive]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={<Text style={styles.modalEmpty}>No options found</Text>}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: FontSizes.xs, fontWeight: '700', color: CustomerColors.textSecondary, textTransform: 'uppercase', marginBottom: Spacing.xs },
  input: { backgroundColor: CustomerColors.white, borderWidth: 1, borderColor: CustomerColors.steelBorder, borderRadius: BorderRadius.md, paddingHorizontal: Spacing.md, paddingVertical: Spacing.md, fontSize: FontSizes.sm },
  row2: { flexDirection: 'row', gap: Spacing.sm },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs, marginBottom: Spacing.md },
  chip: { paddingHorizontal: Spacing.md, paddingVertical: 6, borderRadius: BorderRadius.pill, borderWidth: 1, borderColor: CustomerColors.steelBorder },
  chipActive: { backgroundColor: CustomerColors.teal600, borderColor: CustomerColors.teal600 },
  chipText: { fontSize: FontSizes.xs, color: CustomerColors.textSecondary, fontWeight: '600' },
  chipTextActive: { color: '#fff' },

  // ── Category dropdown ──
  selectInput: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  selectDisabled: { opacity: 0.5 },
  selectValue: { fontSize: FontSizes.sm, color: CustomerColors.black, flex: 1 },
  selectPlaceholder: { fontSize: FontSizes.sm, color: '#9CA3AF', flex: 1 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: '#fff', borderTopLeftRadius: BorderRadius.lg, borderTopRightRadius: BorderRadius.lg, maxHeight: '70%', paddingBottom: Spacing.lg },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  modalTitle: { fontSize: FontSizes.base, fontWeight: '800', color: CustomerColors.black },
  modalItem: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  modalItemText: { fontSize: FontSizes.sm, color: CustomerColors.black },
  modalItemTextActive: { color: CustomerColors.teal700, fontWeight: '700' },
  modalEmpty: { textAlign: 'center', color: '#9CA3AF', fontSize: FontSizes.sm, paddingVertical: Spacing.lg },
});