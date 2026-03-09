// import { createScheduleHours } from '@/utils/time-picker-utils';

import type { OpenDay } from '@/types/common';

export const GENERAL_SUCCESS_TEXT = 'Sukses';
export const GENERAL_ERROR_TEXT = 'Terjadi kesalahan';

export const GRADES = [
  'I',
  'II',
  'III',
  'IV',
  'V',
  'VI',
  'VII',
  'VIII',
  'IX',
  'X',
  'XI',
  'XII',
];

export const GRADE_LEVELS = {
  SD: ['I', 'II', 'III', 'IV', 'V', 'VI'],
  SMP: ['VII', 'VIII', 'IX'],
  SMA: ['X', 'XI', 'XII'],
};

export const SCHOOL_LEVELS = ['SD', 'SMA', 'SMP'];

export const GENDER = ['L', 'P'];

export const accountTypeList = [
  'school_admin',
  'student',
  'company_admin',
  'parent',
  'teacher',
  'alumni',
  'public',
  'administrator',
];

export const DATA_TABLE_PAGE_SIZE_OPTIONS = [5, 10, 25, 50, 100];

export const ACCOUNT_HAS_SETTING = ['company_admin', 'school_admin'];

export const TOKEN_EXPIRED = 'FAST_JWT_EXPIRED';

export const CURRENT_ACADEMIC_YEAR = 'CURRENT_ACADEMIC_YEAR';

export const MIN_CALENDAR_YEAR = new Date().getFullYear() - 5;
export const MIN_CALENDAR_YEAR_DOB = new Date().getFullYear() - 55;
export const MAX_CALENDAR_YEAR = new Date().getFullYear() + 3;
export const CURRENT_CALENDAR_YEAR = new Date().getFullYear();
// export const SCHEDULE_HOURS = createScheduleHours();
export const SCHEDULE_MINUTES = ['00', '15', '30', '45'];
export const SCHEDULE_DAYS = [
  { label: 'Senin', value: false },
  { label: 'Selasa', value: false },
  { label: 'Rabu', value: false },
  { label: 'Kamis', value: false },
  { label: 'Jumat', value: false },
  { label: 'Sabtu', value: false },
  { label: 'Minggu', value: false },
];

export const KEHADIRAN = {
  S: 'Sakit',
  I: 'Izin',
  A: 'Alpa',
  D: 'Dispensasi',
  H: 'Hadir',
};

export const defaultMenus = [
  {
    title: 'Dashboard',
    href: '/app',
    icon: 'dashboard',
    label: 'Dashboard',
    disabled: false,
    hasChildren: false,
  },
  {
    title: 'Permintaan Akses',
    href: '/app/access-request',
    icon: 'Key',
    label: 'Key',
    disabled: false,
    hasChildren: false,
  },
];

export const schoolAdminMenus = [
  {
    title: 'Dashboard',
    href: '/app',
    icon: 'dashboard',
    label: 'Dashboard',
    disabled: false,
    hasChildren: false,
  },
  {
    title: 'Permintaan Akses',
    href: '/app/access-request',
    icon: 'Key',
    label: 'Key',
    disabled: false,
    hasChildren: false,
  },
  {
    title: 'Master Data',
    href: '/app/master/academic-year',
    icon: 'FolderCog',
    label: 'FolderCog',
    disabled: false,
    hasChildren: true,
  },
  {
    title: 'Tahun Ajaran',
    href: '/app/master/academic-year',
    icon: 'Dot',
    label: '',
    disabled: false,
    hasChildren: false,
  },
  {
    title: 'Mata Pelajaran',
    href: '/app/master/subject',
    icon: 'Dot',
    label: '',
    disabled: false,
    hasChildren: false,
  },
  {
    title: 'Kelas',
    href: '/app/master/class',
    icon: 'Dot',
    label: '',
    disabled: false,
    hasChildren: false,
  },
  {
    title: 'Guru',
    href: '/app/master/teacher',
    icon: 'Dot',
    label: '',
    disabled: false,
    hasChildren: false,
  },
  {
    title: 'Siswa',
    href: '/app/master/student',
    icon: 'Dot',
    label: '',
    disabled: false,
    hasChildren: false,
  },
  {
    title: 'Alumni',
    href: '/app/master/alumni',
    icon: 'Dot',
    label: '',
    disabled: false,
    hasChildren: false,
  },
  {
    title: 'Ujian',
    href: '/app/master/exam',
    icon: 'Dot',
    label: '',
    disabled: false,
    hasChildren: false,
  },
  {
    title: 'Tugas',
    href: '/app/master/task',
    icon: 'Dot',
    label: '',
    disabled: false,
    hasChildren: false,
  },
  {
    title: 'Tahun Berjalan',
    href: '/app/trx/subject',
    icon: 'CalendarDays',
    label: 'CalendarDays',
    disabled: false,
    hasChildren: true,
  },
  {
    title: 'Mata Pelajaran',
    href: '/app/trx/subject',
    icon: 'Dot',
    label: '',
    disabled: false,
    hasChildren: false,
  },
  {
    title: 'Kelas',
    href: '/app/trx/class',
    icon: 'Dot',
    label: '',
    disabled: false,
    hasChildren: false,
  },
  {
    title: 'Guru',
    href: '/app/trx/teacher',
    icon: 'Dot',
    label: '',
    disabled: false,
    hasChildren: false,
  },
  {
    title: 'Siswa',
    href: '/app/trx/student',
    icon: 'Dot',
    label: '',
    disabled: false,
    hasChildren: false,
  },
  {
    title: 'Jadwal',
    href: '/app/trx/schedule',
    icon: 'Dot',
    label: '',
    disabled: false,
    hasChildren: false,
  },
  // {
  //   title: 'Penilaian MaPel',
  //   href: '/app/trx/subject-evaluation',
  //   icon: 'Dot',
  //   label: '',
  //   disabled: false,
  //   hasChildren: false,
  // },
  {
    title: 'KBM',
    href: '/app/kbm/subject-attendance',
    icon: 'CalendarClock',
    label: 'CalendarClock',
    disabled: false,
    hasChildren: true,
  },
  {
    title: 'Absensi MaPel',
    href: '/app/kbm/subject-attendance',
    icon: 'Dot',
    label: '',
    disabled: false,
    hasChildren: false,
  },
  {
    title: 'Absensi Harian',
    href: '/app/kbm/daily-attendance',
    icon: 'Dot',
    label: '',
    disabled: false,
    hasChildren: false,
  },
  // {
  //   title: 'Penilaian Siswa',
  //   href: '/app/kbm/student-evaluation',
  //   icon: 'Dot',
  //   label: '',
  //   disabled: false,
  //   hasChildren: false,
  // },
  {
    title: 'Laporan',
    href: '/app/report/student-attendance-report',
    icon: 'FileSpreadsheet',
    label: 'FileSpreadsheet',
    disabled: false,
    hasChildren: true,
  },
  {
    title: 'Absensi',
    href: '/app/setting/school-config',
    icon: 'Dot',
    label: '',
    disabled: false,
    hasChildren: false,
  },
  {
    title: 'Pengaturan',
    href: '/app/setting/school-config',
    icon: 'Cog',
    label: 'Cog',
    disabled: false,
    hasChildren: true,
  },
  {
    title: 'Umum',
    href: '/app/setting/school-config',
    icon: 'Dot',
    label: '',
    disabled: false,
    hasChildren: false,
  },
];

