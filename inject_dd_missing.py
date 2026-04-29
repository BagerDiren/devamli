"""Add the four missing Detailed Discussion subsections (sections 2, 6, 7, 8)
that the previous run could not anchor.
"""

import os
import shutil
import sys
import zipfile

if sys.stdout.encoding and sys.stdout.encoding.lower() != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

USERPROFILE = os.environ.get('USERPROFILE', '')
SRC = os.path.join(USERPROFILE, 'Desktop', 'Devamli_Report_BagerDirenKarakoyun_210513250.docx')
TEMP = os.environ.get('TEMP', os.path.join(USERPROFILE, 'AppData', 'Local', 'Temp'))
WORK = os.path.join(TEMP, 'dd_missing')


def esc(t):
    return t.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')


def para(text):
    return (
        '<w:p>'
        '<w:pPr><w:spacing w:after="120" w:line="300"/><w:jc w:val="both"/></w:pPr>'
        '<w:r>'
        '<w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/><w:sz w:val="22"/></w:rPr>'
        f'<w:t xml:space="preserve">{esc(text)}</w:t>'
        '</w:r>'
        '</w:p>'
    )


def heading2(text):
    return (
        '<w:p>'
        '<w:pPr>'
        '<w:pStyle w:val="Heading2"/>'
        '<w:spacing w:before="280" w:after="140"/>'
        '</w:pPr>'
        '<w:r>'
        '<w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/><w:b/><w:sz w:val="26"/><w:color w:val="111827"/></w:rPr>'
        f'<w:t xml:space="preserve">{esc(text)}</w:t>'
        '</w:r>'
        '</w:p>'
    )


def block(title, paragraphs):
    out = heading2(title)
    for p in paragraphs:
        out += para(p)
    return out


DD = {}

DD[2] = block('Detailed discussion — Project Idea', [
    "The choice of \"a class attendance tracker\" looks simple on paper, but I want to explain why it is genuinely different from the suggestions in the assignment. To-Do lists and notes apps are domain-agnostic; they do not carry any rule that the app is responsible for enforcing. A water reminder is closer, but its rule (drink eight glasses) is a soft target with no real consequences. Devamlı, by contrast, has a hard institutional rule baked into it — the 30% absence limit — and the entire UI is organised around making that rule visible at all times. That is what makes the idea feel like an actual product instead of a class exercise.",
    "I also want to acknowledge a limitation of the idea. The app currently assumes the student knows the syllabus parameters (weekly hours, total weeks, allowed percentage) and enters them by hand. A more polished version would integrate with the university's information system to import the schedule automatically, which would remove a real friction point. I left that out on purpose because the assignment scope is one student building one app in one week, and I would rather ship a small thing that fully works than a big thing that half works.",
])

DD[6] = block('Detailed discussion — Final Version', [
    "The Final Version section is largely a tour through the screenshots, but I want to highlight what is hidden between them. Each transition the screenshots imply (empty Home → Add Course → populated Home → Course Detail → Mark Session → updated Course Detail) is a complete user journey: the user goes from \"I have nothing\" to \"my course is being tracked and I have one recorded session\" without ever leaving the app or seeing any loading state. That smoothness is the result of the small UX decisions made earlier — modals for tasks, useFocusEffect for freshness, immediate AsyncStorage writes — coming together.",
    "What the screenshots do not show is the reliability story. After taking these images I closed the app fully, reopened it, and saw the exact same data I had entered moments before. That is the AsyncStorage write working invisibly. The student would not even think about that property of the app under normal use, which is exactly how persistence should feel: invisible until it fails. The app's resilience to being killed mid-session is itself a feature, even if there is no visible badge for it.",
])

DD[7] = block('Detailed discussion — Challenges and Solutions', [
    "What I find interesting about the challenges in this section is that almost none of them are about the core algorithm — getStats was correct on the first try and never caused me trouble. Every challenge is about the boundary between my code and the platform: filesystem paths on Windows, the navigation lifecycle, the iOS keyboard, the difference between mutable and immutable updates that React quietly relies on. That is a useful lesson in itself: when learning a new platform, the algorithmic part is rarely the bottleneck; the bottleneck is internalising the platform's contracts.",
    "Solving each challenge taught me a different debugging skill. The path issue taught me to test on the actual environment as early as possible. useFocusEffect taught me to read the documentation of the framework, not just StackOverflow snippets that may pre-date a feature. The KeyboardAvoidingView issue taught me to test forms with the on-screen keyboard, not only with the simulator's hardware keyboard. Together these are the kind of lessons that I think will outlast this assignment and make the next React Native project less painful from day one.",
])

DD[8] = block('Detailed discussion — Conclusion', [
    "The conclusion has two layers and I want to separate them. On one layer, the project meets every concrete requirement of the assignment — the four screens work, data persists, the rule is enforced visually, the code is organised, the report is written. That part is verifiable and I do not need to argue for it. On the other layer, the project succeeded at something I did not put in the rubric for myself: it produced a tool I will actually keep on my phone. That second outcome is what makes the difference between an exercise I forget the moment it is graded and a habit-forming piece of software.",
    "I also want to be honest about what the conclusion is not claiming. The app does not have a calendar view, push notifications, multiple users, syncing across devices, or any analytics. Those features are realistic next steps but every one of them carries its own complexity, and a one-week individual project is exactly the wrong place to attempt them. Naming the missing features explicitly here is, I think, more useful than pretending the project is feature-complete.",
])

# Anchors based on inspection: section number + ". " (Word kept these as their own short run)
ANCHORS = [
    (2, '3. '),  # Section 2 ends right before heading "3."
    (6, '7. '),  # Section 6 ends right before heading "7."
    (7, '8. '),  # Section 7 ends right before heading "8."
    (8, '9. '),  # Section 8 ends right before heading "9."
]

# Unpack
shutil.rmtree(WORK, ignore_errors=True)
os.makedirs(WORK, exist_ok=True)
with zipfile.ZipFile(SRC, 'r') as z:
    z.extractall(WORK)

doc_path = os.path.join(WORK, 'word', 'document.xml')
with open(doc_path, 'r', encoding='utf-8') as f:
    xml = f.read()


def find_p_for_anchor(xml: str, anchor: str) -> int:
    """Find the position of the <w:p> opening containing the FIRST occurrence of `anchor`."""
    idx = xml.find(anchor)
    if idx == -1:
        return -1
    p_start = xml.rfind('<w:p>', 0, idx)
    p_start_alt = xml.rfind('<w:p ', 0, idx)
    candidates = [c for c in (p_start, p_start_alt) if c != -1]
    return max(candidates) if candidates else -1


# Process from LAST to FIRST so byte offsets stay valid
for sec, anchor in reversed(ANCHORS):
    pos = find_p_for_anchor(xml, anchor)
    if pos == -1:
        print(f'WARN: anchor "{anchor}" for section {sec} not found, skipping')
        continue
    xml = xml[:pos] + DD[sec] + xml[pos:]
    print(f'Inserted DD for section {sec} at position {pos}')

with open(doc_path, 'w', encoding='utf-8') as f:
    f.write(xml)

if os.path.exists(SRC):
    os.remove(SRC)
with zipfile.ZipFile(SRC, 'w', zipfile.ZIP_DEFLATED) as z:
    for root, _dirs, files in os.walk(WORK):
        for fn in files:
            fp = os.path.join(root, fn)
            ap = os.path.relpath(fp, WORK).replace('\\', '/')
            z.write(fp, ap)

print(f'\nWrote {SRC}')
print(f'Final document.xml size: {len(xml):,}')
