import { memo, useMemo } from "react";
import { Box, Typography, useTheme } from "@mui/material";
import JsonView from "@uiw/react-json-view";
import { lightTheme } from "@uiw/react-json-view/light";
import { darkTheme } from "@uiw/react-json-view/dark";

interface JSONViewProps {
  jsonData: object | undefined | null;
}

const JSONView = memo(({ jsonData }: JSONViewProps) => {
  const theme = useTheme();

  const isEmpty = useMemo(() => {
    return (
      jsonData === null ||
      jsonData === undefined ||
      (typeof jsonData === "object" && Object.keys(jsonData).length === 0)
    );
  }, [jsonData]);

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        overflow: "auto",
      }}
    >
      {isEmpty ? (
        <Typography
          variant="body2"
          align="center"
          sx={{ mt: 2, color: theme.palette.text.secondary }}
        >
          No JSON Data
        </Typography>
      ) : (
        <JsonView
          value={jsonData!}
          style={{
            ...(theme.palette.mode === "light" ? lightTheme : darkTheme),
            backgroundColor: theme.palette.background.paper,
            padding: 16,
            borderRadius: 8,
            overflow: "hidden"
          }}
          displayDataTypes={false}
          enableClipboard={false}
          displayObjectSize={false}
          indentWidth={16}
        />
      )}
    </Box>
  );
});

export default JSONView;
