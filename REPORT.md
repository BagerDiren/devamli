# Devamlı — A Class Attendance Tracker
### Mobile Application Development Project Report

**Student Name and Surname:** Bager Diren Karakoyun
**Student Number:** 210513250
**Department:** Software Engineering, Altinbas University
**Course:** Introduction to Mobile Application Development
**Instructor:** F. Kuzey Edes Huyal
**Submission Date:** 29 April 2026
**Signature:** ____________________

---

## 1. Introduction

For the project of the *Introduction to Mobile Application Development* course, I designed and built **Devamlı**, a mobile application that helps a university student keep track of how many classes they have attended and how many absences they have left in each course. The application is a personal tool that turns a small but stressful problem in student life into something that is solved with a single tap. In this report I describe the idea, why I chose React Native with Expo as the technology, how I planned and built the screens, what challenges I faced during development, and how the final version meets the rubric of the assignment. The full source code is published on my GitHub account, and the link is given at the end of this report.

## 2. Project Idea

The list of suggested project ideas in the assignment included a To-Do List, a Notes App, an Expense Tracker, a Habit Tracker and a Water Reminder. I felt that all of these were already very common, and I wanted to design something that solved a real problem of my own life that I could not find a good app for.

In Turkish universities, a student is normally allowed to be absent from at most 30% of the lectures of a course; if they exceed that limit, they automatically fail the course (DZ status), even if their grades are perfect. I have personally lost track of my absences several times during my own studies, so I decided to build a mobile app that does this counting for me. The app should let me add my courses, record each lecture as *attended*, *missed* or *excused*, and immediately tell me how many absences I have left and how risky my current situation is. I named the app **Devamlı**, which can be translated to English as "*regular*" or "*the one who keeps attending*".

To be honest about why this idea felt personal to me: during my second year I caught a heavy flu and skipped a few classes of a database course in a row, and at the end of the term my advisor told me I had already used nine of my twelve allowed absences without realising it — one more illness and I would have failed the course outright. After that scare I started keeping notes in my phone's default note app, but it was too easy to forget which week I was looking at. Devamlı is essentially the tool I wished I had during that semester.

The app has clear usefulness because every university student in Turkey faces this 30% rule, and it is also a different idea from the suggestions given in the assignment, which I think is important for being noticed by the instructor.

## 3. Technology Choice

I chose **React Native** through the **Expo** framework. The other options the assignment offered were Kotlin with Android Studio and Flutter. There were three reasons for my choice.

First, **Expo gives the fastest development loop**. I do not own a Mac, and getting Android Studio to build native APKs on my Windows machine was slow during my early experiments. With Expo, I write the code, save the file, and the change appears on my iPhone in less than a second through the Expo Go application. This let me iterate on the user interface very quickly.

Second, **JavaScript is a language I already know**. I had used React for a small web project before, and React Native uses the same component model and the same JSX syntax. This meant that I could focus my energy on the actual problem (counting absences correctly) instead of fighting with a brand-new language like Kotlin or Dart.

Third, **a single codebase can target both iOS and Android**. Although I tested only on iOS through Expo Go, the same code runs on Android. If I want to share Devamlı with friends later, I will not need to rewrite anything.

The packages I used are the standard React Native ecosystem: `@react-navigation/native` and `@react-navigation/native-stack` for navigation between screens, `react-native-screens` and `react-native-safe-area-context` for iOS notches and gestures, and `@react-native-async-storage/async-storage` for storing the data on the device.

## 4. Planning Stage

Before writing any code I drew the screens on paper to understand the navigation flow.

I decided that the app needs four screens:

1. **Home** — a list of all courses with a small summary card for each.
2. **Add Course** — a form to create a new course (name, code, weekly hours, total weeks, absence limit, color).
3. **Course Detail** — the detail of one course with its statistics and the list of recorded sessions.
4. **Mark Session** — a form to record a single session as *Attended*, *Missed* or *Excused*.

Then I designed the data model. A course owns a list of sessions; each session is small (date, status, optional note). Storing everything in one JSON value is enough for a personal app, so I decided to use **AsyncStorage**, which is the standard key-value storage for React Native.

```js
Course  { id, name, code, weeklyHours, totalWeeks, absenceLimitPercent, color, sessions: [Session] }
Session { id, date, status: "attended" | "missed" | "excused", note }
```

I also chose a calm color palette (light gray background, white cards, a single blue primary color) and decided that the *risk status* of a course should be communicated with color (green = safe, amber = warning, red = critical, dark red = limit exceeded). I felt this was the most important UX decision because the whole point of the app is that the student should *see* the risk at a glance.

## 5. Development Stage

I created the project with `npx create-expo-app@latest devamli --template blank` and added the navigation and storage packages with `npx expo install`. Then I split the source under `src/` into four folders: `screens/`, `components/`, `utils/` and the two top-level files `theme.js` and `storage.js`. This separation made the code easier to read and is one of the things mentioned in the rubric (code organization).

The first piece of real code I wrote was the **storage layer** in `src/storage.js`. It exposes two simple async functions, `loadCourses()` and `saveCourses(courses)`, and a few pure helpers (`makeCourse`, `makeSession`, `upsertCourse`, `removeCourse`, `addSession`, `removeSession`) that produce a new array without mutating the old one. Working with immutable updates is something I learned while studying React. I had picked up that mindset mostly from the official React documentation and from reading the introduction of the Redux Toolkit guide before this course; even though Devamlı does not use Redux, the rule of treating state as read-only stayed with me and saved me from many "why is the screen not updating" moments later. Concretely, it makes the rest of the application much easier to reason about because the screens just call `setCourses(next)` and React redraws.

