import { Button, Box } from "@mui/material";
import { styled } from "@mui/system";

export const dialogStyles = (theme) => ({
  '& .MuiDialog-paper': {
    borderRadius: 2,
    backgroundColor: theme.palette.background.default,
    border: `1px solid ${theme.palette.divider}`,
  },
  '& .MuiDialogTitle-root': {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.palette.background.default,
    padding: '8px 24px',
  },
  '& .MuiDialogTitle-root p': {
    fontSize: '15px',
    fontWeight: 600,
    color: theme.palette.text.primary,
  },
  '& .MuiDialogTitle-root button': {
    color: theme.palette.text.secondary,
    width: 40,
    height: 40,
  },
  '& .MuiDialogContent-root': {
    backgroundColor: theme.palette.background.default,
  },
  '& .MuiDialogActions-root': {
    padding: '8px 24px',
    backgroundColor: theme.palette.background.default,
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 0.5,
  },
  '& .MuiDialogActions-root button': {
    minWidth: 60,
    padding: '4px 8px',
    fontSize: '12px',
    fontWeight: 400,
    textTransform: 'none',
    borderRadius: 1,
    '&:disabled': {
      backgroundColor: theme.palette.action.disabledBackground,
      color: theme.palette.text.disabled,
      borderColor: theme.palette.divider,
      cursor: 'not-allowed',
    },
  },
  '& .MuiDialogActions-root button.blue': {
    color: theme.palette.common.white,
    backgroundColor: theme.palette.primary.main,
    border: `1px solid ${theme.palette.primary.main}`,
    '&:hover': {
      backgroundColor: theme.palette.primary.light,
      border: `1px solid ${theme.palette.primary.light}`,
    },
  },
  '& .MuiDialogActions-root button.red': {
    color: theme.palette.common.white,
    backgroundColor: theme.palette.error.main,
    border: `1px solid ${theme.palette.error.main}`,
    '&:hover': {
      backgroundColor: theme.palette.error.light,
      border: `1px solid ${theme.palette.error.light}`,
    },
  },
  '& .MuiDialogActions-root button.Mui-disabled': {
    backgroundColor: theme.palette.action.disabledBackground,
    color: theme.palette.text.disabled,
    cursor: "not-allowed",
  },
});

export const tableStyles = (theme) => ({
  flex: 1,
  overflow: "auto",
  borderRadius: 1,
  border: `1px solid ${theme.palette.divider}`,
  boxShadow: "none",
  backgroundColor: theme.palette.background.default,
  marginBottom: 0.5,

  "& .MuiTableHead-root .MuiTableRow-root": {
    backgroundColor: theme.palette.background.default,
    "& th": {
      position: "sticky",
      top: 0,
      zIndex: 2,
      color: theme.palette.primary.main,
      fontWeight: 500,
      fontSize: 13,
      borderBottom: `1px solid ${theme.palette.divider}`,
    },
    "& th:not(:last-of-type)::after": {
      content: '""',
      position: "absolute",
      top: "20%",
      bottom: "20%",
      right: 0,
      width: "1px",
      backgroundColor: theme.palette.divider,
    },
    "& th:hover": {
      backgroundColor: theme.palette.action.hover,
    },
  },

  "& .MuiTableBody-root .MuiTableRow-root": {
    backgroundColor: theme.palette.background.default,
    "& td": {
      borderBottom: `1px solid ${theme.palette.divider}`,
      fontSize: 13,
    },
    "&:hover": {
      backgroundColor: theme.palette.action.hover,
    },
    "&:last-of-type td": {
      borderBottom: "none",
    },
  },
});

export const ToolbarButton = styled(Button)(({ theme }) => ({
  minWidth: 40,
  width: 40,
  height: 40,
  borderRadius: 6,
  backgroundColor: theme.palette.background.default,
  color: theme.palette.text.primary,
  border: `1px solid ${theme.palette.divider}`,

  "&:hover": {
    border: `1px solid ${theme.palette.primary.main}`,
    color: theme.palette.common.white,
    backgroundColor: theme.palette.primary.main,
  },
}));

export const ToolbarButtonRed = styled(ToolbarButton)(({ theme }) => ({
  "&:hover": {
    border: `1px solid ${theme.palette.error.main}`,
    color: theme.palette.common.white,
    backgroundColor: theme.palette.error.main,
  },
}));

export const Divider = styled(Box)(({ theme }) => ({
  width: '2px',
  height: '32px',
  backgroundColor: theme.palette.divider,
  margin: '0 2px',
  borderRadius: 1,
}));

export const StatusColors: Record<string, string> = {
  completed: "#28a745",
  failed: "#ef4444",
  pending: "#FFB823",
  running: "#007bff",
  "not executed": "#FF7D29",
  error: "#B91C1C",
};