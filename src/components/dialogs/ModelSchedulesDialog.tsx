import React, { useCallback } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemText,
  Chip,
  Stack,
  Typography,
  Divider,
  Box,
  Paper,
  IconButton,
  useTheme,
  FormControlLabel,
  Switch,
} from "@mui/material";
import { useAppContext } from "@/hooks/useAppContext";
import { dialogStyles } from "@/styles/styles";
import { formatDate } from "@/utils/defines";
import { useTranslation } from "react-i18next";
import { RiCalendarScheduleLine } from "react-icons/ri";
import { MdDelete } from "react-icons/md";
import ActionButton from "@/components/common/ActionButton";
import { useSchedulesQuery } from "@/hooks/query/useSchedulesQuery";
import { useDeleteSchedule, useUpdateSchedule } from "@/hooks/mutations/useScheduleMutations";

type ModelSchedulesDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  modelId: string;
};

const ModelSchedulesDialog: React.FC<ModelSchedulesDialogProps> = ({
  isOpen,
  onClose,
  modelId,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const { openConfirm, closeConfirm } = useAppContext();

  const { data } = useSchedulesQuery({ modelId }, isOpen);
  const schedules = data?.items ?? [];

  const deleteScheduleMutation = useDeleteSchedule();
  const updateScheduleMutation = useUpdateSchedule();

  const handleDeleteSchedule = useCallback(
    (scheduleId: string) => {
      openConfirm({
        title: t("Delete Schedule"),
        message: t("Are you sure you want to delete this schedule?"),
        onOk: () => {
          deleteScheduleMutation.mutate(
            { scheduleId },
            {
              onSettled: () => closeConfirm(),
            }
          );
        },
      });
    },
    [deleteScheduleMutation, t, openConfirm, closeConfirm]
  );

  function handleActiveChange(scheduleId: string, isActive: boolean) {
    updateScheduleMutation.mutate({ scheduleId, active: isActive });
  }

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      sx={dialogStyles(theme)}
    >
      <DialogTitle>
        <Typography sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <RiCalendarScheduleLine size={18} />
          {t("Scheduling history")}
        </Typography>
        <IconButton onClick={onClose}>×</IconButton>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ p: 0.5 }}>
          {schedules.length === 0 ? (
            <Stack
              alignItems="center"
              justifyContent="center"
              sx={{ py: 6 }}
              spacing={1}
            >
              <Typography sx={{ fontWeight: 600, fontSize: 15 }}>
                {t("No schedules")}
              </Typography>
              <Typography
                color="text.secondary"
                sx={{ fontWeight: 400, fontSize: 13 }}
              >
                {t("There are no schedules for this model.")}
              </Typography>
            </Stack>
          ) : (
            <Paper
              variant="outlined"
              sx={{ overflow: "hidden", borderRadius: 2 }}
            >
              <List disablePadding>
                {schedules.map((schedule) => (
                  <ListItem
                    key={schedule._id}
                    divider
                    alignItems="flex-start"
                    sx={{
                      py: 1.25,
                      px: 2,
                    }}
                  >
                    <ListItemText
                      primaryTypographyProps={{ component: "div" }}
                      secondaryTypographyProps={{ component: "div" }}
                      primary={
                        <Stack
                          direction="row"
                          spacing={1}
                          alignItems="center"
                          flexWrap="wrap"
                        >
                          <Typography sx={{ fontWeight: 600, fontSize: 14 }}>
                            {schedule.name || t("(Untitled)")}
                          </Typography>
                          <Chip
                            size="small"
                            label={
                              schedule.once
                                ? t("One-time")
                                : t("Recurring (cron)")
                            }
                            sx={{ borderRadius: 1.5, fontSize: 13 }}
                          />

                          <FormControlLabel
                            control={
                              <Switch
                                size="small"
                                checked={schedule.active}
                                onChange={(e) =>
                                  handleActiveChange(
                                    schedule._id,
                                    e.target.checked
                                  )
                                }
                                color="success"
                              />
                            }
                            label={
                              schedule.active ? t("Active") : t("Inactive")
                            }
                            sx={{ "& .MuiTypography-root": { fontSize: 13 } }}
                          />

                          <ActionButton
                            icon={<MdDelete size={16} />}
                            color={theme.palette.error.main}
                            tooltip={t("Delete schedule")}
                            onClick={() => handleDeleteSchedule(schedule._id)}
                          />
                        </Stack>
                      }
                      secondary={
                        <Stack spacing={0.75} sx={{ mt: 0.5 }}>
                          {schedule.description && (
                            <Typography
                              color="text.secondary"
                              noWrap
                              sx={{ fontWeight: 400, fontSize: 13 }}
                            >
                              {schedule.description}
                            </Typography>
                          )}
                          {!schedule.once && (
                            <Typography variant="caption">
                              {t("Cron:")} {schedule.cron || "—"}
                            </Typography>
                          )}
                          <Stack
                            direction={{ xs: "column", sm: "row" }}
                            spacing={1}
                            divider={
                              <Divider orientation="vertical" flexItem />
                            }
                            alignItems={{ xs: "flex-start", sm: "center" }}
                          >
                            <Typography variant="caption">
                              {t("Created at")}:{" "}
                              {formatDate(schedule.created_at) || "—"}
                            </Typography>
                            <Typography variant="caption">
                              {t("Updated at")}:{" "}
                              {formatDate(schedule.updated_at) || "—"}
                            </Typography>
                            <Typography variant="caption">
                              {t("Creator")}: {schedule.creator || "—"}
                            </Typography>
                            <Typography variant="caption">
                              {t("ID")}: {schedule._id}
                            </Typography>
                          </Stack>
                        </Stack>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default ModelSchedulesDialog;
