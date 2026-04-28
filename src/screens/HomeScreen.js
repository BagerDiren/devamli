import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radius, spacing, typography } from '../theme';
import { loadCourses, saveCourses, removeCourse } from '../storage';
import { getStats } from '../utils/attendance';
import RiskBadge from '../components/RiskBadge';

export default function HomeScreen({ navigation }) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const refresh = useCallback(async () => {
    const data = await loadCourses();
    setCourses(data);
    setLoading(false);
    setRefreshing(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  const handleDelete = (course) => {
    Alert.alert(
      'Delete course',
      `"${course.name}" and all its attendance records will be removed.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const next = removeCourse(courses, course.id);
            await saveCourses(next);
            setCourses(next);
          },
        },
      ]
    );
  };

  const totalCourses = courses.length;
  const overallRisk = courses.reduce((acc, c) => {
    const s = getStats(c);
    if (s.risk === 'failed' || s.risk === 'critical') return acc + 1;
    return acc;
  }, 0);

  const renderItem = ({ item }) => {
    const stats = getStats(item);
    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => navigation.navigate('CourseDetail', { courseId: item.id })}
        onLongPress={() => handleDelete(item)}
        style={styles.card}
      >
        <View style={[styles.colorBar, { backgroundColor: item.color }]} />
        <View style={styles.cardBody}>
          <View style={styles.cardHeaderRow}>
            <View style={{ flex: 1 }}>
              {item.code ? <Text style={styles.code}>{item.code}</Text> : null}
              <Text style={styles.courseName} numberOfLines={2}>{item.name}</Text>
            </View>
            <RiskBadge risk={stats.risk} />
          </View>

          <View style={styles.metricsRow}>
            <Metric label="Attendance" value={`${stats.attendancePercent}%`} />
            <Metric label="Absences" value={`${stats.missed} / ${stats.maxAbsences}`} />
            <Metric
              label="Remaining"
              value={stats.remainingAbsences < 0 ? '0' : String(stats.remainingAbsences)}
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
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.appTitle}>Devamlı</Text>
          <Text style={styles.subtitle}>
            {totalCourses === 0
              ? 'No courses yet'
              : `${totalCourses} course${totalCourses === 1 ? '' : 's'} • ${overallRisk} need attention`}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate('AddCourse')}
          activeOpacity={0.85}
        >
          <Text style={styles.addBtnText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}><Text style={styles.muted}>Loading…</Text></View>
      ) : courses.length === 0 ? (
        <EmptyState onAdd={() => navigation.navigate('AddCourse')} />
      ) : (
        <FlatList
          data={courses}
          keyExtractor={(c) => c.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                refresh();
              }}
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

function Metric({ label, value, tone = 'default' }) {
  const valueColor =
    tone === 'danger' ? colors.danger
    : tone === 'warning' ? colors.warning
    : colors.text;
  return (
    <View style={styles.metric}>
      <Text style={[styles.metricValue, { color: valueColor }]}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

function EmptyState({ onAdd }) {
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyEmoji}>📚</Text>
      <Text style={styles.emptyTitle}>Add your first course</Text>
      <Text style={styles.emptyText}>
        Track absences for every class so you never lose attendance points by surprise.
      </Text>
      <TouchableOpacity style={styles.emptyBtn} onPress={onAdd} activeOpacity={0.85}>
        <Text style={styles.emptyBtnText}>+ Add a course</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  appTitle: { ...typography.title, color: colors.text },
  subtitle: { ...typography.small, color: colors.textMuted, marginTop: 2 },
  addBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.lg,
  },
  addBtnText: { color: '#FFFFFF', ...typography.subheading },
  list: { padding: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.xxl },
  card: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    marginBottom: spacing.md,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  colorBar: { width: 6 },
  cardBody: { flex: 1, padding: spacing.lg },
  cardHeaderRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  code: { ...typography.tiny, color: colors.textMuted, letterSpacing: 1 },
  courseName: { ...typography.heading, color: colors.text, marginTop: 2 },
  metricsRow: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginTop: spacing.md,
  },
  metric: {},
  metricValue: { ...typography.heading },
  metricLabel: { ...typography.tiny, color: colors.textMuted, marginTop: 2 },
  progressTrack: {
    marginTop: spacing.md,
    height: 6,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 4 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  muted: { color: colors.textMuted },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  emptyEmoji: { fontSize: 48, marginBottom: spacing.md },
  emptyTitle: { ...typography.heading, color: colors.text, marginBottom: spacing.sm },
  emptyText: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.xl,
    maxWidth: 300,
  },
  emptyBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
  },
  emptyBtnText: { color: '#FFFFFF', ...typography.subheading },
});
