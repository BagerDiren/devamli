import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radius, spacing, typography } from '../theme';
import { loadCourses, saveCourses, removeSession, upsertCourse } from '../storage';
import { getStats, formatDate } from '../utils/attendance';
import RiskBadge from '../components/RiskBadge';

const statusMeta = {
  attended: { label: 'Attended', color: colors.success, bg: colors.successSoft, icon: '✓' },
  missed: { label: 'Missed', color: colors.danger, bg: colors.dangerSoft, icon: '✗' },
  excused: { label: 'Excused', color: colors.warning, bg: colors.warningSoft, icon: '!' },
};

export default function CourseDetailScreen({ route, navigation }) {
  const { courseId } = route.params;
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const all = await loadCourses();
    const c = all.find((x) => x.id === courseId);
    setCourse(c || null);
    setLoading(false);
  }, [courseId]);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.screen} edges={['top']}>
        <View style={styles.center}><Text style={styles.muted}>Loading…</Text></View>
      </SafeAreaView>
    );
  }

  if (!course) {
    return (
      <SafeAreaView style={styles.screen} edges={['top']}>
        <View style={styles.center}>
          <Text style={styles.muted}>Course not found.</Text>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>Go back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const stats = getStats(course);
  const sessions = (course.sessions || []).slice().sort((a, b) => (a.date < b.date ? 1 : -1));

  const handleDeleteSession = (session) => {
    Alert.alert(
      'Delete record',
      `Remove the ${statusMeta[session.status].label.toLowerCase()} record for ${formatDate(session.date)}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const updated = removeSession(course, session.id);
            const all = await loadCourses();
            await saveCourses(upsertCourse(all, updated));
            setCourse(updated);
          },
        },
      ]
    );
  };

  const renderSession = ({ item }) => {
    const meta = statusMeta[item.status] || statusMeta.attended;
    return (
      <TouchableOpacity
        style={styles.sessionRow}
        onLongPress={() => handleDeleteSession(item)}
        activeOpacity={0.85}
      >
        <View style={[styles.iconBox, { backgroundColor: meta.bg }]}>
          <Text style={[styles.iconText, { color: meta.color }]}>{meta.icon}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.sessionDate}>{formatDate(item.date)}</Text>
          <Text style={[styles.sessionStatus, { color: meta.color }]}>{meta.label}</Text>
          {item.note ? <Text style={styles.sessionNote} numberOfLines={2}>{item.note}</Text> : null}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <FlatList
        ListHeaderComponent={
          <View>
            <View style={[styles.banner, { backgroundColor: course.color }]}>
              {course.code ? <Text style={styles.bannerCode}>{course.code}</Text> : null}
              <Text style={styles.bannerName}>{course.name}</Text>
              <Text style={styles.bannerMeta}>
                {course.weeklyHours} h/week • {course.totalWeeks} weeks • limit {course.absenceLimitPercent}%
              </Text>
            </View>

            <View style={styles.summaryCard}>
              <View style={styles.summaryHeader}>
                <Text style={styles.summaryTitle}>Status</Text>
                <RiskBadge risk={stats.risk} />
              </View>

              <View style={styles.summaryRow}>
                <SummaryStat value={`${stats.attendancePercent}%`} label="Attendance" />
                <SummaryStat value={`${stats.missed}`} label="Missed" />
                <SummaryStat value={`${stats.maxAbsences}`} label="Limit" />
                <SummaryStat
                  value={stats.remainingAbsences < 0 ? '0' : `${stats.remainingAbsences}`}
                  label="Remaining"
                  tone={stats.remainingAbsences <= 0 ? 'danger' : stats.remainingAbsences <= 2 ? 'warning' : 'default'}
                />
              </View>

              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${Math.min(100, Math.max(0, (stats.missed / Math.max(1, stats.maxAbsences)) * 100))}%`,
                      backgroundColor:
                        stats.risk === 'failed' || stats.risk === 'critical' ? colors.danger
                        : stats.risk === 'warning' ? colors.warning
                        : colors.success,
                    },
                  ]}
                />
              </View>
              <Text style={styles.progressLabel}>
                {stats.missed} of {stats.maxAbsences} absences used
              </Text>
            </View>

            <View style={styles.recordsHeader}>
              <Text style={styles.sectionTitle}>Records</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('MarkSession', { courseId: course.id })}
                style={styles.markBtn}
                activeOpacity={0.85}
              >
                <Text style={styles.markBtnText}>+ Mark session</Text>
              </TouchableOpacity>
            </View>

            {sessions.length === 0 ? (
              <View style={styles.emptyRecords}>
                <Text style={styles.muted}>No records yet. Add your first session above.</Text>
              </View>
            ) : null}
          </View>
        }
        data={sessions}
        keyExtractor={(s) => s.id}
        renderItem={renderSession}
        contentContainerStyle={styles.list}
      />
    </SafeAreaView>
  );
}

function SummaryStat({ value, label, tone = 'default' }) {
  const valueColor =
    tone === 'danger' ? colors.danger
    : tone === 'warning' ? colors.warning
    : colors.text;
  return (
    <View style={styles.summaryStat}>
      <Text style={[styles.summaryValue, { color: valueColor }]}>{value}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  list: { paddingBottom: spacing.xxl },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  muted: { color: colors.textMuted },
  backBtn: { marginTop: spacing.md, padding: spacing.md },
  backBtnText: { color: colors.primary, ...typography.subheading },
  banner: {
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  bannerCode: {
    color: 'rgba(255,255,255,0.9)',
    ...typography.tiny,
    letterSpacing: 1.5,
  },
  bannerName: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '700',
    marginTop: spacing.xs,
  },
  bannerMeta: {
    color: 'rgba(255,255,255,0.85)',
    ...typography.small,
    marginTop: spacing.xs,
  },
  summaryCard: {
    backgroundColor: colors.surface,
    margin: spacing.lg,
    marginBottom: 0,
    padding: spacing.lg,
    borderRadius: radius.lg,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  summaryTitle: { ...typography.subheading, color: colors.text },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between' },
  summaryStat: { alignItems: 'flex-start' },
  summaryValue: { ...typography.heading, fontSize: 22 },
  summaryLabel: { ...typography.tiny, color: colors.textMuted, marginTop: 2 },
  progressTrack: {
    marginTop: spacing.lg,
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 4 },
  progressLabel: { ...typography.small, color: colors.textMuted, marginTop: spacing.sm },
  recordsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.sm,
  },
  sectionTitle: { ...typography.heading, color: colors.text },
  markBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
  },
  markBtnText: { color: '#FFFFFF', ...typography.small, fontWeight: '600' },
  emptyRecords: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  sessionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  iconText: { fontSize: 16, fontWeight: '700' },
  sessionDate: { ...typography.subheading, color: colors.text },
  sessionStatus: { ...typography.small, marginTop: 2, fontWeight: '600' },
  sessionNote: { ...typography.small, color: colors.textMuted, marginTop: 4 },
});
