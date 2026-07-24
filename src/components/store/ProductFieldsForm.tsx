import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { CustomerColors, Spacing, FontSizes, BorderRadius } from '../../styles/theme';
import { AVAILABILITY_OPTIONS, ProductFormFields } from '../../utils/productForm';

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
  return (
    <>
      <Field label="Product Title *" value={form.title} onChangeText={v => set('title', v)} placeholder="e.g. Organic Face Moisturizer" />
      <Text style={styles.label}>Description</Text>
      <TextInput style={[styles.input, { height: 80 }]} multiline value={form.description} onChangeText={v => set('description', v)} placeholder="Describe the product…" />
      <View style={styles.row2}>
        <Field label="Price (₹) *" value={form.price} onChangeText={v => set('price', v)} keyboardType="numeric" style={{ flex: 1 }} />
        <Field label="Discounted Price (₹)" value={form.discountedPrice} onChangeText={v => set('discountedPrice', v)} keyboardType="numeric" style={{ flex: 1 }} />
      </View>

      <Text style={styles.label}>Category</Text>
      <View style={styles.chipRow}>
        {categories.map((c: any) => (
          <TouchableOpacity key={c._id} style={[styles.chip, form.category === c.name && styles.chipActive]} onPress={() => set('category', c.name)}>
            <Text style={[styles.chipText, form.category === c.name && styles.chipTextActive]}>{c.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

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

const styles = StyleSheet.create({
  label: { fontSize: FontSizes.xs, fontWeight: '700', color: CustomerColors.textSecondary, textTransform: 'uppercase', marginBottom: Spacing.xs },
  input: { backgroundColor: CustomerColors.white, borderWidth: 1, borderColor: CustomerColors.steelBorder, borderRadius: BorderRadius.md, paddingHorizontal: Spacing.md, paddingVertical: Spacing.md, fontSize: FontSizes.sm },
  row2: { flexDirection: 'row', gap: Spacing.sm },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs, marginBottom: Spacing.md },
  chip: { paddingHorizontal: Spacing.md, paddingVertical: 6, borderRadius: BorderRadius.pill, borderWidth: 1, borderColor: CustomerColors.steelBorder },
  chipActive: { backgroundColor: CustomerColors.teal600, borderColor: CustomerColors.teal600 },
  chipText: { fontSize: FontSizes.xs, color: CustomerColors.textSecondary, fontWeight: '600' },
  chipTextActive: { color: '#fff' },
});
