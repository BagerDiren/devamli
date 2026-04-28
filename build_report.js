const fs = require('fs');
const path = require('path');
const {
  Document, Packer, Paragraph, TextRun, AlignmentType, HeadingLevel,
  Footer, Header, PageNumber, BorderStyle, LevelFormat, PageBreak,
  TabStopType, TabStopPosition, ImageRun,
} = require('docx');

const OUT = path.join(__dirname, 'Devamli_Report_BagerDirenKarakoyun_210513250.docx');

const FONT_BODY = 'Calibri';
const FONT_HEAD = 'Calibri';
const FONT_CODE = 'Consolas';

const para = (text, opts = {}) =>
  new Paragraph({
    spacing: { after: 120, line: 300 },
    alignment: opts.align || AlignmentType.JUSTIFIED,
    children: [
      new TextRun({
        text,
        font: FONT_BODY,
        size: 22,
        bold: !!opts.bold,
        italics: !!opts.italic,
      }),
    ],
  });

const richPara = (runs, opts = {}) =>
  new Paragraph({
    spacing: { after: 120, line: 300 },
    alignment: opts.align || AlignmentType.JUSTIFIED,
    children: runs,
  });

const heading = (text, level = HeadingLevel.HEADING_1) =>
  new Paragraph({
    heading: level,
    spacing: { before: 360, after: 180 },
    children: [
      new TextRun({
        text,
        font: FONT_HEAD,
        size: level === HeadingLevel.TITLE ? 40 : 28,
        bold: true,
      }),
    ],
  });

const codeBlock = (code) => {
  const lines = code.split('\n');
  return lines.map(
    (line) =>
      new Paragraph({
        spacing: { after: 0, line: 260 },
        indent: { left: 360 },
        shading: { fill: 'F3F4F6' },
        children: [
          new TextRun({
            text: line || ' ',
            font: FONT_CODE,
            size: 19,
          }),
        ],
      })
  );
};

const bullet = (text) =>
  new Paragraph({
    numbering: { reference: 'bullets', level: 0 },
    spacing: { after: 80, line: 280 },
    children: [new TextRun({ text, font: FONT_BODY, size: 22 })],
  });

const numbered = (text) =>
  new Paragraph({
    numbering: { reference: 'numbers', level: 0 },
    spacing: { after: 80, line: 280 },
    children: [new TextRun({ text, font: FONT_BODY, size: 22 })],
  });

const labelValue = (label, value) =>
  new Paragraph({
    spacing: { after: 60 },
    children: [
      new TextRun({ text: `${label}: `, font: FONT_BODY, size: 22, bold: true }),
      new TextRun({ text: value, font: FONT_BODY, size: 22 }),
    ],
  });

const blankLine = () =>
  new Paragraph({ spacing: { after: 0 }, children: [new TextRun({ text: '', font: FONT_BODY, size: 22 })] });

const dividerLine = () =>
  new Paragraph({
    spacing: { before: 240, after: 240 },
    border: {
      bottom: { color: '9CA3AF', style: BorderStyle.SINGLE, size: 6 },
    },
    children: [new TextRun({ text: '', font: FONT_BODY, size: 2 })],
  });

const inlineCode = (text) =>
  new TextRun({ text, font: FONT_CODE, size: 20 });

const screenshot = (filename, caption) => {
  const filePath = path.join(__dirname, 'screenshots', filename);
  return [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 240, after: 80 },
      children: [
        new ImageRun({
          type: 'jpg',
          data: fs.readFileSync(filePath),
          transformation: { width: 270, height: 585 },
          altText: { title: caption, description: caption, name: filename },
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 240 },
      children: [
        new TextRun({
          text: caption,
          font: FONT_BODY,
          size: 19,
          italics: true,
          color: '4B5563',
        }),
      ],
    }),
  ];
};

const bodyText = (text, opts = {}) =>
  new TextRun({
    text,
    font: FONT_BODY,
    size: 22,
    bold: !!opts.bold,
    italics: !!opts.italic,
  });

const children = [];

