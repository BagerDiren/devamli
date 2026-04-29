"""
Insert four annotated code blocks into the user-edited Word report,
just before the heading of Section 6 ("6. Final Version").
The script:
  - unpacks the .docx (zip)
  - inserts new XML paragraphs at the chosen anchor
  - repacks, overwriting the original file
The user's edits to existing paragraphs are preserved as-is.
"""

import os
import re
import shutil
import sys
import zipfile

if sys.stdout.encoding and sys.stdout.encoding.lower() != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

USERPROFILE = os.environ.get('USERPROFILE', '')
SRC = os.path.join(USERPROFILE, 'Desktop', 'Devamli_Report_BagerDirenKarakoyun_210513250.docx')
TEMP = os.environ.get('TEMP', os.path.join(USERPROFILE, 'AppData', 'Local', 'Temp'))
WORK = os.path.join(TEMP, 'code_inject')


def esc(t: str) -> str:
    return t.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')


def para(text: str, bold: bool = False, italic: bool = False) -> str:
    r_pr_inner = '<w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/><w:sz w:val="22"/>'
    if bold:
        r_pr_inner += '<w:b/>'
    if italic:
        r_pr_inner += '<w:i/>'
    return (
        '<w:p>'
        '<w:pPr><w:spacing w:after="120" w:line="300"/><w:jc w:val="both"/></w:pPr>'
        f'<w:r><w:rPr>{r_pr_inner}</w:rPr>'
        f'<w:t xml:space="preserve">{esc(text)}</w:t></w:r>'
        '</w:p>'
    )


def code_line(text: str) -> str:
    safe = esc(text) if text else ' '
    return (
        '<w:p>'
        '<w:pPr>'
        '<w:spacing w:after="0" w:line="260"/>'
        '<w:ind w:left="360"/>'
        '<w:shd w:val="clear" w:color="auto" w:fill="F3F4F6"/>'
        '</w:pPr>'
        '<w:r>'
        '<w:rPr><w:rFonts w:ascii="Consolas" w:hAnsi="Consolas"/><w:sz w:val="19"/></w:rPr>'
        f'<w:t xml:space="preserve">{safe}</w:t>'
        '</w:r>'
        '</w:p>'
    )


def code_block(code: str) -> str:
    return ''.join(code_line(line) for line in code.split('\n'))


def heading2(text: str) -> str:
    return (
        '<w:p>'
        '<w:pPr>'
        '<w:pStyle w:val="Heading2"/>'
        '<w:spacing w:before="240" w:after="120"/>'
        '</w:pPr>'
        '<w:r>'
        '<w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/><w:b/><w:sz w:val="26"/><w:color w:val="111827"/></w:rPr>'
        f'<w:t xml:space="preserve">{esc(text)}</w:t>'
        '</w:r>'
        '</w:p>'
    )


parts = []
parts.append(heading2('Code highlights from the development stage'))
parts.append(para(
    'Below I want to walk through four small but important pieces of code that I think capture how the app actually works. I have kept the snippets short and focused so the discussion stays meaningful instead of turning into a code dump.'
))

# === A: Stack Navigator ===
parts.append(para('1) Setting up the four screens with a native stack navigator (App.js)', bold=True))
parts.append(code_block(
"""<Stack.Navigator screenOptions={{ contentStyle: { backgroundColor: colors.background } }}>
  <Stack.Screen name="Home" component={HomeScreen}
                options={{ headerShown: false }} />
  <Stack.Screen name="AddCourse" component={AddCourseScreen}
                options={{ title: 'New Course', presentation: 'modal' }} />
  <Stack.Screen name="CourseDetail" component={CourseDetailScreen}
                options={{ headerShown: false }} />
  <Stack.Screen name="MarkSession" component={MarkSessionScreen}
                options={{ title: 'Mark Session', presentation: 'modal' }} />
</Stack.Navigator>"""
))
parts.append(para(
    'I deliberately mixed two presentation styles here. The Home and Course Detail screens use a normal push transition because they are the "main" screens the user is navigating between. The Add Course and Mark Session screens, on the other hand, are presented as iOS modals (presentation: "modal") because they represent a temporary task: the user creates a course or records a session, then dismisses the sheet to go back. This makes the app feel native to iPhone users who are already used to swiping down to cancel a task, and it also keeps the Home screen completely free of clutter while the form is on top.'
))

