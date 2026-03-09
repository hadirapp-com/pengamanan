export const userEndpoint = {
  root: "/users",
  userDetail: "/users/:id",
};

export const customerEndpoint = {
  root: "/customers",
  customerDetail: "/customers/:id",
};

export const deliveryEndpoint = {
  root: "/deliveries",
  userDetail: "/deliveries/:id",
  import: "/deliveries/import",
  export: "/deliveries/export",
  revision: "/deliveries/revision",
  lotReport: "/deliveries/hpm/lot",
  lotUnlock: "/deliveries/hpm/lot/unlock",
  lotStatus: "/deliveries/hpm/lot/status",
};

export const partsEndpoint = {
  root: "/parts",
  partsDetail: "/parts/:id",
  import: "/parts/import",
  export: "/parts/export",
  template: "/parts/template/download",
  printHistory: "/parts/print-history",
  labelColors: "/parts/label-colors",
};

export const scanLogsEndpoint = {
  root: "/scan-logs",
  scanLogDetail: "/scan-logs/:id",
};

export const configEndpoint = {
  root: "/configs",
  configDetail: "/configs/:key",
};

export const academicYearEndpoint = {
  root: "/api/v1/academic-year/",
};

export const branchEndpoint = {
  root: "/api/v1/branch/",
};

export const staffEndpoint = {
  root: "/api/v1/staff/",
};

export const subjectEndpoint = {
  root: "/api/v1/subject/",
  academicSubject: "/api/v1/subject/:schoolId/academic-subject",
  academicSubjectDetail: "/api/v1/subject/:schoolId/academic-subject/:id",
};

export const classEndpoint = {
  root: "/api/v1/class/",
  academicClass: "/api/v1/class/:schoolId/academic-class",
  academicClassAttendance: "/api/v1/class/:schoolId/academic-class/attendance",
  academicClassDetail: "/api/v1/class/:schoolId/academic-class/:id",
};

export const teacherEndpoint = {
  root: "/api/v1/teacher/",
  academicTeacher: "/api/v1/teacher/:schoolId/academic-teacher",
  academicTeacherDetail: "/api/v1/teacher/:schoolId/academic-teacher/:id",
};

export const attendanceEndpoint = {
  root: "/api/v1/attendance",
  dailyAttendance: "/api/v1/attendance/daily-attendance/:schoolId",
  subjectAttendance: "/api/v1/attendance/subject-attendance/:schoolId",
  dailyAttendanceClass:
    "/api/v1/attendance/daily-attendance/:schoolId/:academiClassId",
};

export const studentEndpoint = {
  root: "/api/v1/student/",
  academicStudent: "/api/v1/student/:schoolId/academic-student",
  academicStudentDetail: "/api/v1/student/:schoolId/academic-student/:id",
};

export const scheduleEndpoint = {
  root: "/api/v1/schedule/",
  classSchedule: "/api/v1/schedule/:schoolId/class-schedule",
  classScheduleDetail: "/api/v1/schedule/:schoolId/class-schedule/:id",
};

export const configurationEndpoint = {
  root: "/api/v1/config/",
  schoolConfig: "/api/v1/config/school/",
  roles: "/api/v1/config/roles",
};

export const authEndpoint = {
  me: "/auth/me",
  login: "/auth/login",
  userInfo: "/api/v1/auth/user-info",
  register: "/api/v1/auth/register",
  code: "/api/v1/auth/code",
  codeVerification: "/api/v1/auth/code/verify",
  user: "/api/v1/auth",
  logout: "/api/v1/auth/logout",
  refreshToken: "/api/v1/auth/refresh-token",
};

export const accessRequestEndpoint = {
  root: "/api/v1/access-request/",
};

export const wilayahIndonesiaEndpoint = {
  provinces: "https://www.emsifa.com/api-wilayah-indonesia/api/provinces.json",
  regencies: (provinceId: string) =>
    `https://www.emsifa.com/api-wilayah-indonesia/api/regencies/${provinceId}.json`,
  districts: (regencyId: string) =>
    `https://www.emsifa.com/api-wilayah-indonesia/api/districts/${regencyId}.json`,
  villages: (districtId: string) =>
    `https://www.emsifa.com/api-wilayah-indonesia/api/villages/${districtId}.json`,
};
