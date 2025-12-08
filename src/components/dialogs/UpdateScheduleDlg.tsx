import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  IconButton,
  Typography,
  useTheme,
  FormControlLabel,
  Checkbox,
  Divider,
  Autocomplete,
  TextField,
} from "@mui/material";
import dayjs, { Dayjs } from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { dialogStyles } from "@/styles/styles";
import { useTranslation } from "react-i18next";
import { showWarn } from "@/utils/toastConfig";
import InputSchedule from "@/components/dialogs/InputSchedule";
import CustomSelect from "@/components/common/CustomSelect";
import CustomTextField from "@/components/common/CustomTextField";
import ModelSchedulesDialog from "@/components/dialogs/ModelSchedulesDialog";
import { useUpdateSchedule } from "@/hooks/mutations/useScheduleMutations"; // giả định có hook này

type TriggerType = "Interval" | "Timepoint";
type TriggerInterval =
  | "Seconds"
  | "Minutes"
  | "Hours"
  | "Days"
  | "Weeks"
  | "Months";

interface UpdateScheduleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  schedule: Schedule | null;
  refreshData?: () => void;
}

const UpdateScheduleDialog: React.FC<UpdateScheduleDialogProps> = ({
  isOpen,
  onClose,
  schedule,
  refreshData,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();

  const [scheduleName, setScheduleName] = useState("");
  const [scheduleType, setScheduleType] = useState("");
  const [scheduleDescription, setScheduleDescription] = useState("");
  const [triggerType, setTriggerType] = useState<TriggerType>("Interval");
  const [isOnce, setIsOnce] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [dataInput, setDataInput] = useState<Record<string, unknown>>({});

  const [triggerInterval, setTriggerInterval] =
    useState<TriggerInterval>("Seconds");
  const [secondsBetweenTriggers, setSecondsBetweenTriggers] = useState(1);
  const [minutesBetweenTriggers, setMinutesBetweenTriggers] = useState(1);
  const [hoursBetweenTriggers, setHoursBetweenTriggers] = useState(1);
  const [daysBetweenTriggers, setDaysBetweenTriggers] = useState(1);
  const [triggerAtMinute, setTriggerAtMinute] = useState(0);
  const [triggerAtHour, setTriggerAtHour] = useState(0);
  const [weekDays, setWeekDays] = useState<number[]>([1, 2, 3, 4, 5]);

  const [monthsBetweenTriggers, setMonthsBetweenTriggers] = useState(1);
  const [daysOfMonth, setDaysOfMonth] = useState<number[]>([1]);

  const [timepoint, setTimepoint] = useState<Dayjs | null>(dayjs());

  const [isOpenSetDataInput, setIsOpenSetDataInput] = useState(false);
  const [isOpenViewSchedules, setIsOpenViewSchedules] = useState(false);

  const updateScheduleMutation = useUpdateSchedule();

  const triggerTypeOptions = [
    { value: "Interval", label: t("Interval") },
    { value: "Timepoint", label: t("Timepoint") },
  ];

  const triggerIntervalOptions = [
    { value: "Seconds", label: t("Seconds") },
    { value: "Minutes", label: t("Minutes") },
    { value: "Hours", label: t("Hours") },
    { value: "Days", label: t("Days") },
    { value: "Weeks", label: t("Weeks") },
    { value: "Months", label: t("Months") },
  ];

  const triggerAtHourOptions = Array.from({ length: 24 }, (_, h) => ({
    value: h,
    label: dayjs().hour(h).minute(0).format("hA"),
  }));

  const weekDayOptions = [
    { value: 1, label: t("Monday") },
    { value: 2, label: t("Tuesday") },
    { value: 3, label: t("Wednesday") },
    { value: 4, label: t("Thursday") },
    { value: 5, label: t("Friday") },
    { value: 6, label: t("Saturday") },
    { value: 0, label: t("Sunday") },
  ];

  const clampMinute = useCallback(
    (v: number) =>
      Number.isFinite(v) ? Math.max(0, Math.min(59, Math.trunc(v))) : 0,
    []
  );

  const min1 = useCallback(
    (v: number) => (Number.isFinite(v) && v >= 1 ? Math.trunc(v) : 1),
    []
  );

  const clampDom = useCallback(
    (v: number) =>
      Number.isFinite(v) ? Math.max(1, Math.min(31, Math.trunc(v))) : 1,
    []
  );

  const sanitizeDomList = useCallback(
    (arr: number[]) => [...new Set(arr.map(clampDom))].sort((a, b) => a - b),
    [clampDom]
  );

  function formatWeekDaysForCron(days: number[]): string {
    const sorted = Array.from(new Set(days)).sort((a, b) => a - b);
    if (!sorted.length) return "";
    const out: string[] = [];
    let start = sorted[0],
      prev = sorted[0];
    for (let i = 1; i < sorted.length; i++) {
      const cur = sorted[i];
      if (cur === prev + 1) {
        prev = cur;
        continue;
      }
      out.push(start === prev ? `${start}` : `${start}-${prev}`);
      start = prev = cur;
    }
    out.push(start === prev ? `${start}` : `${start}-${prev}`);
    return out.join(",");
  }

  function expandCronRangeList(list: string): number[] {
    if (!list || list === "*") return [];
    const parts = list.split(",");
    const result: number[] = [];
    for (const p of parts) {
      if (p.includes("-")) {
        const [a, b] = p.split("-").map((x) => parseInt(x, 10));
        if (Number.isFinite(a) && Number.isFinite(b) && a <= b) {
          for (let v = a; v <= b; v++) result.push(v);
        }
      } else {
        const v = parseInt(p, 10);
        if (Number.isFinite(v)) result.push(v);
      }
    }
    return Array.from(new Set(result)).sort((a, b) => a - b);
  }

  function buildCronExpression(type: TriggerType): string {
    if (type === "Interval") {
      switch (triggerInterval) {
        case "Days":
          return `0 ${triggerAtMinute} ${triggerAtHour} */${min1(
            daysBetweenTriggers
          )} * *`;
        case "Hours":
          return `0 ${triggerAtMinute} */${min1(hoursBetweenTriggers)} * * *`;
        case "Minutes":
          return `0 */${min1(minutesBetweenTriggers)} * * * *`;
        case "Seconds":
          return `*/${min1(secondsBetweenTriggers)} * * * * *`;
        case "Weeks": {
          const dow = formatWeekDaysForCron(weekDays);
          return `0 ${triggerAtMinute} ${triggerAtHour} * * ${dow}`;
        }
        case "Months": {
          const list = sanitizeDomList(daysOfMonth);
          const dayField = list.join(",");
          return `0 ${triggerAtMinute} ${triggerAtHour} ${dayField} */${min1(
            monthsBetweenTriggers
          )} *`;
        }
      }
    }
    const time = timepoint!.toDate();
    return `${time.getSeconds()} ${time.getMinutes()} ${time.getHours()} ${time.getDate()} ${
      time.getMonth() + 1
    } *`;
  }

  function validate(): boolean {
    if (!scheduleName.trim()) {
      showWarn(t("Please enter a name"));
      return false;
    }

    if (triggerType === "Interval") {
      if (triggerInterval === "Seconds" && secondsBetweenTriggers < 1) {
        showWarn(t("Seconds must be ≥ 1"));
        return false;
      }
      if (triggerInterval === "Minutes" && minutesBetweenTriggers < 1) {
        showWarn(t("Minutes must be ≥ 1"));
        return false;
      }
      if (triggerInterval === "Hours" && hoursBetweenTriggers < 1) {
        showWarn(t("Hours must be ≥ 1"));
        return false;
      }
      if (triggerInterval === "Days" && daysBetweenTriggers < 1) {
        showWarn(t("Days must be ≥ 1"));
        return false;
      }
      if (triggerInterval === "Weeks" && weekDays.length === 0) {
        showWarn(t("Please select at least one weekday"));
        return false;
      }
      if (triggerInterval === "Months") {
        if (monthsBetweenTriggers < 1) {
          showWarn(t("Months must be ≥ 1"));
          return false;
        }
        const cleaned = sanitizeDomList(daysOfMonth);
        if (!cleaned.length) {
          showWarn(t("Please select at least one day of month"));
          return false;
        }
      }
    } else {
      if (!timepoint || !timepoint.isValid()) {
        showWarn(t("Please select a valid date and time!"));
        return false;
      }
    }

    return true;
  }

  useEffect(() => {
    if (!schedule) return;

    setScheduleName(schedule.name ?? "");
    setScheduleType(schedule.type ?? "");
    setScheduleDescription(schedule.description ?? "");
    setIsOnce(!!schedule.once);
    setIsActive(schedule.active !== false);
    setDataInput(schedule.input ?? {});

    const raw = (schedule.cron || "").trim().replace(/\s+/g, " ");
    const fields = raw.split(" ");
    if (fields.length !== 6) {
      return;
    }
    const [S, M, H, DOM, MON, DOW] = fields;

    const isStep = (f: string) => /^(\*\/\d+)$/.test(f);
    const stepValue = (f: string) => parseInt(f.split("/")[1], 10) || 1;

    const maybeInt = (s: string) =>
      Number.isFinite(parseInt(s, 10)) ? parseInt(s, 10) : null;
    const isSpecific = (s: string) => /^\d+$/.test(s);

    const looksTimepoint =
      isSpecific(S) &&
      isSpecific(M) &&
      isSpecific(H) &&
      isSpecific(DOM) &&
      isSpecific(MON) &&
      DOW === "*";

    if (looksTimepoint) {
      setTriggerType("Timepoint");
      const sec = maybeInt(S) ?? 0;
      const min = maybeInt(M) ?? 0;
      const hr = maybeInt(H) ?? 0;
      const dom = maybeInt(DOM) ?? 1;
      const mon = maybeInt(MON) ?? 1;
      const tp = dayjs()
        .month(mon - 1)
        .date(dom)
        .hour(hr)
        .minute(min)
        .second(sec);
      setTimepoint(tp);
      return;
    }

    setTriggerType("Interval");

    if (
      isStep(S) &&
      M === "*" &&
      H === "*" &&
      DOM === "*" &&
      MON === "*" &&
      DOW === "*"
    ) {
      setTriggerInterval("Seconds");
      setSecondsBetweenTriggers(stepValue(S));
      return;
    }

    if (
      S === "0" &&
      isStep(M) &&
      H === "*" &&
      DOM === "*" &&
      MON === "*" &&
      DOW === "*"
    ) {
      setTriggerInterval("Minutes");
      setMinutesBetweenTriggers(stepValue(M));
      return;
    }

    if (
      S === "0" &&
      !isStep(M) &&
      isSpecific(M) &&
      isStep(H) &&
      DOM === "*" &&
      MON === "*" &&
      DOW === "*"
    ) {
      setTriggerInterval("Hours");
      setTriggerAtMinute(parseInt(M, 10));
      setHoursBetweenTriggers(stepValue(H));
      return;
    }

    if (
      S === "0" &&
      !isStep(M) &&
      isSpecific(M) &&
      !isStep(H) &&
      isSpecific(H) &&
      /^(\*\/\d+)$/.test(DOM)
    ) {
      setTriggerInterval("Days");
      setTriggerAtMinute(parseInt(M, 10));
      setTriggerAtHour(parseInt(H, 10));
      setDaysBetweenTriggers(stepValue(DOM));
      return;
    }

    if (
      S === "0" &&
      isSpecific(M) &&
      isSpecific(H) &&
      DOM === "*" &&
      MON === "*" &&
      DOW !== "*"
    ) {
      setTriggerInterval("Weeks");
      setTriggerAtMinute(parseInt(M, 10));
      setTriggerAtHour(parseInt(H, 10));
      setWeekDays(expandCronRangeList(DOW));
      return;
    }

    if (
      S === "0" &&
      isSpecific(M) &&
      isSpecific(H) &&
      MON.startsWith("*/") &&
      DOW === "*"
    ) {
      setTriggerInterval("Months");
      setTriggerAtMinute(parseInt(M, 10));
      setTriggerAtHour(parseInt(H, 10));
      setMonthsBetweenTriggers(stepValue(MON));
      const domList = DOM.split(",")
        .map((x) => parseInt(x, 10))
        .filter((v) => Number.isFinite(v));
      setDaysOfMonth(sanitizeDomList(domList));
      return;
    }

    if (
      S === "0" &&
      isSpecific(M) &&
      isSpecific(H) &&
      DOM === "*" &&
      MON === "*" &&
      DOW === "*"
    ) {
      setTriggerInterval("Days");
      setTriggerAtMinute(parseInt(M, 10));
      setTriggerAtHour(parseInt(H, 10));
      setDaysBetweenTriggers(1);
      return;
    }

    if (
      S === "0" &&
      isSpecific(M) &&
      H === "*" &&
      DOM === "*" &&
      MON === "*" &&
      DOW === "*"
    ) {
      setTriggerInterval("Hours");
      setTriggerAtMinute(parseInt(M, 10));
      setHoursBetweenTriggers(1);
      return;
    }

    setTriggerInterval("Minutes");
  }, [schedule, sanitizeDomList, t]);

  function handleSave() {
    if (!validate() || !schedule) return;

    updateScheduleMutation.mutate(
      {
        scheduleId: schedule._id,
        name: scheduleName.trim(),
        type: scheduleType.trim(),
        description: scheduleDescription.trim(),
        cron: buildCronExpression(triggerType),
        once: isOnce,
        active: isActive,
        data: dataInput,
      },
      {
        onSuccess: () => {
          refreshData?.();
          onClose?.();
        },
      }
    );
  }

  function handleClose() {
    onClose();
  }

  const canSubmit = useMemo(() => {
    if (!scheduleName.trim()) return false;

    if (triggerType === "Timepoint") {
      return (
        !!timepoint &&
        typeof timepoint?.isValid === "function" &&
        timepoint.isValid()
      );
    }

    switch (triggerInterval) {
      case "Seconds":
        return secondsBetweenTriggers >= 1;
      case "Minutes":
        return minutesBetweenTriggers >= 1;
      case "Hours":
        return hoursBetweenTriggers >= 1;
      case "Days":
        return daysBetweenTriggers >= 1;
      case "Weeks":
        return weekDays.length > 0;
      case "Months": {
        const cleaned = sanitizeDomList(daysOfMonth);
        return monthsBetweenTriggers >= 1 && cleaned.length > 0;
      }
      default:
        return true;
    }
  }, [
    scheduleName,
    triggerType,
    timepoint,
    triggerInterval,
    secondsBetweenTriggers,
    minutesBetweenTriggers,
    hoursBetweenTriggers,
    daysBetweenTriggers,
    weekDays,
    monthsBetweenTriggers,
    daysOfMonth,
    sanitizeDomList,
  ]);

  const dayOptions = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <>
      <Dialog
        open={isOpen}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        sx={dialogStyles(theme)}
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography>{t("Update schedule")}</Typography>
          <IconButton onClick={onClose}>×</IconButton>
        </DialogTitle>

        <DialogContent>
          <CustomTextField
            label={t("Name")}
            value={scheduleName}
            onChange={(e) => setScheduleName(e.target.value)}
          />

          <CustomTextField
            label={t("Type")}
            value={scheduleType}
            onChange={(e) => setScheduleType(e.target.value)}
          />

          <CustomTextField
            label={t("Description")}
            value={scheduleDescription}
            onChange={(e) => setScheduleDescription(e.target.value)}
          />

          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mt: 1 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={isOnce}
                  onChange={(e) => setIsOnce(e.target.checked)}
                  color="primary"
                />
              }
              label={t("Run once")}
              sx={{ "& .MuiFormControlLabel-label": { fontSize: 13 } }}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  color="primary"
                />
              }
              label={t("Enable schedule")}
              sx={{ "& .MuiFormControlLabel-label": { fontSize: 13 } }}
            />
          </Box>

          <CustomSelect
            fullWidth
            label={t("Trigger type")}
            value={triggerType}
            onChange={(e) => setTriggerType(e.target.value as TriggerType)}
            options={triggerTypeOptions}
          />

          {triggerType === "Interval" ? (
            <>
              <CustomSelect
                fullWidth
                label={t("Trigger interval")}
                value={triggerInterval}
                onChange={(e) =>
                  setTriggerInterval(e.target.value as TriggerInterval)
                }
                options={triggerIntervalOptions}
              />

              <Divider sx={{ pt: 1 }} />

              {triggerInterval === "Seconds" && (
                <Box mt={2}>
                  <CustomTextField
                    label={t("Seconds between triggers")}
                    value={secondsBetweenTriggers}
                    onChange={(e) =>
                      setSecondsBetweenTriggers(
                        min1(parseInt(e.target.value || "1", 10))
                      )
                    }
                  />
                </Box>
              )}

              {triggerInterval === "Minutes" && (
                <Box mt={2}>
                  <CustomTextField
                    label={t("Minutes between triggers")}
                    value={minutesBetweenTriggers}
                    onChange={(e) =>
                      setMinutesBetweenTriggers(
                        min1(parseInt(e.target.value || "1", 10))
                      )
                    }
                  />
                </Box>
              )}

              {triggerInterval === "Hours" && (
                <Box
                  mt={2}
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { sm: "1fr 1fr" },
                    gap: 2,
                  }}
                >
                  <CustomTextField
                    label={t("Hours between triggers")}
                    value={hoursBetweenTriggers}
                    onChange={(e) =>
                      setHoursBetweenTriggers(
                        min1(parseInt(e.target.value || "1", 10))
                      )
                    }
                  />
                  <CustomTextField
                    label={t("Trigger at minute")}
                    value={triggerAtMinute}
                    onChange={(e) =>
                      setTriggerAtMinute(
                        clampMinute(parseInt(e.target.value || "0", 10))
                      )
                    }
                  />
                </Box>
              )}

              {triggerInterval === "Days" && (
                <Box
                  mt={2}
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { sm: "1fr 1fr 1fr" },
                    gap: 2,
                  }}
                >
                  <CustomTextField
                    label={t("Days between triggers")}
                    value={daysBetweenTriggers}
                    onChange={(e) =>
                      setDaysBetweenTriggers(
                        min1(parseInt(e.target.value || "1", 10))
                      )
                    }
                  />
                  <CustomSelect
                    fullWidth
                    label={t("Trigger at hour")}
                    value={triggerAtHour}
                    onChange={(e) =>
                      setTriggerAtHour(
                        Number((e.target as HTMLInputElement).value)
                      )
                    }
                    options={triggerAtHourOptions}
                  />
                  <CustomTextField
                    label={t("Trigger at minute")}
                    value={triggerAtMinute}
                    onChange={(e) =>
                      setTriggerAtMinute(
                        clampMinute(parseInt(e.target.value || "0", 10))
                      )
                    }
                  />
                </Box>
              )}

              {triggerInterval === "Weeks" && (
                <Box mt={2}>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                    {weekDayOptions.map((d) => {
                      const checked = weekDays.includes(d.value);
                      return (
                        <FormControlLabel
                          key={d.value}
                          control={
                            <Checkbox
                              checked={checked}
                              onChange={(e) => {
                                const v = Number(d.value);
                                setWeekDays((prev) =>
                                  e.target.checked
                                    ? [...new Set([...prev, v])]
                                    : prev.filter((x) => x !== v)
                                );
                              }}
                              color="primary"
                            />
                          }
                          label={d.label}
                          sx={{
                            "& .MuiFormControlLabel-label": { fontSize: 13 },
                          }}
                        />
                      );
                    })}
                  </Box>

                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: { sm: "1fr 1fr" },
                      gap: 2,
                      mt: 2,
                    }}
                  >
                    <CustomSelect
                      fullWidth
                      label={t("Trigger at hour")}
                      value={triggerAtHour}
                      onChange={(e) =>
                        setTriggerAtHour(
                          Number((e.target as HTMLInputElement).value)
                        )
                      }
                      options={triggerAtHourOptions}
                    />
                    <CustomTextField
                      label={t("Trigger at minute")}
                      value={triggerAtMinute}
                      onChange={(e) =>
                        setTriggerAtMinute(
                          clampMinute(parseInt(e.target.value || "0", 10))
                        )
                      }
                    />
                  </Box>
                </Box>
              )}

              {triggerInterval === "Months" && (
                <>
                  <Box
                    mt={2}
                    sx={{
                      display: "grid",
                      gridTemplateColumns: { sm: "1fr 1fr 1fr" },
                      gap: 2,
                    }}
                  >
                    <CustomTextField
                      label={t("Months between triggers")}
                      value={monthsBetweenTriggers}
                      onChange={(e) =>
                        setMonthsBetweenTriggers(
                          min1(parseInt(e.target.value || "1", 10))
                        )
                      }
                    />
                    <CustomSelect
                      fullWidth
                      label={t("Trigger at hour")}
                      value={triggerAtHour}
                      onChange={(e) =>
                        setTriggerAtHour(
                          Number((e.target as HTMLInputElement).value)
                        )
                      }
                      options={triggerAtHourOptions}
                    />
                    <CustomTextField
                      label={t("Trigger at minute")}
                      value={triggerAtMinute}
                      onChange={(e) =>
                        setTriggerAtMinute(
                          clampMinute(parseInt(e.target.value || "0", 10))
                        )
                      }
                    />
                  </Box>
                  <Box mt={2}>
                    <Autocomplete<number, true, false, false>
                      multiple
                      options={dayOptions}
                      value={daysOfMonth}
                      onChange={(_, value) =>
                        setDaysOfMonth(sanitizeDomList(value))
                      }
                      getOptionLabel={(option) => String(option)}
                      isOptionEqualToValue={(option, value) => option === value}
                      renderInput={(params) => (
                        <TextField {...params} label={t("Days of month")} />
                      )}
                      sx={{ width: "100%" }}
                    />
                  </Box>
                </>
              )}
            </>
          ) : (
            <Box mt={2} sx={{ width: "100%" }}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DateTimePicker
                  label={t("Select date and time")}
                  value={timepoint}
                  onChange={(newValue) => {
                    if (newValue) setTimepoint(newValue);
                    else {
                      setTimepoint(dayjs());
                      showWarn(t("Please select a valid date and time!"));
                    }
                  }}
                  views={[
                    "year",
                    "month",
                    "day",
                    "hours",
                    "minutes",
                    "seconds",
                  ]}
                  format="YYYY-MM-DD HH:mm:ss"
                  sx={{ width: "100%" }}
                />
              </LocalizationProvider>
            </Box>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={handleSave} className="blue" disabled={!canSubmit}>
            {t("Save changes")}
          </Button>
          <Button onClick={() => setIsOpenSetDataInput(true)} className="blue">
            {t("Set data input")}
          </Button>
          {schedule?.modelId && (
            <Button
              onClick={() => setIsOpenViewSchedules(true)}
              className="blue"
            >
              {t("Scheduling history")}
            </Button>
          )}
          <Button onClick={handleClose} className="red">
            {t("Cancel")}
          </Button>
        </DialogActions>
      </Dialog>

      <InputSchedule
        open={isOpenSetDataInput}
        onClose={() => setIsOpenSetDataInput(false)}
        data={dataInput}
        setData={setDataInput}
      />

      {schedule?.modelId && (
        <ModelSchedulesDialog
          isOpen={isOpenViewSchedules}
          onClose={() => setIsOpenViewSchedules(false)}
          modelId={schedule.modelId}
        />
      )}
    </>
  );
};

export default UpdateScheduleDialog;
