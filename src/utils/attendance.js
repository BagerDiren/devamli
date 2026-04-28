export function getStats(course) {
  const sessions = course.sessions || [];
  const totalPlanned = (course.totalWeeks || 14) * (course.weeklyHours || 3);
  const maxAbsences = Math.floor(totalPlanned * (course.absenceLimitPercent || 30) / 100);

  const attended = sessions.filter((s) => s.status === 'attended').length;
  const missed = sessions.filter((s) => s.status === 'missed').length;
  const excused = sessions.filter((s) => s.status === 'excused').length;
  const recorded = attended + missed + excused;

  const remainingAbsences = maxAbsences - missed;
  const attendancePercent = recorded === 0 ? 100 : Math.round((attended / recorded) * 100);
  const completionPercent = totalPlanned === 0 ? 0 : Math.round((recorded / totalPlanned) * 100);

  let risk;
  if (missed > maxAbsences) risk = 'failed';
  else if (remainingAbsences === 0) risk = 'critical';
  else if (remainingAbsences <= 2) risk = 'warning';
  else risk = 'safe';

  return {
    totalPlanned,
    maxAbsences,
    attended,
    missed,
    excused,
    recorded,
    remainingAbsences,
    attendancePercent,
    completionPercent,
    risk,
  };
}

export function riskLabel(risk) {
  switch (risk) {
    case 'safe': return 'Safe';
    case 'warning': return 'Watch out';
    case 'critical': return 'No absences left';
    case 'failed': return 'Limit exceeded';
    default: return '';
  }
}

export function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}.${month}.${year}`;
}

export function todayISO() {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  return d.toISOString();
}
