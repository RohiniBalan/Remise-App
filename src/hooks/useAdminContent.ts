import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';

// Shared "fetch whole content object/array -> edit -> save -> reset" chrome
// used by every admin marketing-content editor page (14 of them on web,
// each independently duplicating this exact state machine — see
// admin/{hero,characters,best-sellers,...}/page.tsx). Consolidated here
// once rather than copy-pasted 14x; each screen still supplies its own
// distinct fields/body, only the loading/saving/status plumbing is shared.
interface ContentApi<T> {
  get: () => Promise<{ data: { success: boolean; data: T } }>;
  save: (data: T) => Promise<{ data: { success: boolean; data: T; message?: string } }>;
  reset: () => Promise<{ data: { success: boolean; data: T } }>;
}

export function useAdminContent<T>(api: ContentApi<T>, defaultValue: T) {
  const [data, setData] = useState<T>(defaultValue);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | ''; message: string }>({ type: '', message: '' });

  const load = useCallback(() => {
    setLoading(true);
    api
      .get()
      .then(res => {
        if (res.data.success) setData(res.data.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const save = async () => {
    setSaving(true);
    setStatus({ type: '', message: '' });
    try {
      const res = await api.save(data);
      if (res.data.success) {
        setData(res.data.data ?? data);
        setStatus({ type: 'success', message: 'Saved successfully!' });
        setTimeout(() => setStatus({ type: '', message: '' }), 3000);
      } else {
        setStatus({ type: 'error', message: res.data.message || 'Failed to save.' });
      }
    } catch (err: any) {
      setStatus({ type: 'error', message: err.response?.data?.message || 'Failed to save.' });
    } finally {
      setSaving(false);
    }
  };

  const reset = () => {
    Alert.alert('Reset to defaults?', 'This will discard your current changes.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reset',
        style: 'destructive',
        onPress: async () => {
          setSaving(true);
          try {
            const res = await api.reset();
            if (res.data.success) setData(res.data.data);
          } catch {
            setStatus({ type: 'error', message: 'Failed to reset.' });
          } finally {
            setSaving(false);
          }
        },
      },
    ]);
  };

  return { data, setData, loading, saving, status, save, reset, reload: load };
}
