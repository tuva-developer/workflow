import React from "react";
import { TablePagination, TablePaginationProps } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import CustomTablePaginationActions from "@/components/common/CustomTablePaginationActions";

type CustomTablePaginationProps = TablePaginationProps;

const CustomTablePagination: React.FC<CustomTablePaginationProps> = (props) => {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <TablePagination
      rowsPerPageOptions={[10, 25, 50, 100]}
      component="div"
      labelRowsPerPage={t("Page size")}
      labelDisplayedRows={({ from, to, count }) =>
        `${from}-${to} ${t("of")} ${
          count !== -1 ? `${count} ${t("items")}` : `more than ${to}`
        }`
      }
      sx={{
        mt: 1,
        flexShrink: 0,
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2,
        backgroundColor: theme.palette.background.default,
        "& .MuiTablePagination-displayedRows, .MuiTablePagination-selectLabel":
          {
            fontSize: 13,
            color: theme.palette.text.secondary,
          },
      }}
      ActionsComponent={CustomTablePaginationActions}
      {...props}
    />
  );
};

export default CustomTablePagination;