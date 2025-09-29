import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Divider,
  IconButton,
  MenuItem,
  Select,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import JsonEditor from "@/components/common/JSONEditor";
import { useTranslation } from "react-i18next";
import { defaultMultipartEntry } from "@/utils/defines";
import { FiUpload } from "react-icons/fi";

type JsonObject = Record<string, unknown>;

interface Props {
  jsonImport?: unknown;
  bodyType: BodyType;
  setBodyType: (type: BodyType) => void;
  setBodyData: (value: JsonObject | File | MultipartEntry[]) => void;
}

const isPlainObject = (v: unknown): v is JsonObject =>
  typeof v === "object" && v !== null && !Array.isArray(v) && !(v instanceof File);

const BodyDataSection: React.FC<Props> = ({
  jsonImport,
  bodyType,
  setBodyType,
  setBodyData,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();

  const [jsonData, setJsonData] = useState<JsonObject>({});
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [multipartFields, setMultipartFields] = useState<MultipartEntry[]>([
    defaultMultipartEntry,
  ]);

  useEffect(() => {
    if (!jsonImport) return;
    if (!isPlainObject(jsonImport)) return;

    setBodyType("raw");
    setBodyData(jsonImport);
    setJsonData(jsonImport);
  }, [jsonImport, setBodyType, setBodyData]);

  useEffect(() => {
    switch (bodyType) {
      case "none":
        setBodyData({});
        break;
      case "raw":
        setBodyData(jsonData);
        break;
      case "binary":
        setBodyData(selectedFile ?? {});
        break;
      case "form-data":
        setBodyData(multipartFields);
        break;
    }
  }, [bodyType, jsonData, selectedFile, multipartFields, setBodyData]);

  const handleChangeBodyType = (type: BodyType) => {
    setBodyType(type);
    switch (type) {
      case "none":
        setJsonData({});
        break;
      case "raw":
        break;
      case "binary":
        break;
      case "form-data":
        break;
    }
  };

  const handleJsonChange = (val: unknown) => {
    setJsonData(isPlainObject(val) ? val : {});
  };

  const handleFileChange = (file: File | null) => {
    setSelectedFile(file);
  };

  const updateMultipartField = (
    index: number,
    update: Partial<MultipartEntry>
  ) => {
    setMultipartFields((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], ...update };
      return updated;
    });
  };

  const addMultipartField = () => {
    setMultipartFields((prev) => [
      ...prev,
      { key: `field${prev.length + 1}`, type: "text", value: "" },
    ]);
  };

  const removeMultipartField = (index: number) => {
    setMultipartFields((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <>
      <Box mb={2} mt={2} display="flex" gap={2}>
        {(["none", "raw", "binary", "form-data"] as BodyType[]).map((mode) => (
          <Button
            key={mode}
            variant={bodyType === mode ? "contained" : "outlined"}
            onClick={() => handleChangeBodyType(mode)}
          >
            {t(mode)}
          </Button>
        ))}
      </Box>

      <Divider />

      <Box mt={2}>
        {bodyType === "none" && (
          <Box
            sx={{
              flexGrow: 1,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              borderRadius: 2,
              p: "20px",
              boxShadow: "0 2px 10px rgba(0, 0, 0, 0.3)",
            }}
          >
            <Typography
              sx={{
                color: theme.palette.text.secondary,
                fontSize: 14,
                fontStyle: "italic",
                fontWeight: 500,
                textAlign: "center",
              }}
            >
              {t("Perform without input data")}
            </Typography>
          </Box>
        )}

        {bodyType === "raw" && (
          <JsonEditor value={jsonData} onChange={handleJsonChange} mode="code" />
        )}

        {bodyType === "binary" && (
          <Box mb={2}>
            <input
              type="file"
              id="hidden-file-input"
              style={{ display: "none" }}
              onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
            />
            <label htmlFor="hidden-file-input">
              <Button
                variant="outlined"
                component="span"
                sx={{
                  borderColor: theme.palette.divider,
                  color: theme.palette.text.primary,
                }}
              >
                {t("Choose File")}
              </Button>
            </label>
            <Typography
              variant="body2"
              sx={{ display: "inline", ml: 2, color: theme.palette.text.secondary }}
            >
              {selectedFile ? selectedFile.name : t("No file selected")}
            </Typography>
          </Box>
        )}

        {bodyType === "form-data" && (
          <>
            {multipartFields.map((entry, index) => (
              <Box key={index} display="flex" alignItems="center" gap={1} mb={2}>
                <TextField
                  label="Key"
                  value={entry.key}
                  onChange={(e) => updateMultipartField(index, { key: e.target.value })}
                  sx={{
                    flex: 2,
                    "& .MuiOutlinedInput-root": {
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: theme.palette.divider,
                      },
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: theme.palette.info.light,
                      },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: theme.palette.primary.light,
                      },
                    },
                  }}
                />

                <Select
                  value={entry.type}
                  onChange={(e) =>
                    updateMultipartField(index, {
                      type: e.target.value as "file" | "text",
                      value: "",
                    })
                  }
                  sx={{
                    flex: 1,
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: (theme) => theme.palette.divider,
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: (theme) => theme.palette.primary.light,
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: (theme) => theme.palette.primary.main,
                    },
                  }}
                >
                  <MenuItem value="text">Text</MenuItem>
                  <MenuItem value="file">File</MenuItem>
                </Select>

                {entry.type === "file" ? (
                  <>
                    <input
                      type="file"
                      id={`file-input-${index}`}
                      style={{ display: "none" }}
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        updateMultipartField(index, { value: file });
                      }}
                    />

                    <Box
                      sx={{
                        border: `1px solid ${theme.palette.divider}`,
                        borderRadius: 2,
                        p: 1,
                        fontSize: 14,
                        color: theme.palette.text.secondary,
                        backgroundColor: theme.palette.background.default,
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        flex: 3,
                      }}
                    >
                      <label htmlFor={`file-input-${index}`}>
                        <Button
                          variant="outlined"
                          startIcon={<FiUpload />}
                          component="span"
                          sx={{
                            textTransform: "none",
                            borderRadius: 2,
                            borderColor: theme.palette.primary.main,
                            color: theme.palette.primary.main,
                            "&:hover": { backgroundColor: theme.palette.action.hover },
                          }}
                        >
                          {t("Choose file")}
                        </Button>
                      </label>

                      {entry.value instanceof File ? (
                        <>
                          {t("Selected file")}:{" "}
                          <strong style={{ color: theme.palette.text.primary }}>
                            {entry.value.name}
                          </strong>
                        </>
                      ) : (
                        t("No file chosen")
                      )}
                    </Box>
                  </>
                ) : (
                  <TextField
                    label="Value"
                    value={typeof entry.value === "string" ? entry.value : ""}
                    onChange={(e) => updateMultipartField(index, { value: e.target.value })}
                    sx={{
                      flex: 3,
                      "& .MuiOutlinedInput-root": {
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: theme.palette.divider,
                        },
                        "&:hover .MuiOutlinedInput-notchedOutline": {
                          borderColor: theme.palette.info.light,
                        },
                        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                          borderColor: theme.palette.primary.light,
                        },
                      },
                    }}
                  />
                )}

                <IconButton sx={{ width: 40, height: 40 }} onClick={() => removeMultipartField(index)}>
                  ×
                </IconButton>
              </Box>
            ))}
            <Button onClick={addMultipartField} variant="outlined">
              {t("+ Add field")}
            </Button>
          </>
        )}
      </Box>
    </>
  );
};

export default BodyDataSection;