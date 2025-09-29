import React from "react";
import {
  Box,
  TextField,
  Select,
  MenuItem,
  Typography,
  IconButton,
} from "@mui/material";
import {
  IoChevronBack,
  IoChevronForward,
  IoChevronBackOutline,
  IoChevronForwardOutline,
} from "react-icons/io5";

interface CustomPaginationProps {
  page: number;
  pageCount: number;
  rowsPerPage: number;
  onPageChange: (newPage: number) => void;
  onRowsPerPageChange: (newSize: number) => void;
}

const CustomPagination: React.FC<CustomPaginationProps> = ({
  page,
  pageCount,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
}) => {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        p: 1,
        fontSize: 13,
      }}
    >
      <IconButton
        size="small"
        onClick={() => onPageChange(0)}
        disabled={page === 0}
      >
        <IoChevronBackOutline />
      </IconButton>

      <IconButton
        size="small"
        onClick={() => onPageChange(page - 1)}
        disabled={page === 0}
      >
        <IoChevronBack />
      </IconButton>

      <Typography fontSize={13}>Page</Typography>
      <TextField
        type="number"
        size="small"
        value={page + 1}
        onChange={(e) => {
          let newPage = Number(e.target.value) - 1;
          if (isNaN(newPage)) return;
          if (newPage < 0) newPage = 0;
          if (newPage >= pageCount) newPage = pageCount - 1;
          onPageChange(newPage);
        }}
        inputProps={{
          min: 1,
          max: pageCount,
          style: { width: 50, textAlign: "center", fontSize: 13 },
        }}
      />
      <Typography fontSize={13}>/ {pageCount}</Typography>

      <IconButton
        size="small"
        onClick={() => onPageChange(page + 1)}
        disabled={page + 1 >= pageCount}
      >
        <IoChevronForward />
      </IconButton>

      <IconButton
        size="small"
        onClick={() => onPageChange(pageCount - 1)}
        disabled={page + 1 >= pageCount}
      >
        <IoChevronForwardOutline />
      </IconButton>

      <Typography fontSize={13}>Rows per page:</Typography>
      <Select
        size="small"
        value={rowsPerPage}
        onChange={(e) => onRowsPerPageChange(Number(e.target.value))}
        sx={{ fontSize: 13 }}
      >
        {[10, 25, 50, 100].map((size) => (
          <MenuItem key={size} value={size} sx={{ fontSize: 13 }}>
            {size}
          </MenuItem>
        ))}
      </Select>
    </Box>
  );
};

export default CustomPagination;
