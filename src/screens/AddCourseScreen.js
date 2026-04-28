import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, courseColors, radius, spacing, typography } from '../theme';
import { loadCourses, saveCourses, makeCourse, upsertCourse } from '../storage';

export default function AddCourseScreen({ navigation }) {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [weeklyHours, setWeeklyHours] = useState('3');
  const [totalWeeks, setTotalWeeks] = useState('14');
  const [absenceLimitPercent, setAbsenceLimitPercent] = useState('30');
  const [color, setColor] = useState(courseColors[0]);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Missing name', 'Please enter the name of the course.');
      return;
    }
    const wh = Number(weeklyHours);
    const tw = Number(totalWeeks);
    const al = Number(absenceLimitPercent);
    if (!Number.isFinite(wh) || wh <= 0) {
      Alert.alert('Invalid value', 'Weekly hours must be a positive number.');
      return;
    }
    if (!Number.isFinite(tw) || tw <= 0) {
      Alert.alert('Invalid value', 'Total weeks must be a positive number.');
      return;
    }
    if (!Number.isFinite(al) || al < 0 || al > 100) {
      Alert.alert('Invalid value', 'Absence limit must be between 0 and 100.');
      return;
    }

    setSaving(true);
    const course = makeCourse({
      name,
      code,
      weeklyHours: wh,
      totalWeeks: tw,
      absenceLimitPercent: al,
      color,
    });
    const existing = await loadCourses();
    await saveCourses(upsertCourse(existing, course));
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
          <Text style={styles.label}>Course name</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Mobile Application Development"
            value={name}
            onChangeText={setName}
            placeholderTextColor={colors.textMuted}
            autoFocus
          />

          <Text style={styles.label}>Course code (optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. CSE371"
            value={code}
            onChangeText={setCode}
            placeholderTextColor={colors.textMuted}
            autoCapitalize="characters"
          />

          <View style={styles.row}>
            <View style={[styles.col, { marginRight: spacing.md }]}>
              <Text style={styles.label}>Weekly hours</Text>
              <TextInput
                style={styles.input}
                keyboardType="number-pad"
                value={weeklyHours}
                onChangeText={setWeeklyHours}
                placeholderTextColor={colors.textMuted}
              />
            </View>
            <View style={styles.col}>
              <Text style={styles.label}>Total weeks</Text>
              <TextInput
                style={styles.input}
                keyboardType="number-pad"
                value={totalWeeks}
                onChangeText={setTotalWeeks}
                placeholderTextColor={colors.textMuted}
              />
            </View>
          </View>

          <Text style={styles.label}>Absence limit (%)</Text>
          <TextInput
            style={styles.input}
            keyboardType="number-pad"
            value={absenceLimitPercent}
            onChangeText={setAbsenceLimitPercent}
            placeholderTextColor={colors.textMuted}
          />
          <Text style={styles.helper}>
            Most universities use 30%. Adjust if your syllabus differs.
          </Text>

          <Text style={[styles.label, { marginTop: spacing.lg }]}>Color tag</Text>
          <View style={styles.colorRow}>
            {courseColors.map((c) => (
              <TouchableOpacity
                key={c}
                onPress={() => setColor(c)}
                style={[
                  styles.colorDot,
                  { backgroundColor: c, borderWidth: color === c ? 3 : 0 },
                ]}
                activeOpacity={0.85}
              />
            ))}
          </View>

          <View style={styles.preview}>
            <View style={[styles.previewBar, { backgroundColor: color }]} />
            <View style={{ flex: 1 }}>
              <Text style={styles.previewLabel}>Preview</Text>
              <Text style={styles.previewName}>{name || 'Course name'}</Text>
              <Text style={styles.previewMeta}>
                {(Number(weeklyHours) || 0) * (Number(totalWeeks) || 0)} sessions • limit{' '}
                {Math.floor(((Number(weeklyHours) || 0) * (Number(totalWeeks) || 0) * (Number(absenceLimitPercent) || 0)) / 100)}{' '}
                absences
              </Text>
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.saveBtn, saving && { opacity: 0.6 }]}
            onPress={handleSave}
            disabled={saving}
            activeOpacity={0.85}
          >
            <Text style={styles.saveBtnText}>{saving ? 'Saving…' : 'Save course'}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  label: { ...typography.subheading, color: colors.text, marginBottom: spacing.sm, marginTop: spacing.md },
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
  helper: { ...typography.small, color: colors.textMuted, marginTop: spacing.xs },
  row: { flexDirection: 'row' },
  col: { flex: 1 },
  colorRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.sm },
  colorDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
    borderColor: '#FFFFFF',
  },
  preview: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    overflow: 'hidden',
    marginTop: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  previewBar: { width: 6 },
  previewLabel: {
    ...typography.tiny,
    color: colors.textMuted,
    letterSpacing: 1,
    paddingTop: spacing.md,
    paddingHorizontal: spacing.md,
  },
  previewName: {
    ...typography.heading,
    color: colors.text,
    paddingHorizontal: spacing.md,
    marginTop: 2,
  },
  previewMeta: {
    ...typography.small,
    color: colors.textMuted,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    marginTop: spacing.xs,
  },
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
