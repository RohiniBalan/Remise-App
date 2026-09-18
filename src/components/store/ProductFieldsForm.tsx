import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, FlatList } from 'react-native';
import { ChevronDown, X } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { CustomerColors, Spacing, FontSizes, BorderRadius } from '../../styles/theme';
import { AVAILABILITY_OPTIONS, STOCK_UNIT_OPTIONS, ProductFormFields } from '../../utils/productForm';
import { mergeCategories } from '../../utils/storeCategories';
import { getSubcategories } from '../../utils/categoryAttributes';

export default function ProductFieldsForm({
  form, set, categories,
}: {
  form: ProductFormFields;
  set: (k: keyof ProductFormFields, v: string) => void;
  categories: any[];
}) {
  const { isDark } = useTheme();
  const styles = useMemo(() => getStyles(isDark), [isDark]);

  const categoryOptions = useMemo(
    () => mergeCategories(categories || []).map(c => ({ key: c.name, label: c.name })),
    [categories],
  );

  const subcategoryOptions = useMemo(
    () => getSubcategories(form.category).map(s => ({ key: s, label: s })),
    [form.category],
  );

  return (
    <>
      <Field label="Product Title *" value={form.title} onChangeText={v => set('title', v)} placeholder="e.g. Organic Face Moisturizer" isDark={isDark} styles={styles} />
      <Text style={styles.label}>Description</Text>
      <TextInput
        style={[styles.input, { height: 80 }]}
        multiline
        value={form.description}
        onChangeText={v => set('description', v)}
        placeholder="Describe the product…"
        placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
      />
      <View style={styles.row2}>
        <Field label="Price (₹) *" value={form.price} onChangeText={v => set('price', v)} keyboardType="numeric" style={{ flex: 1 }} isDark={isDark} styles={styles} />
        <Field label="Discounted Price (₹)" value={form.discountedPrice} onChangeText={v => set('discountedPrice', v)} keyboardType="numeric" style={{ flex: 1 }} isDark={isDark} styles={styles} />
      </View>

      <SelectField
        label="Category"
        value={form.category}
        placeholder="Select Category"
        options={categoryOptions}
        onSelect={key => {
          set('category', key);
          set('subcategory', '');
        }}
        isDark={isDark}
        styles={styles}
      />

      <SelectField
        label="Subcategory"
        value={form.subcategory || ''}
        placeholder={form.category ? 'Select Subcategory' : 'Select a Category first'}
        options={subcategoryOptions}
        disabled={!form.category || subcategoryOptions.length === 0}
        onSelect={key => set('subcategory', key)}
        isDark={isDark}
        styles={styles}
      />

      <Field label="Brand" value={form.brand} onChangeText={v => set('brand', v)} placeholder="e.g. Nivea" isDark={isDark} styles={styles} />
      
      <View style={styles.row2}>
        <Field label="Stock Quantity *" value={form.totalStock} onChangeText={v => set('totalStock', v)} keyboardType="numeric" style={{ flex: 1.2 }} isDark={isDark} styles={styles} />
        <SelectField
          label="Stock Unit"
          value={form.stockUnit || form.unit || 'Count'}
          placeholder="Unit"
          options={STOCK_UNIT_OPTIONS.map(u => ({ key: u, label: u }))}
          onSelect={key => {
            set('stockUnit', key);
            set('unit', key);
          }}
          style={{ flex: 1 }}
          isDark={isDark}
          styles={styles}
        />
      </View>

      <Text style={styles.label}>Availability</Text>
      <View style={styles.chipRow}>
        {AVAILABILITY_OPTIONS.map(a => (
          <TouchableOpacity key={a} style={[styles.chip, form.availability === a && styles.chipActive]} onPress={() => set('availability', a)}>
            <Text style={[styles.chipText, form.availability === a && styles.chipTextActive]}>{a}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Field label="Tags (comma-separated)" value={form.tags} onChangeText={v => set('tags', v)} placeholder="e.g. skincare, organic" isDark={isDark} styles={styles} />
    </>
  );
}

function Field({ label, style, isDark, styles, ...props }: { label: string; style?: any; isDark: boolean; styles: any } & React.ComponentProps<typeof TextInput>) {
  return (
    <View style={[{ marginBottom: Spacing.md }, style]}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
        {...props}
      />
    </View>
  );
}

function SelectField({
  label, value, placeholder, options, disabled, onSelect, isDark, styles, style,
}: {
  label: string;
  value: string;
  placeholder: string;
  options: { key: string; label: string }[];
  disabled?: boolean;
  onSelect: (key: string, label: string) => void;
  isDark: boolean;
  styles: any;
  style?: any;
}) {
  const [open, setOpen] = useState(false);
  return (
    <View style={[{ marginBottom: Spacing.md }, style]}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        style={[styles.input, styles.selectInput, disabled && styles.selectDisabled]}
        onPress={() => !disabled && setOpen(true)}
        disabled={disabled}
      >
        <Text style={value ? styles.selectValue : styles.selectPlaceholder} numberOfLines={1}>
          {value || placeholder}
        </Text>
        <ChevronDown size={16} color={isDark ? '#9CA3AF' : CustomerColors.textSecondary} />
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setOpen(false)}>
          <View style={styles.modalSheet} onStartShouldSetResponder={() => true}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{label}</Text>
              <TouchableOpacity onPress={() => setOpen(false)}>
                <X size={20} color={isDark ? '#9CA3AF' : CustomerColors.textSecondary} />
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

const getStyles = (isDark: boolean) => StyleSheet.create({
  label: { fontSize: FontSizes.xs, fontWeight: '700', color: isDark ? '#9CA3AF' : CustomerColors.textSecondary, textTransform: 'uppercase', marginBottom: Spacing.xs },
  input: {
    backgroundColor: isDark ? '#1F2937' : CustomerColors.white,
    borderWidth: 1,
    borderColor: isDark ? '#374151' : CustomerColors.steelBorder,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: FontSizes.sm,
    color: isDark ? '#F9FAFB' : CustomerColors.black,
  },
  row2: { flexDirection: 'row', gap: Spacing.sm },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs, marginBottom: Spacing.md },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.pill,
    borderWidth: 1,
    borderColor: isDark ? '#374151' : CustomerColors.steelBorder,
    backgroundColor: isDark ? '#1F2937' : CustomerColors.bg,
  },
  chipActive: { backgroundColor: isDark ? '#0f766e' : CustomerColors.teal600, borderColor: isDark ? '#0f766e' : CustomerColors.teal600 },
  chipText: { fontSize: FontSizes.xs, color: isDark ? '#9CA3AF' : CustomerColors.textSecondary, fontWeight: '600' },
  chipTextActive: { color: '#fff' },

  // ── Category dropdown ──
  selectInput: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  selectDisabled: { opacity: 0.5 },
  selectValue: { fontSize: FontSizes.sm, color: isDark ? '#F9FAFB' : CustomerColors.black, flex: 1 },
  selectPlaceholder: { fontSize: FontSizes.sm, color: isDark ? '#6B7280' : '#9CA3AF', flex: 1 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: isDark ? '#111827' : '#fff', borderTopLeftRadius: BorderRadius.lg, borderTopRightRadius: BorderRadius.lg, maxHeight: '70%', paddingBottom: Spacing.lg },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: isDark ? '#1F2937' : '#F5F5F5' },
  modalTitle: { fontSize: FontSizes.base, fontWeight: '800', color: isDark ? '#F9FAFB' : CustomerColors.black },
  modalItem: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: isDark ? '#1F2937' : '#F5F5F5' },
  modalItemText: { fontSize: FontSizes.sm, color: isDark ? '#E5E7EB' : CustomerColors.black },
  modalItemTextActive: { color: isDark ? '#2DD4BF' : CustomerColors.teal700, fontWeight: '700' },
  modalEmpty: { textAlign: 'center', color: isDark ? '#6B7280' : '#9CA3AF', fontSize: FontSizes.sm, paddingVertical: Spacing.lg },
});