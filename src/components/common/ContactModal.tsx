import React, { useEffect, useState } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Mail, Phone, MapPin, X, CheckCircle, AlertCircle } from 'lucide-react-native';
import { contactApi } from '../../api/contentApi';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
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
  phone: '+91 90470 099277',
  address: 'Coimbatore, Tamil Nadu, India',
  hoursWeekday: '9:00 AM - 8:00 PM',
  hoursSaturday: '10:00 AM - 6:00 PM',
  hoursSunday: 'Closed',
};

export default function ContactModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const navigation = useNavigation<any>();
  const { token } = useAuth();
  const { isDark } = useTheme();
  const [data, setData] = useState<ContactData>(OFFICIAL_CONTACT_INFO);
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [errors, setErrors] = useState<{ name?: string; email?: string; phone?: string; message?: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (!visible) {
      setNotification(null);
      setErrors({});
    }
  }, [visible]);

  const handleSubmit = async () => {
    // 1. Check whether user is logged in
    if (!token) {
      setNotification({ type: 'error', message: 'Please log in to send a contact message.' });
      setTimeout(() => {
        onClose();
        navigation.navigate('LoginRegister');
      }, 1500);
      return;
    }

    // 2. Validate all fields
    const newErrors: { name?: string; email?: string; phone?: string; message?: string } = {};

    if (!form.name.trim()) {
      newErrors.name = 'Please enter your full name.';
    } else if (form.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!form.email.trim()) {
      newErrors.email = 'Please enter your email address.';
    } else if (!emailRegex.test(form.email.trim())) {
      newErrors.email = 'Please enter a valid email address.';
    }

    const phoneClean = form.phone.replace(/\D/g, '');
    if (!form.phone.trim()) {
      newErrors.phone = 'Please enter your phone number.';
    } else if (phoneClean.length < 10 || phoneClean.length > 15) {
      newErrors.phone = 'Please enter a valid phone number (at least 10 digits).';
    }

    if (!form.message.trim()) {
      newErrors.message = 'Please enter your message.';
    } else if (form.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setNotification({ type: 'error', message: 'Please fill in all required fields correctly.' });
      return;
    }

    setErrors({});
    setSubmitting(true);
    setNotification(null);

    try {
      const res = await contactApi.sendMessage({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        message: form.message.trim(),
      });
      if (res.data?.success) {
        setNotification({ type: 'success', message: 'Message sent successfully!' });
        setForm({ name: '', email: '', phone: '', message: '' });
        setTimeout(() => {
          onClose();
          setNotification(null);
        }, 2000);
      } else {
        setNotification({ type: 'error', message: res.data?.message || 'Failed to send message.' });
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
            <View style={[
              styles.notification,
              isDark ? styles.notificationDark : styles.notificationLight,
              notification.type === 'error' && (isDark ? styles.notificationErrorDark : styles.notificationErrorLight)
            ]}>
              {notification.type === 'success' ? (
                <CheckCircle size={16} color={isDark ? '#059669' : '#34D399'} />
              ) : (
                <AlertCircle size={16} color={isDark ? '#DC2626' : '#F87171'} />
              )}
              <Text style={[
                styles.notificationText,
                isDark ? { color: '#0F172A' } : { color: '#FFFFFF' }
              ]}>{notification.message}</Text>
            </View>
          ) : null}

          <View style={styles.infoRow}>
            <Mail size={14} color={CustomerColors.primary} />
            <Text style={styles.infoText}>{data.email}</Text>
          </View>
          <TouchableOpacity style={styles.infoRow} onPress={() => Linking.openURL(`tel:${data.phone}`)}>
            <Phone size={14} color={CustomerColors.primary} />
            <Text style={styles.infoText}>{data.phone}</Text>
          </TouchableOpacity>
          <View style={styles.infoRow}>
            <MapPin size={14} color={CustomerColors.primary} />
            <Text style={styles.infoText}>{data.address}</Text>
          </View>

          <View>
            <TextInput
              style={[styles.input, errors.name && styles.inputError]}
              placeholder="Your Name"
              placeholderTextColor="#9CA3AF"
              value={form.name}
              onChangeText={v => {
                setForm(f => ({ ...f, name: v }));
                if (errors.name) setErrors(e => ({ ...e, name: undefined }));
              }}
            />
            {errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}
          </View>

          <View>
            <TextInput
              style={[styles.input, errors.email && styles.inputError]}
              placeholder="Email"
              placeholderTextColor="#9CA3AF"
              keyboardType="email-address"
              autoCapitalize="none"
              value={form.email}
              onChangeText={v => {
                setForm(f => ({ ...f, email: v }));
                if (errors.email) setErrors(e => ({ ...e, email: undefined }));
              }}
            />
            {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
          </View>

          <View>
            <TextInput
              style={[styles.input, errors.phone && styles.inputError]}
              placeholder="Phone"
              placeholderTextColor="#9CA3AF"
              keyboardType="phone-pad"
              value={form.phone}
              onChangeText={v => {
                setForm(f => ({ ...f, phone: v }));
                if (errors.phone) setErrors(e => ({ ...e, phone: undefined }));
              }}
            />
            {errors.phone ? <Text style={styles.errorText}>{errors.phone}</Text> : null}
          </View>

          <View>
            <TextInput
              style={[styles.input, { height: 80, textAlignVertical: 'top' }, errors.message && styles.inputError]}
              placeholder="Message"
              placeholderTextColor="#9CA3AF"
              multiline
              value={form.message}
              onChangeText={v => {
                setForm(f => ({ ...f, message: v }));
                if (errors.message) setErrors(e => ({ ...e, message: undefined }));
              }}
            />
            {errors.message ? <Text style={styles.errorText}>{errors.message}</Text> : null}
          </View>

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
  notification: {
    flexDirection: 'row',
    gap: Spacing.sm,
    alignItems: 'center',
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  notificationDark: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
  },
  notificationLight: {
    backgroundColor: '#0F172A',
    borderColor: '#334155',
  },
  notificationErrorDark: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FECACA',
  },
  notificationErrorLight: {
    backgroundColor: '#0F172A',
    borderColor: '#7F1D1D',
  },
  notificationText: {
    flex: 1,
    fontSize: FontSizes.xs,
    fontWeight: '700',
  },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  infoText: { fontSize: FontSizes.xs, color: '#4B5563', flex: 1, flexWrap: 'wrap' },
  input: { backgroundColor: '#F9F9F9', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: BorderRadius.md, paddingHorizontal: Spacing.md, paddingVertical: Spacing.md, fontSize: FontSizes.sm, color: '#111827', marginTop: Spacing.xs },
  inputError: { borderColor: CustomerColors.danger },
  errorText: { fontSize: 10, color: CustomerColors.danger, fontWeight: '600', marginTop: 2, marginLeft: 2 },
  submitBtn: { backgroundColor: CustomerColors.primary, paddingVertical: Spacing.md, borderRadius: BorderRadius.md, alignItems: 'center', marginTop: Spacing.md },
  submitBtnText: { color: '#fff', fontWeight: '800', fontSize: FontSizes.sm },
});