# === B: useFocusEffect ===
parts.append(para('2) Refreshing the home screen every time it becomes visible (HomeScreen.js)', bold=True))
parts.append(code_block(
"""useFocusEffect(
  useCallback(() => {
    refresh();
  }, [refresh])
);"""
))
parts.append(para(
    'My first version used the regular useEffect hook, which only ran once when the Home screen mounted. As I described in the Challenges section, this meant new courses I added in the Add Course modal did not appear on the list until I killed and relaunched the app, which obviously felt broken. Switching to useFocusEffect from React Navigation fixed the problem cleanly: every time the user comes back to the Home screen (either after adding a course or after coming out of the Course Detail screen), the loader runs again and the FlatList re-renders with the latest data. It is a one-line difference but it really captures the value of using a navigation library that understands the lifecycle of screens, instead of treating them as plain components.'
))

# === C: Form validation ===
parts.append(para('3) Validating user input before saving (AddCourseScreen.js)', bold=True))
parts.append(code_block(
"""const handleSave = async () => {
  if (!name.trim()) {
    Alert.alert('Missing name', 'Please enter the name of the course.');
    return;
  }
  const wh = Number(weeklyHours);
  if (!Number.isFinite(wh) || wh <= 0) {
    Alert.alert('Invalid value', 'Weekly hours must be a positive number.');
    return;
  }
  // similar checks for total weeks and absence limit (0 .. 100)
  // …
  await saveCourses(upsertCourse(existing, course));
  navigation.goBack();
};"""
))
parts.append(para(
    'Before I save anything to AsyncStorage I make sure the inputs make sense, otherwise the statistics function would later divide by zero or read NaN. I chose Alert.alert instead of inline error messages for two reasons: it is the platform-native way to surface a validation problem on iOS, and it keeps the form layout clean even when something goes wrong. Each branch returns early so the function reads top-to-bottom, which I find easier to review than nesting everything inside one big if expression. Only when every check passes do I call saveCourses and navigate back.'
))

# === D: Date stepper ===
parts.append(para('4) A simple date stepper instead of a native picker (MarkSessionScreen.js)', bold=True))
parts.append(code_block(
"""const shiftDate = (days) => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  setDate(d.toISOString());
};

// JSX
<TouchableOpacity onPress={() => shiftDate(-1)}><Text>−1 day</Text></TouchableOpacity>
<View><Text>{formatDate(date)}</Text></View>
<TouchableOpacity onPress={() => shiftDate(+1)}><Text>+1 day</Text></TouchableOpacity>"""
))
parts.append(para(
    'For the Mark Session form I needed a date input. The default React Native DateTimePicker requires extra setup and looks completely different on iOS versus Android, which felt too heavy for a form that is mostly used to record "today" or "yesterday". Instead I built two simple buttons that step the date by one day at a time, plus a "Set to today" link below them. This kept the implementation tiny, the UI consistent across platforms, and made the most common use case (one tap on Set to today, then save) basically instant. It is a good example of choosing a small custom solution over a heavier library when the problem is narrow.'
))

INSERTION = ''.join(parts)

# === Unpack, inject, repack ===
shutil.rmtree(WORK, ignore_errors=True)
os.makedirs(WORK, exist_ok=True)
with zipfile.ZipFile(SRC, 'r') as z:
    z.extractall(WORK)

doc_path = os.path.join(WORK, 'word', 'document.xml')
with open(doc_path, 'r', encoding='utf-8') as f:
    xml = f.read()

target = '6. Final '  # Word splits "Final Version" across runs; use a stable prefix
idx = xml.find(target)
if idx == -1:
    raise SystemExit(f'Anchor "{target}" not found in document.xml')

p_start = xml.rfind('<w:p>', 0, idx)
p_start_alt = xml.rfind('<w:p ', 0, idx)
candidates = [c for c in (p_start, p_start_alt) if c != -1]
if not candidates:
    raise SystemExit('Cannot find <w:p> opening before anchor')
p_start = max(candidates)

new_xml = xml[:p_start] + INSERTION + xml[p_start:]

with open(doc_path, 'w', encoding='utf-8') as f:
    f.write(new_xml)

# Repack
if os.path.exists(SRC):
    os.remove(SRC)
with zipfile.ZipFile(SRC, 'w', zipfile.ZIP_DEFLATED) as z:
    for root, _dirs, files in os.walk(WORK):
        for fn in files:
            fp = os.path.join(root, fn)
            ap = os.path.relpath(fp, WORK).replace('\\', '/')
            z.write(fp, ap)

print(f'Wrote {SRC}')
print(f'Inserted XML bytes: {len(INSERTION):,}')
print(f'Final document.xml size: {len(new_xml):,}')