// === TITLE BLOCK ===
children.push(
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 480, after: 120 },
    children: [
      new TextRun({
        text: 'Devamlı',
        font: FONT_HEAD,
        size: 56,
        bold: true,
      }),
    ],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 60 },
    children: [
      new TextRun({
        text: 'A Class Attendance Tracker',
        font: FONT_HEAD,
        size: 30,
        italics: true,
      }),
    ],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 480 },
    children: [
      new TextRun({
        text: 'Mobile Application Development Project Report',
        font: FONT_BODY,
        size: 24,
      }),
    ],
  }),
);

// Student info block
children.push(
  labelValue('Student Name and Surname', 'Bager Diren Karakoyun'),
  labelValue('Student Number', '210513250'),
  labelValue('Department', 'Software Engineering, Altinbas University'),
  labelValue('Course', 'Introduction to Mobile Application Development'),
  labelValue('Instructor', 'F. Kuzey Edes Huyal'),
  labelValue('Submission Date', '29 April 2026'),
);

children.push(
  new Paragraph({
    spacing: { before: 480, after: 60 },
    children: [
      new TextRun({ text: 'Signature: ', font: FONT_BODY, size: 22, bold: true }),
      new TextRun({ text: '____________________________________', font: FONT_BODY, size: 22 }),
    ],
  }),
);

children.push(dividerLine());

// === 1. INTRODUCTION ===
children.push(heading('1. Introduction'));
children.push(
  para(
    'For the project of the Introduction to Mobile Application Development course, I designed and built Devamlı, a mobile application that helps a university student keep track of how many classes they have attended and how many absences they have left in each course. The application is a personal tool that turns a small but stressful problem in student life into something that is solved with a single tap. In this report I describe the idea, why I chose React Native with Expo as the technology, how I planned and built the screens, what challenges I faced during development, and how the final version meets the rubric of the assignment. The full source code is published on my GitHub account, and the link is given at the end of this report.'
  )
);

// === 2. PROJECT IDEA ===
children.push(heading('2. Project Idea'));
children.push(
  para(
    'The list of suggested project ideas in the assignment included a To-Do List, a Notes App, an Expense Tracker, a Habit Tracker and a Water Reminder. I felt that all of these were already very common, and I wanted to design something that solved a real problem of my own life that I could not find a good app for.'
  )
);
children.push(
  para(
    'In Turkish universities, a student is normally allowed to be absent from at most 30% of the lectures of a course; if they exceed that limit, they automatically fail the course (DZ status), even if their grades are perfect. I have personally lost track of my absences several times during my own studies, so I decided to build a mobile app that does this counting for me. The app should let me add my courses, record each lecture as attended, missed or excused, and immediately tell me how many absences I have left and how risky my current situation is. I named the app Devamlı, which can be translated to English as "regular" or "the one who keeps attending".'
  )
);
children.push(
  para(
    "To be honest about why this idea felt personal to me: during my second year I caught a heavy flu and skipped a few classes of a database course in a row, and at the end of the term my advisor told me I had already used nine of my twelve allowed absences without realising it — one more illness and I would have failed the course outright. After that scare I started keeping notes in my phone's default note app, but it was too easy to forget which week I was looking at. Devamlı is essentially the tool I wished I had during that semester."
  )
);
children.push(
  para(
    'The app has clear usefulness because every university student in Turkey faces this 30% rule, and it is also a different idea from the suggestions given in the assignment, which I think is important for being noticed by the instructor.'
  )
);

// === 3. TECHNOLOGY CHOICE ===
children.push(heading('3. Technology Choice'));
children.push(
  para(
    'I chose React Native through the Expo framework. The other options the assignment offered were Kotlin with Android Studio and Flutter. There were three reasons for my choice.'
  )
);
children.push(
  para(
    'First, Expo gives the fastest development loop. I do not own a Mac, and getting Android Studio to build native APKs on my Windows machine was slow during my early experiments. With Expo, I write the code, save the file, and the change appears on my iPhone in less than a second through the Expo Go application. This let me iterate on the user interface very quickly.'
  )
);
children.push(
  para(
    'Second, JavaScript is a language I already know. I had used React for a small web project before, and React Native uses the same component model and the same JSX syntax. This meant that I could focus my energy on the actual problem (counting absences correctly) instead of fighting with a brand-new language like Kotlin or Dart.'
  )
);
children.push(
  para(
    'Third, a single codebase can target both iOS and Android. Although I tested only on iOS through Expo Go, the same code runs on Android. If I want to share Devamlı with friends later, I will not need to rewrite anything.'
  )
);
children.push(
  richPara([
    bodyText('The packages I used are the standard React Native ecosystem: '),
    inlineCode('@react-navigation/native'),
    bodyText(' and '),
    inlineCode('@react-navigation/native-stack'),
    bodyText(' for navigation between screens, '),
    inlineCode('react-native-screens'),
    bodyText(' and '),
    inlineCode('react-native-safe-area-context'),
    bodyText(' for iOS notches and gestures, and '),
    inlineCode('@react-native-async-storage/async-storage'),
    bodyText(' for storing the data on the device.'),
  ])
);

