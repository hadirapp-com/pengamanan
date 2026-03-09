export type FunctionComponent = React.ReactElement | null;

type HeroIconSVGProps = React.PropsWithoutRef<React.SVGProps<SVGSVGElement>> &
  React.RefAttributes<SVGSVGElement>;
type IconProps = HeroIconSVGProps & {
  title?: string;
  titleId?: string;
};
export type Heroicon = React.FC<IconProps>;

export type Province = {
  id: string;
  province_id: string;
  name: string;
};

export type Regency = {
  id: string;
  regency_id: string;
  name: string;
};

export type District = {
  id: string;
  district_id: string;
  name: string;
};

export type GeneralResponse = {
  message: string;
};

export type Token = {
  accessToken: string;
  refreshToken: string;
};

export type Profile = {
  id: string;
  // accountType?: AccountType;
  schoolName?: string;
  schoolId?: string;
  companyId?: string;
  companyName?: string;
  studentId?: string;
  level?: "SD" | "SMP" | "SMA";
  studentname?: string;
  active?: boolean;
  picture?: string;
  role?: string;
};

// export type ProfileItem = {
//   schoolName: string;
//   schoolId: string;
//   accountType: string;
//   role: string;
//   roleName: string;
//   active: boolean;
// };

// export type Profile = {
//   id: string;
//   email: string;
//   name: string;
//   dob?: string | null;
//   birthPlace?: string | null;
//   profiles: Array<ProfileItem>;
// };

export type User = {
  id: string;
  email: string;
  name: string;
  dob?: string;
  birthPlace?: string;
  profiles: Array<Profile>;
};

export type ShortKehadiranDescription = "S" | "I" | "A" | "D" | "H";
export type KehadiranDescription =
  | "Sakit"
  | "Izin"
  | "Alpa"
  | "Dispensasi"
  | "Hadir";

export type DayName =
  | "senin"
  | "selasa"
  | "rabu"
  | "kamis"
  | "jumat"
  | "sabtu"
  | "minggu";

export type DayNameEng =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

export type StaffService = {
  id: string;
  name: string;
};

export type OpenDay = {
  open: boolean;
  start?: string | Date;
  end?: string | Date;
  dayName: DayName;
};
