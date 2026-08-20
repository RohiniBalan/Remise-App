import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TextInput, Image, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { Search, Plus, Edit2, Trash2, Package } from 'lucide-react-native';
import { adminProductApi, adminCategoryApi } from '../../api/adminApi';
import { AdminColors, Spacing, FontSizes, BorderRadius } from '../../styles/theme';
import PaginationControl from '../../components/common/PaginationControl';

export default function AdminProductScreen() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [editing, setEditing] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const ITEMS_PER_PAGE = 30;

  const load = () => {
    Promise.all([adminProductApi.getAll(), adminCategoryApi.getAll()])
      .then(([prodRes, catRes]) => {
        const prodData = prodRes.data;
        setProducts(Array.isArray(prodData) ? prodData : prodData.products || prodData.data || []);
        setCategories(catRes.data.data || catRes.data || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return products;
    return products.filter((p: any) => p.title?.toLowerCase().includes(q) || p.brand?.toLowerCase().includes(q));
  }, [products, search]);

  const paginated = useMemo(
    () => filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE),
    [filtered, currentPage]
  );

  const handleDelete = (id: string) => {
    Alert.alert('Delete this product?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        setDeleting(id);
        try { await adminProductApi.delete(id); load(); } catch { Alert.alert('Error', 'Failed to delete product.'); } finally { setDeleting(null); }
      } },
    ]);
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={AdminColors.primary} /></View>;

  if (showForm) {
    return (
      <AdminProductForm
        product={editing}
        categories={categories}
        onDone={() => { setShowForm(false); setEditing(null); load(); }}
        onCancel={() => { setShowForm(false); setEditing(null); }}
      />
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.toolbar}>
        <View style={styles.searchBox}>
          <Search size={14} color={AdminColors.textSecondary} />
          <TextInput style={styles.searchInput} value={search} onChangeText={setSearch} placeholder="Search products…" />
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowForm(true)}><Plus size={16} color="#fff" /></TouchableOpacity>
      </View>

      <FlatList
        data={paginated}
        keyExtractor={(p: any, i) => p._id || p.id || String(i)}
        numColumns={2}
        columnWrapperStyle={{ gap: Spacing.sm }}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<View style={styles.empty}><Package size={40} color="#E5E7EB" /><Text style={styles.emptyText}>No products found</Text></View>}
        ListFooterComponent={
          <PaginationControl
            currentPage={currentPage}
            totalItems={filtered.length}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={setCurrentPage}
          />
        }
        renderItem={({ item: p }) => (
          <View style={styles.card}>
            <Image source={{ uri: p.images?.[0] }} style={styles.image} />
            <View style={styles.cardBody}>
              <Text style={styles.title} numberOfLines={1}>{p.title}</Text>
              <Text style={styles.price}>₹{p.price}</Text>
              <View style={styles.actionsRow}>
                <TouchableOpacity style={styles.actionBtn} onPress={() => { setEditing(p); setShowForm(true); }}><Edit2 size={13} color={AdminColors.primary} /></TouchableOpacity>
                <TouchableOpacity style={styles.actionBtn} onPress={() => handleDelete(p._id)} disabled={deleting === p._id}><Trash2 size={13} color="#DC2626" /></TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      />
    </View>
  );
}