// === 4. PLANNING STAGE ===
children.push(heading('4. Planning Stage'));
children.push(
  para('Before writing any code I drew the screens on paper to understand the navigation flow.')
);
children.push(para('I decided that the app needs four screens:'));
children.push(numbered('Home — a list of all courses with a small summary card for each.'));
children.push(numbered('Add Course — a form to create a new course (name, code, weekly hours, total weeks, absence limit, color).'));
children.push(numbered('Course Detail — the detail of one course with its statistics and the list of recorded sessions.'));
children.push(numbered('Mark Session — a form to record a single session as Attended, Missed or Excused.'));
children.push(
  richPara([
    bodyText('Then I designed the data model. A course owns a list of sessions; each session is small (date, status, optional note). Storing everything in one JSON value is enough for a personal app, so I decided to use '),
    bodyText('AsyncStorage', { bold: true }),
    bodyText(', which is the standard key-value storage for React Native.'),
  ])
);
children.push(...codeBlock(
`Course  { id, name, code, weeklyHours, totalWeeks, absenceLimitPercent, color, sessions: [Session] }
Session { id, date, status: "attended" | "missed" | "excused", note }`
));
children.push(blankLine());
children.push(
  para(
    'I also chose a calm color palette (light gray background, white cards, a single blue primary color) and decided that the risk status of a course should be communicated with color (green = safe, amber = warning, red = critical, dark red = limit exceeded). I felt this was the most important UX decision because the whole point of the app is that the student should see the risk at a glance.'
  )
);

