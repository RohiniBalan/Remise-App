import React, { useEffect, useState } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Linking } from 'react-native';
import { Mail, Phone, MapPin, X, CheckCircle, AlertCircle } from 'lucide-react-native';
import { contactApi } from '../../api/contentApi';
import { GoldColors, CustomerColors, Spacing, FontSizes, BorderRadius } from '../../styles/theme';

// Ported from client/app/services/ContactPage.tsx — same GET /contact
// (business info) + POST /contact/messages (the actual form submission)
// calls. Reachable from ServicesScreen (and About, matching web's usage).
interface ContactData {
  title: string;
  subtitle: string;
  email: string;
  phone: string;
  address: string;
  hoursWeekday: string;
  hoursSaturday: string;
  hoursSunday: string;
}

export const OFFICIAL_CONTACT_INFO: ContactData = {
  title: 'Get in Touch',
  subtitle: "We'd love to hear from you. Contact us for any queries.",
  email: 'porulontechnologies@gmail.com',
  phone: '+91 90470 99277',
  address: 'Coimbatore, Tamil Nadu, India',
  hoursWeekday: '9:00 AM - 8:00 PM',
  hoursSaturday: '10:00 AM - 6:00 PM',
  hoursSunday: 'Opened',
};

export default function ContactModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const [data, setData] = useState<ContactData>(OFFICIAL_CONTACT_INFO);
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (!visible) {
      setNotification(null);
    }
  }, [visible]);

  const handleSubmit = async () => {
    setSubmitting(true);
    setNotification(null);
    try {
      const res = await contactApi.sendMessage(form);
      if (res.data.success) {
        setNotification({ type: 'success', message: 'Message sent successfully!' });
        setForm({ name: '', email: '', phone: '', message: '' });
        setTimeout(() => {
          onClose();
          setNotification(null);
        }, 2000);
      } else {
        setNotification({ type: 'error', message: res.data.message || 'Failed to send message.' });
      }
    } catch (err: any) {
      setNotification({ type: 'error', message: err.response?.data?.message || 'Failed to connect to server.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>{data.title}</Text>
              <Text style={styles.subtitle}>{data.subtitle}</Text>
            </View>
            <TouchableOpacity onPress={onClose}><X size={22} color={CustomerColors.textSecondary} /></TouchableOpacity>
          </View>

          {notification ? (
            <View style={[styles.notification, notification.type === 'error' && styles.notificationError]}>
              {notification.type === 'success' ? <CheckCircle size={16} color={GoldColors.goldDark} /> : <AlertCircle size={16} color={CustomerColors.danger} />}
              <Text style={styles.notificationText}>{notification.message}</Text>
            </View>
          ) : null}

          <View style={styles.infoRow}><Mail size={14} color={CustomerColors.primary} /><Text style={styles.infoText}>{data.email}</Text></View>
          <TouchableOpacity style={styles.infoRow} onPress={() => Linking.openURL(`tel:${data.phone}`)}>
            <Phone size={14} color={CustomerColors.primary} /><Text style={styles.infoText}>{data.phone}</Text>
          </TouchableOpacity>
          <View style={styles.infoRow}><MapPin size={14} color={CustomerColors.primary} /><Text style={styles.infoText}>{data.address}</Text></View>

          <TextInput
            style={styles.input}
            placeholder="Your Name"
            placeholderTextColor="#9CA3AF"
            value={form.name}
            onChangeText={v => setForm(f => ({ ...f, name: v }))}
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#9CA3AF"
            keyboardType="email-address"
            autoCapitalize="none"
            value={form.email}
            onChangeText={v => setForm(f => ({ ...f, email: v }))}
          />
          <TextInput
            style={styles.input}
            placeholder="Phone"
            placeholderTextColor="#9CA3AF"
            keyboardType="phone-pad"
            value={form.phone}
            onChangeText={v => setForm(f => ({ ...f, phone: v }))}
          />
          <TextInput
            style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
            placeholder="Message"
            placeholderTextColor="#9CA3AF"
            multiline
            value={form.message}
            onChangeText={v => setForm(f => ({ ...f, message: v }))}
          />

          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={submitting}>
            {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>Send Message</Text>}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: Spacing.lg, gap: Spacing.sm },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing.xs },
  title: { fontSize: FontSizes.lg, fontWeight: '800', color: '#111827' },
  subtitle: { fontSize: FontSizes.xs, color: CustomerColors.textSecondary, marginTop: 2, maxWidth: 260 },
  notification: { flexDirection: 'row', gap: Spacing.sm, alignItems: 'center', backgroundColor: '#FEF9C3', padding: Spacing.sm, borderRadius: BorderRadius.md },
  notificationError: { backgroundColor: CustomerColors.dangerBg },
  notificationText: { flex: 1, fontSize: FontSizes.xs, fontWeight: '700', color: '#92400E' },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  infoText: { fontSize: FontSizes.xs, color: '#4B5563' },
  input: { backgroundColor: '#F9F9F9', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: BorderRadius.md, paddingHorizontal: Spacing.md, paddingVertical: Spacing.md, fontSize: FontSizes.sm, color: '#111827', marginTop: Spacing.xs },
  submitBtn: { backgroundColor: CustomerColors.primary, paddingVertical: Spacing.md, borderRadius: BorderRadius.md, alignItems: 'center', marginTop: Spacing.md },
  submitBtnText: { color: '#fff', fontWeight: '800', fontSize: FontSizes.sm },
});