```js
export async function loadCourses() {
  const raw = await AsyncStorage.getItem(COURSES_KEY);
  if (!raw) return [];
  const parsed = JSON.parse(raw);
  return Array.isArray(parsed) ? parsed : [];
}
```

The second piece was the **statistics function** in `src/utils/attendance.js`. This is the heart of the app: given a course, it returns the maximum number of allowed absences, the number of missed sessions, the remaining absences, the attendance percentage and a discrete *risk* value. The code is simple but it is the part that I tested the most because every wrong number here would make the rest of the app misleading.

```js
const totalPlanned = (course.totalWeeks || 14) * (course.weeklyHours || 3);
const maxAbsences  = Math.floor(totalPlanned * (course.absenceLimitPercent || 30) / 100);
const missed       = sessions.filter(s => s.status === 'missed').length;
const remaining    = maxAbsences - missed;

let risk;
if (missed > maxAbsences)        risk = 'failed';
else if (remaining === 0)        risk = 'critical';
else if (remaining <= 2)         risk = 'warning';
else                             risk = 'safe';
```

After the data layer was ready, I built the screens one by one. The **Home screen** uses a `FlatList` to render the courses and a custom `RiskBadge` component. The **Add Course screen** is a form with text inputs and a row of color circles for picking a tag color; I added a small live preview at the bottom so that the user sees what the card will look like before saving. The **Course Detail screen** shows a colored banner with the course name, a summary card with four big numbers, a progress bar that fills with green/amber/red depending on the risk, and the chronological list of recorded sessions. Finally the **Mark Session screen** lets the user shift the date by one day at a time, choose a status from three radio-style options, and add an optional note.

I connected the four screens with a native stack navigator inside `App.js`. The Home screen has its own header (so the title can be styled), while the Add Course and Mark Session screens are presented as iOS-style modals (`presentation: "modal"`) so the user can swipe them down to cancel.

## 6. Final Version

The final version of the app is the result of about three full days of work and roughly twenty incremental git commits, organised in five clean groups (project scaffolding, data layer, screens, navigation wiring, and documentation). The screenshots that accompany this report show, in order:

1. The **Home screen** with three example courses, each with its own color, attendance percentage, used absences and a colored progress bar.
2. The **Add Course form** with the live preview at the bottom.
3. The **Course Detail screen** for one course, showing the summary card and the list of recorded sessions.
4. The **Mark Session form** with the three status options highlighted.
5. The **risk states** (a course in *Safe*, a course in *Watch out* and a course in *No absences left*).

All data is persisted with AsyncStorage, so closing and re-opening the app keeps every course and every recorded session intact.

## 7. Challenges and Solutions

The first challenge was **getting the Expo project to bundle on Windows**. The path to my user folder contains the Turkish character "İ" and Metro initially complained about resolving some files. The fix was simple — I created the project on the Desktop, which avoids long Windows paths, and after that everything compiled normally.

The second challenge was about **state freshness**. When I added a new course in the Add Course screen and went back to the Home screen, the new course did not appear because the Home screen had only loaded the data once, when it was first mounted. I solved this by replacing my `useEffect` with `useFocusEffect` from React Navigation, which re-runs the loader every time the screen becomes focused. After this small change the list always reflects what is in storage.

A third challenge was the **risk thresholds**. My first version showed *Watch out* only when there were exactly two absences left, but during a quick test with my own course list I realised that a student wants to be warned a little earlier. I changed the rule so that the warning state covers one *or* two remaining absences, and the *critical* state appears only at zero. This is a small change but a good example of why testing the app on real data matters: numbers that look fine on paper can feel wrong in practice.

The fourth challenge was **avoiding mutations**. Early on I accidentally mutated a course object directly in the Course Detail screen and the FlatList stopped re-rendering. After that I converted every update to a pure function returning a new object, which is safer with React's diffing algorithm.

A fifth, smaller, but genuinely annoying problem was that the **iOS keyboard initially covered the Save button** on the Add Course and Mark Session forms. At first I did not even understand why the form was suddenly broken — I just saw the button disappear when I tapped a text input and assumed I had a flexbox bug somewhere. After about an hour of staring at layout properties, I learnt that React Native ships a component called `KeyboardAvoidingView` with a "padding" behaviour for iOS; wrapping each form with it pushed the content above the keyboard properly. It is a tiny fix in retrospect, but it taught me to always test forms with the on-screen keyboard open, not only with the simulator's hardware keyboard.

## 8. Conclusion

Building **Devamlı** taught me how to plan, design and deliver a small but complete mobile application. The interface is clean, the four screens flow naturally from one to the other, every piece of user input is validated before being saved, and all data survives across restarts thanks to AsyncStorage. More importantly, I built something that I will actually keep on my own phone for the rest of my degree. The combination of React Native and Expo turned out to be a very productive choice, and I plan to extend the project after the semester with a calendar view of absences and a small notification that warns me on the morning of a class I tend to skip.

On a more personal note, this assignment was the first time I shipped an app that actually runs on my own phone, not just on a localhost browser tab. Watching Expo Go reload the screen as I saved a file in the editor turned out to be the most motivating part of the whole semester for me — I now understand why mobile developers say the development loop matters at least as much as the language itself.

## 9. GitHub Information

- **GitHub username:** BagerDiren
- **Repository:** https://github.com/BagerDiren/devamli
- **Profile:** https://github.com/BagerDiren

The full source code, including the README with setup instructions, is publicly available at the repository link above. The repository follows a standard Expo React Native project structure and can be cloned, installed with `npm install`, and run with `npm start`.

---

**Signature:** ____________________