// === 5. DEVELOPMENT STAGE ===
children.push(heading('5. Development Stage'));
children.push(
  richPara([
    bodyText('I created the project with '),
    inlineCode('npx create-expo-app@latest devamli --template blank'),
    bodyText(' and added the navigation and storage packages with '),
    inlineCode('npx expo install'),
    bodyText('. Then I split the source under '),
    inlineCode('src/'),
    bodyText(' into four folders: '),
    inlineCode('screens/'),
    bodyText(', '),
    inlineCode('components/'),
    bodyText(', '),
    inlineCode('utils/'),
    bodyText(' and the two top-level files '),
    inlineCode('theme.js'),
    bodyText(' and '),
    inlineCode('storage.js'),
    bodyText('. This separation made the code easier to read and is one of the things mentioned in the rubric (code organization).'),
  ])
);
children.push(
  richPara([
    bodyText('The first piece of real code I wrote was the '),
    bodyText('storage layer', { bold: true }),
    bodyText(' in '),
    inlineCode('src/storage.js'),
    bodyText('. It exposes two simple async functions, '),
    inlineCode('loadCourses()'),
    bodyText(' and '),
    inlineCode('saveCourses(courses)'),
    bodyText(', and a few pure helpers ('),
    inlineCode('makeCourse'),
    bodyText(', '),
    inlineCode('makeSession'),
    bodyText(', '),
    inlineCode('upsertCourse'),
    bodyText(', '),
    inlineCode('removeCourse'),
    bodyText(', '),
    inlineCode('addSession'),
    bodyText(', '),
    inlineCode('removeSession'),
    bodyText(') that produce a new array without mutating the old one. Working with immutable updates is something I learned while studying React. I had picked up that mindset mostly from the official React documentation and from reading the introduction of the Redux Toolkit guide before this course; even though Devamlı does not use Redux, the rule of treating state as read-only stayed with me and saved me from many "why is the screen not updating" moments later. Concretely, it makes the rest of the application much easier to reason about because the screens just call '),
    inlineCode('setCourses(next)'),
    bodyText(' and React redraws.'),
  ])
);
children.push(...codeBlock(
`export async function loadCourses() {
  const raw = await AsyncStorage.getItem(COURSES_KEY);
  if (!raw) return [];
  const parsed = JSON.parse(raw);
  return Array.isArray(parsed) ? parsed : [];
}`
));
children.push(blankLine());
children.push(
  richPara([
    bodyText('The second piece was the '),
    bodyText('statistics function', { bold: true }),
    bodyText(' in '),
    inlineCode('src/utils/attendance.js'),
    bodyText('. This is the heart of the app: given a course, it returns the maximum number of allowed absences, the number of missed sessions, the remaining absences, the attendance percentage and a discrete risk value. The code is simple but it is the part that I tested the most because every wrong number here would make the rest of the app misleading.'),
  ])
);
children.push(...codeBlock(
`const totalPlanned = (course.totalWeeks || 14) * (course.weeklyHours || 3);
const maxAbsences  = Math.floor(totalPlanned * (course.absenceLimitPercent || 30) / 100);
const missed       = sessions.filter(s => s.status === 'missed').length;
const remaining    = maxAbsences - missed;

let risk;
if (missed > maxAbsences)        risk = 'failed';
else if (remaining === 0)        risk = 'critical';
else if (remaining <= 2)         risk = 'warning';
else                             risk = 'safe';`
));
children.push(blankLine());
children.push(
  richPara([
    bodyText('After the data layer was ready, I built the screens one by one. The '),
    bodyText('Home screen', { bold: true }),
    bodyText(' uses a '),
    inlineCode('FlatList'),
    bodyText(' to render the courses and a custom '),
    inlineCode('RiskBadge'),
    bodyText(' component. The '),
    bodyText('Add Course screen', { bold: true }),
    bodyText(' is a form with text inputs and a row of color circles for picking a tag color; I added a small live preview at the bottom so that the user sees what the card will look like before saving. The '),
    bodyText('Course Detail screen', { bold: true }),
    bodyText(' shows a colored banner with the course name, a summary card with four big numbers, a progress bar that fills with green/amber/red depending on the risk, and the chronological list of recorded sessions. Finally the '),
    bodyText('Mark Session screen', { bold: true }),
    bodyText(' lets the user shift the date by one day at a time, choose a status from three radio-style options, and add an optional note.'),
  ])
);
children.push(
  richPara([
    bodyText('I connected the four screens with a native stack navigator inside '),
    inlineCode('App.js'),
    bodyText('. The Home screen has its own header (so the title can be styled), while the Add Course and Mark Session screens are presented as iOS-style modals ('),
    inlineCode('presentation: "modal"'),
    bodyText(') so the user can swipe them down to cancel.'),
  ])
);

// === 6. FINAL VERSION ===
children.push(heading('6. Final Version'));
children.push(
  para(
    'The final version of the app is the result of about three full days of work and roughly twenty incremental git commits, organised in five clean groups (project scaffolding, data layer, screens, navigation wiring, and documentation). The screenshots that accompany this report show, in order:'
  )
);
children.push(numbered('The Home screen with three example courses, each with its own color, attendance percentage, used absences and a colored progress bar.'));
children.push(numbered('The Add Course form with the live preview at the bottom.'));
children.push(numbered('The Course Detail screen for one course, showing the summary card and the list of recorded sessions.'));
children.push(numbered('The Mark Session form with the three status options highlighted.'));
children.push(numbered('The risk states (a course in Safe, a course in Watch out and a course in No absences left).'));
children.push(
  para('All data is persisted with AsyncStorage, so closing and re-opening the app keeps every course and every recorded session intact.')
);
children.push(...screenshot(
  '1_home_empty.jpg',
  'Figure 1 — The Home screen on first launch, with an empty-state illustration and an "Add a course" call-to-action.'
));
children.push(...screenshot(
  '2_add_course.jpg',
  'Figure 2 — The New Course form. The bottom preview card updates live as the user changes the name, weekly hours, total weeks and absence percentage.'
));
children.push(...screenshot(
  '3_home_with_course.jpg',
  'Figure 3 — The Home screen after adding "Mobile application development" (SWE404). The card shows attendance percentage, used / max absences and a remaining counter, with a SAFE badge in green.'
));
children.push(...screenshot(
  '4_course_detail_empty.jpg',
  'Figure 4 — The Course Detail screen before any sessions are recorded: the colored banner, the four-stat summary card, and the "+ Mark session" button on the Records section.'
));
children.push(...screenshot(
  '5_mark_session.jpg',
  'Figure 5 — The Mark Session form. The user picks a date with the −1 day / +1 day buttons, selects one of three radio-style status options (here: Missed) and types an optional note such as "Exam".'
));
children.push(...screenshot(
  '6_course_detail_filled.jpg',
  'Figure 6 — The Course Detail screen after recording one missed session. The Status card now reads 1 missed, 11 remaining, and the green progress bar fills slightly to show that the absence budget has started to be used.'
));