function AdminProductForm({ product, categories, onDone, onCancel }: { product: any; categories: any[]; onDone: () => void; onCancel: () => void }) {
  const isEdit = Boolean(product);
  const [form, setForm] = useState({
    title: product?.title || '', brand: product?.brand || '', price: String(product?.price ?? ''),
    originalPrice: String(product?.originalPrice ?? ''), badge: product?.badge || '', type: product?.type || '',
    category: product?.category || '', images: (product?.images || []).join('\n'), description: product?.description || '',
    aboutFeatures: (product?.aboutFeatures || []).join('\n'), aboutDescription: product?.aboutDescription || '',
    specifications: (product?.specifications || []).map((s: any) => `${s.label}: ${s.value}`).join('\n'),
    idealFor: (product?.idealFor || []).join('\n'), totalStock: String(product?.totalStock ?? ''), deliveryTime: product?.deliveryTime || '',
  });
  const set = (k: keyof typeof form, v: string) => setForm(f => ({ ...f, [k]: v }));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.price.trim()) { setError('Title and price are required.'); return; }
    setSaving(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('title', form.title);
      fd.append('brand', form.brand);
      fd.append('price', form.price);
      fd.append('originalPrice', form.originalPrice);
      fd.append('badge', form.badge);
      fd.append('type', form.type);
      fd.append('category', form.category);
      fd.append('description', form.description);
      fd.append('aboutDescription', form.aboutDescription);
      fd.append('totalStock', form.totalStock);
      fd.append('deliveryTime', form.deliveryTime);
      const images = form.images.split('\n').map((s: string) => s.trim()).filter(Boolean);
      fd.append('images', JSON.stringify(images));
      const aboutFeatures = form.aboutFeatures.split('\n').map((s: string) => s.trim()).filter(Boolean);
      fd.append('aboutFeatures', JSON.stringify(aboutFeatures));
      const idealFor = form.idealFor.split('\n').map((s: string) => s.trim()).filter(Boolean);
      fd.append('idealFor', JSON.stringify(idealFor));
      const specifications = form.specifications.split('\n').map((s: string) => s.trim()).filter(Boolean).map((line: string) => {
        const [label, ...rest] = line.split(':');
        return { label: label?.trim(), value: rest.join(':').trim() };
      });
      fd.append('specifications', JSON.stringify(specifications));

      if (isEdit) await adminProductApi.update(product._id, fd);
      else await adminProductApi.create(fd);
      onDone();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save product.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: Spacing.lg, paddingBottom: Spacing.xxl }}>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      <Field label="Title *" value={form.title} onChangeText={v => set('title', v)} />
      <Field label="Brand" value={form.brand} onChangeText={v => set('brand', v)} />
      <View style={styles.row2}>
        <Field label="Price *" value={form.price} onChangeText={v => set('price', v)} keyboardType="numeric" style={{ flex: 1 }} />
        <Field label="Original Price" value={form.originalPrice} onChangeText={v => set('originalPrice', v)} keyboardType="numeric" style={{ flex: 1 }} />
      </View>
      <View style={styles.row2}>
        <Field label="Badge" value={form.badge} onChangeText={v => set('badge', v)} style={{ flex: 1 }} />
        <Field label="Type" value={form.type} onChangeText={v => set('type', v)} style={{ flex: 1 }} />
      </View>
      <Text style={styles.label}>Category</Text>
      <View style={styles.chipRow}>
        {categories.map((c: any) => (
          <TouchableOpacity key={c._id} style={[styles.chip, form.category === c.name && styles.chipActive]} onPress={() => set('category', c.name)}>
            <Text style={[styles.chipText, form.category === c.name && styles.chipTextActive]}>{c.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.label}>Images (one URL per line)</Text>
      <TextInput style={[styles.input, { height: 70 }]} multiline value={form.images} onChangeText={v => set('images', v)} />
      <Text style={styles.label}>Description</Text>
      <TextInput style={[styles.input, { height: 70 }]} multiline value={form.description} onChangeText={v => set('description', v)} />
      <Text style={styles.label}>About Features (one per line)</Text>
      <TextInput style={[styles.input, { height: 60 }]} multiline value={form.aboutFeatures} onChangeText={v => set('aboutFeatures', v)} />
      <Text style={styles.label}>About Description</Text>
      <TextInput style={[styles.input, { height: 60 }]} multiline value={form.aboutDescription} onChangeText={v => set('aboutDescription', v)} />
      <Text style={styles.label}>Specifications (Label: Value, one per line)</Text>
      <TextInput style={[styles.input, { height: 60 }]} multiline value={form.specifications} onChangeText={v => set('specifications', v)} />
      <Text style={styles.label}>Ideal For (one per line)</Text>
      <TextInput style={[styles.input, { height: 60 }]} multiline value={form.idealFor} onChangeText={v => set('idealFor', v)} />
      <View style={styles.row2}>
        <Field label="Total Stock" value={form.totalStock} onChangeText={v => set('totalStock', v)} keyboardType="numeric" style={{ flex: 1 }} />
        <Field label="Delivery Time" value={form.deliveryTime} onChangeText={v => set('deliveryTime', v)} style={{ flex: 1 }} />
      </View>

      <View style={styles.formButtonRow}>
        <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}><Text style={styles.cancelBtnText}>Cancel</Text></TouchableOpacity>
        <TouchableOpacity style={[styles.submitBtn, { flex: 1 }]} onPress={handleSubmit} disabled={saving}>
          {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>{isEdit ? 'Save Changes' : 'Add Product'}</Text>}
        </TouchableOpacity>
      </View>
    </ScrollView>
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
  container: { flex: 1, backgroundColor: AdminColors.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: AdminColors.bg },
  toolbar: { flexDirection: 'row', gap: Spacing.sm, padding: Spacing.md },
  searchBox: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, backgroundColor: '#fff', borderWidth: 1, borderColor: AdminColors.border, borderRadius: BorderRadius.md, paddingHorizontal: Spacing.md },
  searchInput: { flex: 1, paddingVertical: Spacing.sm, fontSize: FontSizes.sm },
  addBtn: { width: 40, height: 40, borderRadius: BorderRadius.md, backgroundColor: AdminColors.primary, alignItems: 'center', justifyContent: 'center' },
  list: { paddingHorizontal: Spacing.md, paddingBottom: Spacing.xxl },
  empty: { flex: 1, alignItems: 'center', paddingVertical: Spacing.xxl, gap: Spacing.sm },
  emptyText: { color: '#6B7280', fontSize: FontSizes.sm },
  card: { flex: 1, backgroundColor: '#fff', borderRadius: BorderRadius.md, borderWidth: 1, borderColor: AdminColors.border, overflow: 'hidden', marginBottom: Spacing.sm },
  image: { width: '100%', aspectRatio: 1, backgroundColor: '#F3F4F6' },
  cardBody: { padding: Spacing.sm },
  title: { fontSize: FontSizes.sm, fontWeight: '700', color: AdminColors.textPrimary },
  price: { fontSize: FontSizes.sm, fontWeight: '800', color: AdminColors.primary, marginTop: 2 },
  actionsRow: { flexDirection: 'row', gap: Spacing.xs, marginTop: Spacing.sm },
  actionBtn: { flex: 1, alignItems: 'center', paddingVertical: 6, backgroundColor: AdminColors.bg, borderRadius: BorderRadius.sm },
  errorText: { color: '#DC2626', backgroundColor: '#FEF2F2', padding: Spacing.md, borderRadius: BorderRadius.md, marginBottom: Spacing.md, fontSize: FontSizes.sm },
  label: { fontSize: FontSizes.xs, fontWeight: '700', color: AdminColors.textSecondary, textTransform: 'uppercase', marginBottom: Spacing.xs },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: AdminColors.border, borderRadius: BorderRadius.md, paddingHorizontal: Spacing.md, paddingVertical: Spacing.md, fontSize: FontSizes.sm, marginBottom: Spacing.md },
  row2: { flexDirection: 'row', gap: Spacing.sm },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs, marginBottom: Spacing.md },
  chip: { paddingHorizontal: Spacing.md, paddingVertical: 6, borderRadius: BorderRadius.pill, borderWidth: 1, borderColor: AdminColors.border },
  chipActive: { backgroundColor: AdminColors.primary, borderColor: AdminColors.primary },
  chipText: { fontSize: FontSizes.xs, color: AdminColors.textSecondary, fontWeight: '600' },
  chipTextActive: { color: '#fff' },
  formButtonRow: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.md },
  cancelBtn: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, borderRadius: BorderRadius.md, backgroundColor: AdminColors.bg, borderWidth: 1, borderColor: AdminColors.border },
  cancelBtnText: { color: '#374151', fontWeight: '700' },
  submitBtn: { alignItems: 'center', justifyContent: 'center', backgroundColor: AdminColors.primary, paddingVertical: Spacing.md, borderRadius: BorderRadius.md },
  submitBtnText: { color: '#fff', fontWeight: '800' },
});
