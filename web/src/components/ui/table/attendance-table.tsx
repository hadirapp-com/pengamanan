import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

export interface AttendanceTableFormProps {
  data: Array<{
    class: string;
    nisn: string;
    name: string;
    present: boolean;
    attendanceType?: string;
    attachment?: string | null;
  }>;
  column: Array<string>;
  loading: boolean;
  error?: string;
  updateValue: (index: number, obj: object) => void;
}

export function AttendanceTableForm(props: AttendanceTableFormProps) {
  const { data, column, loading, updateValue, error } = props;
  return (
    <div>
      {error && <div className="text-center text-destructive">{error}</div>}
      <Table>
        {loading && (
          <TableCaption>
            <p className="text-center">Loading...</p>
          </TableCaption>
        )}

        <TableHeader>
          <TableRow>
            {column.map((item, idx) => (
              <TableHead key={idx}>{item}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {!loading &&
            data.map((item, index) => {
              const { nisn, name, attachment } = item;
              return (
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                <TableRow key={item.id}>
                  <TableCell className="font-medium whitespace-nowrap">
                    {name}
                  </TableCell>
                  <TableCell>{nisn}</TableCell>
                  <TableCell>{item.class}</TableCell>
                  <TableCell className="">
                    <Switch
                      checked={item.present}
                      onCheckedChange={(present) => {
                        let attendanceType = item.attendanceType;
                        attendanceType = present ? 'Hadir' : '';
                        updateValue(index, {
                          ...item,
                          present,
                          attendanceType,
                        });
                      }}
                    />
                  </TableCell>
                  <TableCell className="">
                    <ToggleGroup
                      disabled={item.attendanceType === 'Hadir'}
                      value={item.attendanceType}
                      type="single"
                      className="p-0 m-0 flex justify-start"
                      onValueChange={(attendanceType) => {
                        updateValue(index, { ...item, attendanceType });
                      }}
                    >
                      <ToggleGroupItem
                        className="data-[state=on]:bg-primary data-[state=on]:text-white"
                        value="Sakit"
                      >
                        S
                      </ToggleGroupItem>
                      <ToggleGroupItem
                        className="data-[state=on]:bg-primary data-[state=on]:text-white"
                        value="Izin"
                      >
                        I
                      </ToggleGroupItem>
                      <ToggleGroupItem
                        className="data-[state=on]:bg-primary data-[state=on]:text-white"
                        value="Alpa"
                      >
                        A
                      </ToggleGroupItem>
                      <ToggleGroupItem
                        className="data-[state=on]:bg-primary data-[state=on]:text-white"
                        value="Dispensasi"
                      >
                        D
                      </ToggleGroupItem>
                    </ToggleGroup>
                  </TableCell>
                  <TableCell className="">{attachment}</TableCell>
                </TableRow>
              );
            })}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={column.length}>
              Jumlah Siswa: {data.length}
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
}