export const teacherMenus = [
  {
    title: 'Dashboard',
    href: '/app',
    icon: 'dashboard',
    label: 'Dashboard',
    disabled: false,
    hasChildren: false,
  },
  {
    title: 'Permintaan Akses',
    href: '/app/access-request',
    icon: 'Key',
    label: 'Key',
    disabled: false,
    hasChildren: false,
  },
  {
    title: 'Tahun Berjalan',
    href: '/app/trx/subject',
    icon: 'CalendarDays',
    label: 'CalendarDays',
    disabled: false,
    hasChildren: true,
  },
  {
    title: 'Jadwal',
    href: '/app/trx/schedule',
    icon: 'Dot',
    label: '',
    disabled: false,
    hasChildren: false,
  },
  {
    title: 'KBM',
    href: '/app/kbm/subject-attendance',
    icon: 'CalendarClock',
    label: 'CalendarClock',
    disabled: false,
    hasChildren: true,
  },
  {
    title: 'Absensi MaPel',
    href: '/app/kbm/subject-attendance',
    icon: 'Dot',
    label: '',
    disabled: false,
    hasChildren: false,
  },
];

export const companyAdminMenus = [
  {
    title: 'Dashboard',
    href: '/app',
    icon: 'dashboard',
    label: 'Dashboard',
    disabled: false,
    hasChildren: false,
  },
  {
    title: 'Master Data',
    href: '/app/master/branch',
    icon: 'FolderCog',
    label: 'FolderCog',
    disabled: false,
    hasChildren: true,
  },
  {
    title: 'Cabang',
    href: '/app/master/branch',
    icon: 'Dot',
    label: '',
    disabled: false,
    hasChildren: false,
  },
  {
    title: 'Staff',
    href: '/app/master/staff',
    icon: 'Dot',
    label: '',
    disabled: false,
    hasChildren: false,
  },
  {
    title: 'Service',
    href: '/app/master/service',
    icon: 'Dot',
    label: '',
    disabled: false,
    hasChildren: false,
  },
  {
    title: 'Akses',
    href: '/app/master/access',
    icon: 'Dot',
    label: '',
    disabled: false,
    hasChildren: false,
  },
  {
    title: 'Booking',
    href: '/app/booking/booking',
    icon: 'FolderCog',
    label: 'FolderCog',
    disabled: false,
    hasChildren: true,
  },
  {
    title: 'Cabang',
    href: '/app/booking/booking',
    icon: 'Dot',
    label: '',
    disabled: false,
    hasChildren: false,
  },
  // {
  //   title: 'Staff',
  //   href: '/app/master/staff',
  //   icon: 'Dot',
  //   label: '',
  //   disabled: false,
  //   hasChildren: false,
  // },
  {
    title: 'Permintaan Akses',
    href: '/app/access-request',
    icon: 'Key',
    label: 'Key',
    disabled: false,
    hasChildren: false,
  },
];

export type TNavItems = typeof defaultMenus;

// Error constant
export const ERROR_UPDATE_DELETE_REFERENCE = 'violates foreign key constraint';
export const ERR_BAD_REQUEST = 'ERR_BAD_REQUEST';

export const defaultOpenDays: Array<OpenDay> = [
  {
    dayName: 'senin',
    open: false,
    start: '00:00',
    end: '00:00',
  },
  {
    dayName: 'selasa',
    open: false,
    start: '00:00',
    end: '00:00',
  },
  {
    dayName: 'rabu',
    open: false,
    start: '00:00',
    end: '00:00',
  },
  {
    dayName: 'kamis',
    open: false,
    start: '00:00',
    end: '00:00',
  },
  {
    dayName: 'jumat',
    open: false,
    start: '00:00',
    end: '00:00',
  },
  {
    dayName: 'sabtu',
    open: false,
    start: '00:00',
    end: '00:00',
  },
  {
    dayName: 'minggu',
    open: false,
    start: '00:00',
    end: '00:00',
  },
];