// === 7. CHALLENGES AND SOLUTIONS ===
children.push(heading('7. Challenges and Solutions'));
children.push(
  richPara([
    bodyText('The first challenge was '),
    bodyText('getting the Expo project to bundle on Windows', { bold: true }),
    bodyText('. The path to my user folder contains the Turkish character "İ" and Metro initially complained about resolving some files. The fix was simple — I created the project on the Desktop, which avoids long Windows paths, and after that everything compiled normally.'),
  ])
);
children.push(
  richPara([
    bodyText('The second challenge was about '),
    bodyText('state freshness', { bold: true }),
    bodyText('. When I added a new course in the Add Course screen and went back to the Home screen, the new course did not appear because the Home screen had only loaded the data once, when it was first mounted. I solved this by replacing my '),
    inlineCode('useEffect'),
    bodyText(' with '),
    inlineCode('useFocusEffect'),
    bodyText(' from React Navigation, which re-runs the loader every time the screen becomes focused. After this small change the list always reflects what is in storage.'),
  ])
);
children.push(
  richPara([
    bodyText('A third challenge was the '),
    bodyText('risk thresholds', { bold: true }),
    bodyText('. My first version showed Watch out only when there were exactly two absences left, but during a quick test with my own course list I realised that a student wants to be warned a little earlier. I changed the rule so that the warning state covers one or two remaining absences, and the critical state appears only at zero. This is a small change but a good example of why testing the app on real data matters: numbers that look fine on paper can feel wrong in practice.'),
  ])
);
children.push(
  richPara([
    bodyText('The fourth challenge was '),
    bodyText('avoiding mutations', { bold: true }),
    bodyText('. Early on I accidentally mutated a course object directly in the Course Detail screen and the FlatList stopped re-rendering. After that I converted every update to a pure function returning a new object, which is safer with React’s diffing algorithm.'),
  ])
);
children.push(
  richPara([
    bodyText('A fifth, smaller, but genuinely annoying problem was that the '),
    bodyText('iOS keyboard initially covered the Save button', { bold: true }),
    bodyText(' on the Add Course and Mark Session forms. At first I did not even understand why the form was suddenly broken — I just saw the button disappear when I tapped a text input and assumed I had a flexbox bug somewhere. After about an hour of staring at layout properties, I learnt that React Native ships a component called '),
    inlineCode('KeyboardAvoidingView'),
    bodyText(' with a "padding" behaviour for iOS; wrapping each form with it pushed the content above the keyboard properly. It is a tiny fix in retrospect, but it taught me to always test forms with the on-screen keyboard open, not only with the simulator’s hardware keyboard.'),
  ])
);

// === 8. CONCLUSION ===
children.push(heading('8. Conclusion'));
children.push(
  para(
    'Building Devamlı taught me how to plan, design and deliver a small but complete mobile application. The interface is clean, the four screens flow naturally from one to the other, every piece of user input is validated before being saved, and all data survives across restarts thanks to AsyncStorage. More importantly, I built something that I will actually keep on my own phone for the rest of my degree. The combination of React Native and Expo turned out to be a very productive choice, and I plan to extend the project after the semester with a calendar view of absences and a small notification that warns me on the morning of a class I tend to skip.'
  )
);
children.push(
  para(
    'On a more personal note, this assignment was the first time I shipped an app that actually runs on my own phone, not just on a localhost browser tab. Watching Expo Go reload the screen as I saved a file in the editor turned out to be the most motivating part of the whole semester for me — I now understand why mobile developers say the development loop matters at least as much as the language itself.'
  )
);

