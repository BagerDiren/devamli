# Devamlı — Class Attendance Tracker

A simple mobile application that helps university students keep track of their class
attendance and remaining absence rights. Built for the *Introduction to Mobile
Application Development* course at Altinbas University.

## Why this app

Most universities in Turkey enforce a 30% absence limit. Students often lose attendance
points or even fail a course because they miscount how many classes they have skipped.
**Devamlı** turns this into a problem of one tap per session: open the app, pick the
course, mark *attended / missed / excused*, and the app instantly recomputes how many
absences you have left and how risky the situation is.

## Features

- Add any number of courses with code, weekly hours, total weeks and absence limit (%).
- Color-tag every course so they are easy to recognize on the home screen.
- Mark each session as **Attended**, **Missed** or **Excused**, with an optional note.
- Live calculation of:
  - Maximum allowed absences (e.g. 30% of 14 × 3 sessions).
  - Used absences.
  - Remaining absences.
  - Attendance percentage.
  - Risk status (Safe → Watch out → No absences left → Limit exceeded).
- Color-coded progress bar that turns from green to amber to red as the risk grows.
- Long-press a course or a record to delete it.
- Pull-to-refresh on the course list.
- Empty state and form validation.
- All data is stored locally on the device with AsyncStorage — no account, no internet.

## Tech stack

| Layer | Choice |
|-------|--------|
| Framework | React Native via [Expo](https://expo.dev) (SDK 54) |
| Navigation | `@react-navigation/native` + native stack |
| Storage | `@react-native-async-storage/async-storage` |
| Language | JavaScript (ES2022) |

React Native + Expo was selected because it offers the fastest development loop
(QR-code preview on a real iPhone through Expo Go), a single JavaScript codebase that
can later be released for both iOS and Android, and a large ecosystem of well-maintained
libraries.

## Project structure

```
devamli/
├── App.js                       # Navigation container + stack
├── app.json                     # Expo config (name: Devamlı)
├── src/
│   ├── theme.js                 # Colors, spacing, typography, course palette
│   ├── storage.js               # AsyncStorage helpers + factory functions
│   ├── components/
│   │   └── RiskBadge.js         # Reusable status badge
│   ├── screens/
│   │   ├── HomeScreen.js        # Course list + stats
│   │   ├── AddCourseScreen.js   # Form to create a course
│   │   ├── CourseDetailScreen.js# Course summary + records
│   │   └── MarkSessionScreen.js # Date + status form
│   └── utils/
│       └── attendance.js        # Statistics & date helpers
└── assets/                      # Icons & splash
```

## Running the app

You will need Node.js 18+ and the [Expo Go](https://expo.dev/go) app on your phone.

```bash
# Install dependencies
npm install

# Start the Metro bundler
npm start
```

Scan the QR code with Expo Go on iOS, or with the Camera app, and the project will
load on your device.

## Data model

```js
Course {
  id: string,
  name: string,
  code: string,
  weeklyHours: number,
  totalWeeks: number,
  absenceLimitPercent: number,
  color: string,
  createdAt: ISOString,
  sessions: Session[]
}

Session {
  id: string,
  date: ISOString,
  status: "attended" | "missed" | "excused",
  note: string
}
```

## How the calculation works

For a course with `weeklyHours` and `totalWeeks`:

```
totalPlanned     = weeklyHours * totalWeeks
maxAbsences      = floor(totalPlanned * absenceLimitPercent / 100)
missed           = sessions where status === "missed"
attended         = sessions where status === "attended"
remainingAbsences= maxAbsences - missed
attendance%      = (attended / (attended + missed + excused)) * 100
```

Risk thresholds:

| Condition | Risk |
|-----------|------|
| `missed > maxAbsences`        | **Limit exceeded** (failed) |
| `remainingAbsences === 0`     | **No absences left** (critical) |
| `remainingAbsences <= 2`      | **Watch out** (warning) |
| otherwise                     | **Safe** |

## Author

Bager Diren Karakoyun — Altinbas University, Department of Software Engineering.

GitHub: [BagerDiren](https://github.com/BagerDiren)
