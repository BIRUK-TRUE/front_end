#!/usr/bin/env python3
"""Merge missing keys from en.json into am.json with Amharic translations."""

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
EN_PATH = ROOT / "messages" / "en.json"
AM_PATH = ROOT / "messages" / "am.json"

# Amharic translations for keys present in en but missing in am
TRANSLATIONS: dict[str, str] = {
    "academics.addNewClass": "አዲስ ክፍል ጨምር",
    "academics.addNewSection": "አዲስ ክፍል ጨምር",
    "academics.addNewSubject": "አዲስ ትምህርት ጨምር",
    "academics.addNewTerm": "አዲስ ሴሚስተር ጨምር",
    "academics.addNewYear": "አዲስ የትምህርት ዓመት ጨምር",
    "academics.classModalDesc": "ለዚህ የትምህርት ዓመት አዲስ ክፍል (ለምሳሌ ደረጃ 9) ይፍጠሩ።",
    "academics.classModalEditDesc": "የዚህ ክፍል ዝርዝሮችን ያዘምኑ።",
    "academics.core": "መሰረታዊ",
    "academics.editClass": "ክፍል አርትዕ",
    "academics.editSection": "ክፍል አርትዕ",
    "academics.editSubject": "ትምህርት አርትዕ",
    "academics.editTerm": "ሴሚስተር አርትዕ",
    "academics.editYear": "የትምህርት ዓመት አርትዕ",
    "academics.elective": "አማራጭ",
    "academics.noHomeroomTeacher": "የክፍል መምህር የለም",
    "academics.sectionModalDesc": "ለተመረጠው ክፍል አዲስ ክፍል (ለምሳሌ A, B, ሰማያዊ) ይጨምሩ።",
    "academics.sectionModalEditDesc": "ለዚህ ክፍል ዝርዝሮችን ያዘምኑ።",
    "academics.selectCategory": "ምድብ ይምረጡ",
    "academics.selectTeacher": "መምህር ይምረጡ",
    "academics.subjectModalDesc": "ወደ ሥነ-ትምህርቱ አዲስ ትምህርት ይጨምሩ።",
    "academics.subjectModalEditDesc": "የዚህ ትምህርት ዝርዝሮችን ያዘምኑ።",
    "academics.termModalDesc": "ለዚህ የትምህርት ዓመት አዲስ የውጤት ሴሚስተር ይፍጠሩ።",
    "academics.termModalEditDesc": "የዚህ ሴሚስተር ዝርዝሮችን ያዘምኑ።",
    "academics.vocational": "ሙያ",
    "adminLogs.action": "ድርጊት",
    "adminLogs.date": "ቀን",
    "adminLogs.description": "መግለጫ",
    "adminLogs.failed": "አልተሳካም",
    "adminLogs.resource": "መርጃ",
    "adminLogs.searchLogs": "መዝገቦችን ፈልግ...",
    "adminLogs.status": "ሁኔታ",
    "adminLogs.success": "ተሳክቷል",
    "adminLogs.title": "የአስተዳዳሪ እንቅስቃሴ መዝገቦች",
    "adminLogs.user": "ተጠቃሚ",
    "attendance.alreadyTaken": "ለዛሬ ተገኝነት ቀድሞ ተመዝግቧል",
    "attendance.markAllAbsent": "ሁሉንም እንደ ተገኝ ያልተከተሉ ምልክት አድርግ",
    "attendance.markAllPresent": "ሁሉንም እንደ ተገኙ ምልክት አድርግ",
    "attendance.noStudents": "በዚህ ክፍል ውስጥ ተማሪዎች የሉም",
    "attendance.quickActions": "ፈጣን ድርጊቶች",
    "attendance.recordNotePlaceholder": "ማስታወሻ ጨምር...",
    "attendance.selectClass": "ክፍል ይምረጡ",
    "attendance.selectDate": "ቀን ይምረጡ",
    "attendance.statuses.absent": "ጠፍቷል",
    "attendance.statuses.excused": "የተረጋገጠ",
    "attendance.statuses.late": "ዘግይቷል",
    "attendance.statuses.present": "ተገኝቷል",
    "attendance.submit": "ተገኝነት አስገባ",
    "attendance.submitSuccess": "ተገኝነት በተሳካ ሁኔታ ተመዝግቧል",
    "attendance.takeAttendance": "ተገኝነት ይመዝግቡ",
    "attendance.title": "ተገኝነት",
    "attendance.viewRecords": "መዝገቦችን ይመልከቱ",
    "attendancePage.classroomPhoto": "የክፍል ፎቶ",
    "attendancePage.classroomPhotoDesc": "የክፍል ተገኝነት ለመመዝገብ የቡድን ፎቶ ይስቀሉ",
    "classes.additionalInfo": "ተጨማሪ መረጃ",
    "common.aria-breadcrumb": "የመንገድ ምልክት",
    "common.aria-closeSidebar": "የጎን አሞሌ ዝጋ",
    "common.aria-create": "ፍጠር",
    "common.aria-delete": "ሰርዝ",
    "common.aria-edit": "አርትዕ",
    "common.aria-filter": "አጣራ",
    "common.aria-mainNavigation": "ዋና ማሰሻ",
    "common.aria-nextMonth": "ቀጣይ ወር",
    "common.aria-openSidebar": "የጎን አሞሌ ክፈት",
    "common.aria-previousMonth": "ቀድሞ ወር",
    "common.aria-search": "ፈልግ",
    "common.aria-sort": "ደርድል",
    "common.aria-userMenu": "የተጠቃሚ ምናሌ",
    "common.downloadComplete": "ማውረድ በተሳካ ሁኔታ ተጠናቋል",
    "common.downloadFailed": "ፋይል ማውረድ አልተሳካም",
    "common.sections": "ክፍሎች",
    "common.subjects": "ትምህርቶች",
    "faceScan.alreadyEnrolled": "ቀድሞ ተመዝግቧል",
    "faceScan.back": "ተመለስ",
    "faceScan.capturePhoto": "ፎቶ አንሳ",
    "faceScan.enrolledOn": "የተመዘገበበት ቀን",
    "faceScan.enrollmentDesc": "ለራስ-ሰር ተገኝነት እውቅና የተማሪ ፊት ይመዝግቡ።",
    "faceScan.faceEnrollment": "የፊት ምዝገባ",
    "faceScan.recognize": "ፊቶችን ይለዩ",
    "faceScan.retake": "እንደገና አንሳ",
    "faceScan.saveEnrollment": "ምዝገባ አስቀምጥ",
    "faceScan.tip1": "ተማሪው ቀጥ ብሎ ወደ ካሜራ እንዲመለከት ያረጋግጡ",
    "faceScan.tip2": "በተቻለ መጠን ብሩህ እና ቀለም አልባ ዳራ ይጠቀሙ",
    "faceScan.tip3": "ተማሪው ማስኮች ወይም ከባድ መነጽር አይጫን",
    "faceScan.title": "የፊት እውቅና",
    "faceScan.uploadPhoto": "ተገኝነት ለመመዝገብ የክፍል ፎቶ ይስቀሉ",
    "reports.academic": "አካዳሚክ",
    "reports.academicDescription": "የተማሪ ውጤቶች እና የትምህርት ስኬቶች",
    "reports.academicPerformance": "የትምህርት አፈፃፀም",
    "reports.activeTeachers": "ንቁ መምህራን",
    "reports.allSubjects": "ሁሉም ትምህርቶች ተጣምረው",
    "reports.attendance": "ተገኝነት",
    "reports.attendanceByGrade": "በደረጃ ደረጃ ተገኝነት",
    "reports.attendanceDescription": "የተማሪ ተገኝነት ቅርጽ እና አዝማሚያ",
    "reports.attendanceRate": "የተገኝነት መጠን",
    "reports.attendanceReport": "የተገኝነት ሪፖርት",
    "reports.averageGrade": "አማካይ ውጤት",
    "reports.collected": "ተሰብስቧል",
    "reports.collectionRate": "የመሰብሰብ መጠን",
    "reports.description": "በትምህርት ቤት አፈፃፀም እና በስራ ላይ የተሟላ ግንዛቤ",
    "reports.enrollmentTrend": "የምዝገባ አዝማሚያ",
    "reports.exportPayments": "ክፍያዎችን ወደ ውጪ ላክ",
    "reports.exportStaff": "ሠራተኞችን ወደ ውጪ ላክ",
    "reports.exportStudents": "ተማሪዎችን ወደ ውጪ ላክ",
    "reports.financial": "ፋይናንስ",
    "reports.financialDescription": "የክፍያ መሰብሰብ እና የገቢ ትንተና",
    "reports.financialReport": "የፋይናንስ ሪፖርት",
    "reports.gradeDistribution": "የውጤት ስርጭት",
    "reports.overallAttendance": "አጠቃላይ የተገኝነት መጠን",
    "reports.overview": "አጠቃላይ እይታ",
    "reports.overviewDescription": "በትምህርት ቤቱ ውስጥ ዋና መለኪያዎች እና አዝማሚያዎች",
    "reports.pending": "በመጠባበቅ ላይ",
    "reports.pendingPayments": "በመጠባበቅ ላይ ያሉ ክፍያዎች",
    "reports.presentToday": "ዛሬ የተገኙ",
    "reports.schoolOverview": "የትምህርት ቤት አጠቃላይ እይታ",
    "reports.selectYear": "የትምህርት ዓመት ይምረጡ",
    "reports.teacherStudentRatio": "መምህር-ተማሪ ጥምርታ",
    "reports.title": "ሪፖርቶች እና ትንታኔ",
    "reports.totalRevenue": "ጠቅላላ ገቢ",
    "reports.totalStudents": "ጠቅላላ ተማሪዎች",
    "settings.allowRegistration": "አዲስ ምዝገባዎችን ፍቀድ",
    "settings.allowRegistrationDescription": "አዲስ ተጠቃሚ ምዝገባዎችን አንቃ/አጥፋ",
    "settings.backupFrequency": "የምትኬ ድግግሞሽ",
    "settings.backupFrequencyDescription": "ራስ-ሰር ምትኬዎች በምን ድግግሞሽ እንደሚፈጠሩ",
    "settings.backupNow": "አሁን ምትኬ ፍጠር",
    "settings.backupSettings": "የምትኬ ቅንብሮች",
    "settings.backupSettingsDescription": "ራስ-ሰር የዳታቤዝ ምትኬዎችን ያዋቅሩ",
    "settings.clearCache": "የስርዓት መሸጎጫ አጽዳ",
    "settings.clearCacheDescription": "ሁሉንም የተከማቸ ውሂብ ያስወግዱ። ይህ ለጊዜው ስርዓቱን ሊያዘንው ይችላል።",
    "settings.daily": "ዕለታዊ",
    "settings.dangerZone": "አደገኛ ቦታ",
    "settings.dangerZoneDescription": "ጥንቃቄ የሚፈልጉ ሊቀለበሱ የማይችሉ ድርጊቶች",
    "settings.description": "በመላው ስርዓት ቅንብሮችን እና ምርጫዎችን ያዋቅሩ",
    "settings.emailNotifications": "የኢሜይል ማሳወቂያዎች",
    "settings.emailNotificationsDescription": "ማሳወቂያዎችን በኢሜይል ይላኩ",
    "settings.hourly": "በሰዓት",
    "settings.lastBackup": "የመጨረሻ ምትኬ",
    "settings.lastBackupSize": "መጠን",
    "settings.lastBackupTime": "ሰዓት",
    "settings.maintenanceMessage": "የጥገና መልዕክት",
    "settings.maintenanceMessagePlaceholder": "በጥገና ወቅት ለተጠቃሚዎች የሚታይ መልዕክት ያስገቡ...",
    "settings.maintenanceMode": "የጥገና ሁነታ",
    "settings.maintenanceModeDescription": "መዳረሻ ለአስተዳዳሪ ተጠቃሚዎች ብቻ እንዲገደብ የጥገና ሁነታን አንቃ",
    "settings.maintenanceWarning": "ተጠቃሚዎች ስርዓቱን ሲጠቀሙ ይህን መልዕክት ያያሉ",
    "settings.maxLoginAttempts": "ከፍተኛ የግቢ ሙከራዎች",
    "settings.maxLoginAttemptsDescription": "ከዚህ ብዙ የተሳሳቱ ግቢዎች በኋላ መለያ ይቆልፋል",
    "settings.minutes": "ደቂቃዎች",
    "settings.monthly": "ወራዊ",
    "settings.notificationSettings": "የማሳወቂያ ቅንብሮች",
    "settings.notificationSettingsDescription": "ተጠቃሚዎች ማሳወቂያዎችን እንዴት እንደሚቀበሉ ያዋቅሩ",
    "settings.resetSettings": "ወደ ነባሪ ዳግም አስጀምር",
    "settings.securitySettings": "የደህንነት ቅንብሮች",
    "settings.securitySettingsDescription": "ማረጋገጫ እና የደህንነት ፖሊሲዎችን ያዋቅሩ",
    "settings.sessionTimeout": "የክፍለ ጊዜ ጊዜ ማለቂያ",
    "settings.sessionTimeoutDescription": "ከዚህ ቆይታ በኋላ ንቁ ያልሆኑ ተጠቃሚዎችን በራስ-ሰር ያስወጡ",
    "settings.settingsSaved": "ቅንብሮች በተሳካ ሁኔታ ተስቀመዱ",
    "settings.smsNotifications": "የኤስኤምኤስ ማሳወቂያዎች",
    "settings.smsNotificationsDescription": "ማሳወቂያዎችን በኤስኤምኤስ ይላኩ (የኤስኤምኤስ መግቢያ ያስፈልጋል)",
    "settings.systemStatus": "የስርዓት ሁኔታ",
    "settings.systemStatusDescription": "አጠቃላይ የስርዓት ተገኝነት እና መዳረሻን ይቆጣጠሩ",
    "settings.title": "የስርዓት ቅንብሮች",
    "settings.weekly": "ሳምንታዊ",
    "settingsPage.gradeWeights.addConfig": "የክብደት ውቅር ጨምር",
    "settingsPage.gradeWeights.caWeight": "የCA ክብደት (%)",
    "settingsPage.gradeWeights.description": "ለእያንዳንዱ ደረጃ CA እና ፈተናዎች ወደ መጨረሻው ውጤት የሚያበረክቱትን መቶኛ ያስቀምጡ።",
    "settingsPage.gradeWeights.examWeight": "የፈተና ክብደት (%)",
    "settingsPage.gradeWeights.maxGrade": "ከፍተኛ ውጤት",
    "settingsPage.gradeWeights.minGrade": "ዝቅተኛ ውጤት",
    "settingsPage.gradeWeights.title": "ቀጣይነት ያለው ግምገማ እና የፈተና ክብደቶች",
    "settingsPage.gradeWeights.totalMustBe100": "ጠቅላላ ክብደት 100% መሆን አለበት",
    "settingsPage.gradeWeights.weightCreated": "የክብደት ውቅር ተፈጠረ",
    "settingsPage.gradeWeights.weightUpdated": "የክብደት ውቅር ተዘምኗል",
    "settingsPage.gradingScales.addScale": "የውጤት ስኬል ጨምር",
    "settingsPage.gradingScales.description": "የMOE መደበኛ የፊደል ውጤቶች (A+, A, B...) እና የGPA እሴታቸውን ያዋቅሩ።",
    "settingsPage.gradingScales.gpa": "የGPA እሴት",
    "settingsPage.gradingScales.letter": "ፊደል",
    "settingsPage.gradingScales.maxPercent": "ከፍተኛ %",
    "settingsPage.gradingScales.minPercent": "ዝቅተኛ %",
    "settingsPage.gradingScales.scaleCreated": "የውጤት ስኬል ተፈጠረ",
    "settingsPage.gradingScales.scaleUpdated": "የውጤት ስኬል ተዘምኗል",
    "settingsPage.gradingScales.title": "የፊደል ውጤት ስኬሎች",
    "settingsPage.tabs.gradeWeights": "የውጤት ክብደቶች",
    "settingsPage.tabs.gradingScales": "የውጤት ስኬሎች",
    "studentPortal.common.error": "አንድ ነገር ተሳስቷል። እባክዎ እንደገና ይሞክሩ።",
    "studentPortal.common.loading": "በመጫን ላይ...",
    "studentPortal.common.noData": "ምንም ውሂብ የለም",
    "studentPortal.common.retry": "እንደገና ሞክር",
    "studentPortal.common.searchPlaceholder": "ፈልግ...",
    "studentPortal.common.thisTermLabel": "ይህ ሴሚስተር",
    "studentPortal.schedule.periods.period": "ክፍለ ጊዜ {number}",
    "studentPortal.schedule.periods.time": "{start} – {end}",
    "students.studentCreateFailed": "ተማሪ መፍጠር አልተሳካም። ዝርዝሮችን ያረጋግጡ እና እንደገና ይሞክሩ።",
    "students.studentDeleteFailed": "ተማሪ መሰረዝ አልተሳካም",
    "students.studentRestoreFailed": "ተማሪ መመለስ አልተሳካም",
    "students.studentUpdateFailed": "ተማሪ ማዘመን አልተሳካም",
}


