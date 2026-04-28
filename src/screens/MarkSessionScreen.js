import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radius, spacing, typography } from '../theme';
import {
  loadCourses,
  saveCourses,
  upsertCourse,
  addSession,
  makeSession,
} from '../storage';
import { todayISO, formatDate } from '../utils/attendance';

const STATUS_OPTIONS = [
  { key: 'attended', label: 'Attended', color: colors.success, bg: colors.successSoft, icon: '✓', desc: 'I was in class today.' },
  { key: 'missed', label: 'Missed', color: colors.danger, bg: colors.dangerSoft, icon: '✗', desc: 'I was absent. Counts toward the limit.' },
  { key: 'excused', label: 'Excused', color: colors.warning, bg: colors.warningSoft, icon: '!', desc: 'Absent but excused (medical, etc.).' },
];

export default function MarkSessionScreen({ route, navigation }) {
  const { courseId } = route.params;
  const [status, setStatus] = useState('attended');
  const [date, setDate] = useState(todayISO());
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const shiftDate = (days) => {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    setDate(d.toISOString());
  };

  const setToday = () => setDate(todayISO());

  const handleSave = async () => {
    setSaving(true);
    const all = await loadCourses();
    const course = all.find((c) => c.id === courseId);
    if (!course) {
      Alert.alert('Error', 'Course no longer exists.');
      setSaving(false);
      return;
    }
    const session = makeSession({ date, status, note });
    const updated = addSession(course, session);
    await saveCourses(upsertCourse(all, updated));
    setSaving(false);
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.screen} edges={['bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.label}>Date</Text>
          <View style={styles.dateRow}>
            <TouchableOpacity style={styles.dateBtn} onPress={() => shiftDate(-1)} activeOpacity={0.85}>
              <Text style={styles.dateBtnText}>−1 day</Text>
            </TouchableOpacity>
            <View style={styles.dateDisplay}>
              <Text style={styles.dateText}>{formatDate(date)}</Text>
            </View>
            <TouchableOpacity style={styles.dateBtn} onPress={() => shiftDate(1)} activeOpacity={0.85}>
              <Text style={styles.dateBtnText}>+1 day</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={setToday} style={{ marginTop: spacing.sm, alignSelf: 'flex-start' }}>
            <Text style={styles.linkText}>Set to today</Text>
          </TouchableOpacity>

          <Text style={[styles.label, { marginTop: spacing.xl }]}>Status</Text>
          <View style={styles.statusList}>
            {STATUS_OPTIONS.map((opt) => {
              const selected = status === opt.key;
              return (
                <TouchableOpacity
                  key={opt.key}
                  onPress={() => setStatus(opt.key)}
                  activeOpacity={0.85}
                  style={[
                    styles.statusOption,
                    {
                      borderColor: selected ? opt.color : colors.border,
                      backgroundColor: selected ? opt.bg : colors.surface,
                    },
                  ]}
                >
                  <View style={[styles.statusIcon, { backgroundColor: opt.bg }]}>
                    <Text style={[styles.statusIconText, { color: opt.color }]}>{opt.icon}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.statusLabel, { color: opt.color }]}>{opt.label}</Text>
                    <Text style={styles.statusDesc}>{opt.desc}</Text>
                  </View>
                  <View
                    style={[
                      styles.radio,
                      { borderColor: selected ? opt.color : colors.border },
                    ]}
                  >
                    {selected ? <View style={[styles.radioDot, { backgroundColor: opt.color }]} /> : null}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={[styles.label, { marginTop: spacing.xl }]}>Note (optional)</Text>
          <TextInput
            style={[styles.input, { minHeight: 80, textAlignVertical: 'top' }]}
            placeholder="Topic, exam, reason for absence…"
            value={note}
            onChangeText={setNote}
            multiline
            placeholderTextColor={colors.textMuted}
          />
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.saveBtn, saving && { opacity: 0.6 }]}
            onPress={handleSave}
            disabled={saving}
            activeOpacity={0.85}
          >
            <Text style={styles.saveBtnText}>{saving ? 'Saving…' : 'Save record'}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  label: { ...typography.subheading, color: colors.text, marginBottom: spacing.sm },
  input: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  dateBtn: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dateBtnText: { ...typography.body, color: colors.primary, fontWeight: '600' },
  dateDisplay: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginHorizontal: spacing.sm,
  },
  dateText: { ...typography.subheading, color: colors.text },
  linkText: { color: colors.primary, ...typography.small, fontWeight: '600' },
  statusList: { gap: spacing.sm },
  statusOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 2,
    marginBottom: spacing.sm,
  },
  statusIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  statusIconText: { fontSize: 18, fontWeight: '700' },
  statusLabel: { ...typography.subheading, fontWeight: '700' },
  statusDesc: { ...typography.small, color: colors.textMuted, marginTop: 2 },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioDot: { width: 10, height: 10, borderRadius: 5 },
  footer: {
    padding: spacing.lg,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  saveBtn: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md + 2,
    borderRadius: radius.lg,
    alignItems: 'center',
  },
  saveBtnText: { color: '#FFFFFF', ...typography.subheading, fontSize: 17 },
});