// === 9. GITHUB INFORMATION ===
children.push(heading('9. GitHub Information'));
children.push(bullet('GitHub username: BagerDiren'));
children.push(bullet('Repository: https://github.com/BagerDiren/devamli'));
children.push(bullet('Profile: https://github.com/BagerDiren'));
children.push(
  richPara([
    bodyText('The full source code, including the README with setup instructions, is publicly available at the repository link above. The repository follows a standard Expo React Native project structure and can be cloned, installed with '),
    inlineCode('npm install'),
    bodyText(', and run with '),
    inlineCode('npm start'),
    bodyText('.'),
  ])
);

// Final signature line
children.push(dividerLine());
children.push(
  new Paragraph({
    spacing: { before: 240 },
    alignment: AlignmentType.LEFT,
    children: [
      new TextRun({ text: 'Signature: ', font: FONT_BODY, size: 22, bold: true }),
      new TextRun({ text: '____________________________________', font: FONT_BODY, size: 22 }),
    ],
  })
);
children.push(
  new Paragraph({
    spacing: { before: 240 },
    alignment: AlignmentType.LEFT,
    children: [
      new TextRun({ text: 'Date: ', font: FONT_BODY, size: 22, bold: true }),
      new TextRun({ text: '29 April 2026', font: FONT_BODY, size: 22 }),
    ],
  })
);

const doc = new Document({
  creator: 'Bager Diren Karakoyun',
  title: 'Devamlı — A Class Attendance Tracker',
  description: 'Mobile Application Development Project Report',
  styles: {
    default: { document: { run: { font: FONT_BODY, size: 22 } } },
    paragraphStyles: [
      {
        id: 'Heading1',
        name: 'Heading 1',
        basedOn: 'Normal',
        next: 'Normal',
        quickFormat: true,
        run: { font: FONT_HEAD, size: 30, bold: true, color: '111827' },
        paragraph: { spacing: { before: 360, after: 180 }, outlineLevel: 0 },
      },
      {
        id: 'Heading2',
        name: 'Heading 2',
        basedOn: 'Normal',
        next: 'Normal',
        quickFormat: true,
        run: { font: FONT_HEAD, size: 26, bold: true, color: '111827' },
        paragraph: { spacing: { before: 240, after: 120 }, outlineLevel: 1 },
      },
    ],
  },
  numbering: {
    config: [
      {
        reference: 'bullets',
        levels: [
          {
            level: 0,
            format: LevelFormat.BULLET,
            text: '•',
            alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 720, hanging: 360 } } },
          },
        ],
      },
      {
        reference: 'numbers',
        levels: [
          {
            level: 0,
            format: LevelFormat.DECIMAL,
            text: '%1.',
            alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 720, hanging: 360 } } },
          },
        ],
      },
    ],
  },
  sections: [
    {
      properties: {
        page: {
          size: { width: 11906, height: 16838 }, // A4
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
        },
      },
      headers: {
        default: new Header({
          children: [
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              border: { bottom: { color: 'D1D5DB', style: BorderStyle.SINGLE, size: 4 } },
              children: [
                new TextRun({
                  text: 'Devamlı — Project Report — Bager Diren Karakoyun (210513250)',
                  font: FONT_BODY,
                  size: 18,
                  color: '6B7280',
                }),
              ],
            }),
          ],
        }),
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({ text: 'Page ', font: FONT_BODY, size: 18, color: '6B7280' }),
                new TextRun({ children: [PageNumber.CURRENT], font: FONT_BODY, size: 18, color: '6B7280' }),
                new TextRun({ text: ' of ', font: FONT_BODY, size: 18, color: '6B7280' }),
                new TextRun({ children: [PageNumber.TOTAL_PAGES], font: FONT_BODY, size: 18, color: '6B7280' }),
              ],
            }),
          ],
        }),
      },
      children,
    },
  ],
});

Packer.toBuffer(doc).then((buffer) => {
  fs.writeFileSync(OUT, buffer);
  console.log('Wrote', OUT, '(' + buffer.length + ' bytes)');
});