def flatten(obj: dict, prefix: str = "") -> dict[str, str]:
    items: dict[str, str] = {}
    for k, v in obj.items():
        p = f"{prefix}.{k}" if prefix else k
        if isinstance(v, dict):
            items.update(flatten(v, p))
        else:
            items[p] = v
    return items


def set_nested(obj: dict, path: str, value: str) -> None:
    parts = path.split(".")
    cur = obj
    for p in parts[:-1]:
        if p not in cur or not isinstance(cur[p], dict):
            cur[p] = {}
        cur = cur[p]
    cur[parts[-1]] = value


def main() -> None:
    with EN_PATH.open(encoding="utf-8") as f:
        en = json.load(f)
    with AM_PATH.open(encoding="utf-8") as f:
        am = json.load(f)

    en_flat = flatten(en)
    am_flat = flatten(am)
    missing = sorted(set(en_flat) - set(am_flat))

    if len(missing) != len(TRANSLATIONS):
        untranslated = [k for k in missing if k not in TRANSLATIONS]
        if untranslated:
            raise SystemExit(f"Missing translations for: {untranslated}")

    for key in missing:
        set_nested(am, key, TRANSLATIONS[key])

    with AM_PATH.open("w", encoding="utf-8") as f:
        json.dump(am, f, ensure_ascii=False, indent=2)
        f.write("\n")

    am_flat_after = flatten(am)
    still_missing = set(en_flat) - set(am_flat_after)
    print(f"Added {len(missing)} keys")
    print(f"Still missing: {len(still_missing)}")
    if still_missing:
        raise SystemExit(f"Keys still missing: {list(still_missing)[:10]}")


if __name__ == "__main__":
    main()
