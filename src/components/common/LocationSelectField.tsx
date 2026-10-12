import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList, StyleSheet } from 'react-native';
import { ChevronDown, X } from 'lucide-react-native';
import { CustomerColors, Spacing, FontSizes, BorderRadius } from '../../styles/theme';
import { useTheme } from '../../context/ThemeContext';

export function LocationSelectField({
  label, value, placeholder, options, disabled, onSelect, style, inputStyle,
}: {
  label: string;
  value: string;
  placeholder: string;
  options: { key: string; label: string }[];
  disabled?: boolean;
  onSelect: (key: string, label: string) => void;
  style?: any;
  inputStyle?: any;
}) {
  const [open, setOpen] = useState(false);
  const { isDark } = useTheme();

  const selectedOption = options.find(
    o => o.key === value || o.label === value || (o as any).canonicalName === value,
  );
  const displayLabel = selectedOption ? selectedOption.label : value;

  return (
    <View style={[{ marginBottom: Spacing.sm }, style]}>
      {label ? (
        <Text style={[styles.label, isDark && { color: '#9CA3AF' }]}>{label}</Text>
      ) : null}
      <TouchableOpacity
        style={[
          styles.input,
          styles.selectInput,
          {
            backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
            borderColor: isDark ? '#374151' : CustomerColors.steelBorder,
          },
          disabled && (isDark ? styles.selectDisabledDark : styles.selectDisabled),
          inputStyle,
        ]}
        onPress={() => !disabled && setOpen(true)}
        disabled={disabled}
      >
        <Text
          style={[
            styles.selectValue,
            { color: isDark ? '#F9FAFB' : CustomerColors.black },
            !displayLabel && styles.selectPlaceholder,
          ]}
          numberOfLines={1}
        >
          {displayLabel || placeholder}
        </Text>
        <ChevronDown size={16} color={isDark ? '#9CA3AF' : CustomerColors.textSecondary} />
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setOpen(false)}>
          <View
            style={[
              styles.modalSheet,
              isDark && {
                backgroundColor: '#111827',
                borderTopColor: '#1F2937',
                borderTopWidth: 1,
              },
            ]}
            onStartShouldSetResponder={() => true}
          >
            <View
              style={[
                styles.modalHeader,
                isDark && { borderBottomColor: '#1F2937' },
              ]}
            >
              <Text style={[styles.modalTitle, isDark && { color: '#F9FAFB' }]}>
                {label || 'Select'}
              </Text>
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
                  style={[
                    styles.modalItem,
                    isDark && { borderBottomColor: '#1F2937' },
                  ]}
                  onPress={() => { onSelect(item.key, item.label); setOpen(false); }}
                >
                  <Text
                    style={[
                      styles.modalItemText,
                      isDark && { color: '#F9FAFB' },
                      (item.key === value || item.label === value || (item as any).canonicalName === value) && styles.modalItemTextActive,
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <Text style={[styles.modalEmpty, isDark && { color: '#6B7280' }]}>
                  No options found
                </Text>
              }
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

import { getCanonicalCity } from '../../utils/indiaLocation';

// Common city / district pincode mapping for instant auto-fill & reliable offline lookup
const PINCODE_MAP: Record<string, string> = {
  anaimalai: '642104',
  chennai: '600001',
  coimbatore: '641001',
  madurai: '625001',
  tiruchirappalli: '620001',
  trichy: '620001',
  salem: '636001',
  tirunelveli: '627001',
  tiruppur: '641601',
  erode: '638001',
  vellore: '632001',
  thanjavur: '613001',
  dindigul: '624001',
  kanchipuram: '631501',
  karur: '639001',
  cuddalore: '607001',
  nagercoil: '629001',
  hosur: '635109',
  pollachi: '642001',
  ooty: '643001',
  udhagamandalam: '643001',
  kanyakumari: '629702',
  kumbakonam: '612001',
  namakkal: '637001',
  pudukkottai: '622001',
  sivakasi: '626123',
  theni: '625531',
  thoothukudi: '628001',
  tuticorin: '628001',
  tiruvannamalai: '606601',
  viluppuram: '605602',
  virudhunagar: '626001',
  ramanathapuram: '623501',
  nagapattinam: '611001',
  dharmapuri: '636701',
  krishnagiri: '635001',
  ariyalur: '621704',
  perambalur: '621212',
  nilgiris: '643001',
  ranipet: '632401',
  tenkasi: '627811',
  tirupathur: '635601',
  chengalpattu: '603001',
  kallakurichi: '606202',
  bengaluru: '560001',
  bangalore: '560001',
  mysuru: '570001',
  mysore: '570001',
  mangaluru: '575001',
  mangalore: '575001',
  hubballi: '580020',
  hubli: '580020',
  belagavi: '590001',
  belgaum: '590001',
  kalaburagi: '585101',
  davanagere: '577001',
  ballari: '583101',
  shivamogga: '577201',
  tumakuru: '572101',
  udupi: '576101',
  thiruvananthapuram: '695001',
  trivandrum: '695001',
  kochi: '682001',
  cochin: '682001',
  kozhikode: '673001',
  calicut: '673001',
  thrissur: '680001',
  kollam: '691001',
  kannur: '670001',
  alappuzha: '688001',
  alleppey: '688001',
  palakkad: '678001',
  kottayam: '686001',
  malappuram: '676505',
  pathanamthitta: '689645',
  kasaragod: '671121',
  hyderabad: '500001',
  secunderabad: '500003',
  visakhapatnam: '530001',
  vijayawada: '520001',
  guntur: '522002',
  nellore: '524001',
  kurnool: '518001',
  rajahmundry: '533101',
  tirupati: '517501',
  kakinada: '533001',
  warangal: '506002',
  nizamabad: '503001',
  mumbai: '400001',
  pune: '411001',
  nagpur: '440001',
  nashik: '422001',
  thane: '400601',
  aurangabad: '431001',
  delhi: '110001',
  newdelhi: '110001',
  noida: '201301',
  gurugram: '122001',
  gurgaon: '122001',
  kolkata: '700001',
  ahmedabad: '380001',
  surat: '395001',
  vadodara: '390001',
  jaipur: '302001',
  jodhpur: '342001',
  lucknow: '226001',
  kanpur: '208001',
  varanasi: '221001',
  agra: '282001',
  patna: '800001',
  bhopal: '462001',
  indore: '452001',
  chandigarh: '160001',
  bhubaneswar: '751001',
  guwahati: '781001',
  dehradun: '248001',
  ranchi: '834001',
  raipur: '492001',
  panaji: '403001',
};

// Small helper: normalizes a saved state name/code and looks it up in the
// country-state-city list, and does the pincode auto-fill lookup.
export const normalizeLoc = (s: string) => (s || '').toLowerCase().replace(/[^a-z0-9]/g, '');

export async function lookupPincode(cityName: string): Promise<string | null> {
  if (!cityName || !cityName.trim()) return null;
  const englishCity = getCanonicalCity(cityName.trim()) || cityName.trim();
  const clean = englishCity.toLowerCase().replace(/[^a-z0-9]/g, '');

  // 1. Instant local dictionary lookup
  if (PINCODE_MAP[clean]) {
    return PINCODE_MAP[clean];
  }

  // 2. Query India Postal Pincode API
  try {
    const res = await fetch(`https://api.postalpincode.in/postoffice/${encodeURIComponent(englishCity)}`);
    const data = await res.json();
    if (data[0]?.Status === 'Success' && data[0].PostOffice?.length > 0) {
      const pin = data[0].PostOffice[0].Pincode;
      if (pin) return String(pin).trim();
    }
  } catch {
    // best-effort — leave existing value on failure
  }
  return null;
}

const styles = StyleSheet.create({
  label: { fontSize: FontSizes.xs, fontWeight: '700', color: CustomerColors.textSecondary, textTransform: 'uppercase', marginBottom: Spacing.xs },
  input: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: CustomerColors.steelBorder, borderRadius: BorderRadius.md, paddingHorizontal: Spacing.md, paddingVertical: 10, fontSize: FontSizes.sm, color: CustomerColors.black },
  selectInput: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 48 },
  selectDisabled: { backgroundColor: '#F3F4F6', borderColor: CustomerColors.steelBorder, opacity: 0.6 },
  selectDisabledDark: { backgroundColor: '#111827', borderColor: '#374151', opacity: 0.6 },
  selectValue: { fontSize: FontSizes.sm, color: CustomerColors.black, flex: 1 },
  selectPlaceholder: { fontSize: FontSizes.sm, color: '#9CA3AF', flex: 1 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: '#fff', borderTopLeftRadius: BorderRadius.lg, borderTopRightRadius: BorderRadius.lg, maxHeight: '70%', paddingBottom: Spacing.lg },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  modalTitle: { fontSize: FontSizes.base, fontWeight: '800', color: CustomerColors.black },
  modalItem: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  modalItemText: { fontSize: FontSizes.sm, color: CustomerColors.black },
  modalItemTextActive: { color: CustomerColors.teal700, fontWeight: '700' },
  modalEmpty: { textAlign: 'center', color: '#9CA3AF', fontSize: FontSizes.sm, paddingVertical: Spacing.lg },
});