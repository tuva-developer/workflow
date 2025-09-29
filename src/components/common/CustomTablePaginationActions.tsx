import {
  IconButton,
  Tooltip,
  Typography,
  useTheme,
  Box,
  TextField,
} from "@mui/material";
import {
  MdKeyboardArrowLeft,
  MdKeyboardArrowRight,
  MdFirstPage,
  MdLastPage,
} from "react-icons/md";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

interface TablePaginationActionsProps {
  count: number;
  page: number;
  rowsPerPage: number;
  onPageChange: (
    event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number
  ) => void;
}

const CustomTablePaginationActions = ({
  count,
  page,
  rowsPerPage,
  onPageChange,
}: TablePaginationActionsProps) => {
  const theme = useTheme();
  const { t } = useTranslation();

  const totalPages = Math.max(1, Math.ceil(count / rowsPerPage));
  const [inputPage, setInputPage] = useState<string>(String(page + 1));

  useEffect(() => {
    setInputPage(String(page + 1));
  }, [page]);

  const handleFirstPage = (event: React.MouseEvent<HTMLButtonElement>) =>
    onPageChange(event, 0);

  const handleBack = (event: React.MouseEvent<HTMLButtonElement>) =>
    onPageChange(event, page - 1);

  const handleNext = (event: React.MouseEvent<HTMLButtonElement>) =>
    onPageChange(event, page + 1);

  const handleLastPage = (event: React.MouseEvent<HTMLButtonElement>) =>
    onPageChange(event, totalPages - 1);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    if (/^\d*$/.test(value)) {
      setInputPage(value);
    }
  };

  const handleInputBlur = () => {
    const numericValue = parseInt(inputPage, 10);

    if (!isNaN(numericValue)) {
      const clamped = Math.min(Math.max(numericValue, 1), totalPages);
      if (clamped - 1 !== page) {
        onPageChange(null, clamped - 1);
      }
      setInputPage(String(clamped));
    } else {
      setInputPage(String(page + 1));
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      (e.target as HTMLInputElement).blur();
    }
  };

  return (
    <Box display="flex" alignItems="center">
      <Tooltip title={t("First page")}>
        <span>
          <IconButton
            onClick={handleFirstPage}
            disabled={page === 0}
            size="small"
            sx={{
              color: theme.palette.text.primary,
              "&.Mui-disabled": {
                color: theme.palette.text.disabled,
              },
            }}
          >
            <MdFirstPage />
          </IconButton>
        </span>
      </Tooltip>

      <Tooltip title={t("Previous page")}>
        <span>
          <IconButton
            onClick={handleBack}
            disabled={page === 0}
            size="small"
            sx={{
              color: theme.palette.text.primary,
              "&.Mui-disabled": {
                color: theme.palette.text.disabled,
              },
            }}
          >
            <MdKeyboardArrowLeft />
          </IconButton>
        </span>
      </Tooltip>

      <Box display="flex" alignItems="center" gap={0.5}>
        <TextField
          variant="outlined"
          value={inputPage}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onKeyDown={handleInputKeyDown}
          inputProps={{
            style: {
              textAlign: "center",
              padding: 4,
              fontSize: 12,
              width: 32,
            },
            min: 1,
            max: totalPages,
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: theme.palette.divider,
              },
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: theme.palette.divider,
              },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                border: `1px solid ${theme.palette.primary.light}`,
              },
            },
          }}
        />
        <Typography
          color="text.secondary"
          fontSize={12}
          sx={{
            whiteSpace: "nowrap",
          }}
        >
          {`/ ${totalPages}`}
        </Typography>
      </Box>

      <Tooltip title={t("Next page")}>
        <span>
          <IconButton
            onClick={handleNext}
            disabled={page >= totalPages - 1}
            size="small"
            sx={{
              color: theme.palette.text.primary,
              "&.Mui-disabled": {
                color: theme.palette.text.disabled,
              },
            }}
          >
            <MdKeyboardArrowRight />
          </IconButton>
        </span>
      </Tooltip>

      <Tooltip title={t("Last page")}>
        <span>
          <IconButton
            onClick={handleLastPage}
            disabled={page >= totalPages - 1}
            size="small"
            sx={{
              color: theme.palette.text.primary,
              "&.Mui-disabled": {
                color: theme.palette.text.disabled,
              },
            }}
          >
            <MdLastPage />
          </IconButton>
        </span>
      </Tooltip>
    </Box>
  );
};

export default CustomTablePaginationActions;
