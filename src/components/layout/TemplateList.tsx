import {
  Box,
  Typography,
  Card,
  CardContent,
  IconButton,
  AccordionSummary,
  Accordion,
  AccordionDetails,
  useTheme,
} from "@mui/material";
import { useState, useMemo, useCallback } from "react";
import { FiChevronUp } from "react-icons/fi";
import { AiOutlineDelete } from "react-icons/ai";
import { BiCategory } from "react-icons/bi";
import { useAppContext } from "@/hooks/useAppContext";
import { useTranslation } from "react-i18next";
import SearchTextField from "@/components/common/SearchTextField";
import { useTemplatesQuery } from "@/hooks/query/useTemplatesQuery";
import { useDeleteTemplate } from "@/hooks/mutations/useTemplateMutations";

interface TemplateListProps {
  isOpen?: boolean;
}
const TemplateList = ({ isOpen = true }: TemplateListProps) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const { setTemplateSelected, openConfirm, closeConfirm } = useAppContext();
  const [searchTemplate, setSearchTemplate] = useState<string>("");
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [openCategories, setOpenCategories] = useState({});

  const { data } = useTemplatesQuery(undefined, isOpen);
  const templates = useMemo(() => {
    return data?.items ?? [];
  }, [data]);

  const deleteTemplateMutation = useDeleteTemplate();

  const handleCardClick = async (template: Template) => {
    setTemplateSelected(template);
  };

  const handleDeleteTemplate = useCallback(
    (templateId: string) => {
      openConfirm({
        title: t("Delete Template"),
        message: t("Are you sure you want to delete this template?"),
        onOk: () => {
          deleteTemplateMutation.mutate(
            { templateId },
            {
              onSettled: () => closeConfirm(),
            }
          );
        },
      });
    },
    [deleteTemplateMutation, t, openConfirm, closeConfirm]
  );

  const groupedTemplates = useMemo(() => {
    const groups = templates.reduce((acc, template) => {
      try {
        const config = JSON.parse(template.config);
        const type = config.element.type || "Unknown";
        if (!acc[type]) acc[type] = [];
        acc[type].push(template);

        return acc;
      } catch (err) {
        return acc;
      }
    }, {} as { [key: string]: typeof templates });

    return groups;
  }, [templates]);

  const toggleCategory = (category) => {
    setOpenCategories((prev) => ({ ...prev, [category]: !prev[category] }));
  };

  return (
    <>
      <Box px={2} py={1} sx={{ borderRadius: "12px" }}>
        <SearchTextField
          value={searchTemplate}
          onChangeDebounced={(val) => setSearchTemplate(val)}
          sx={{ mb: 1 }}
          tooltip="Search templates"
          width={"100%"}
        />

        {Object.keys(groupedTemplates).map((type) => (
          <Accordion
            key={type}
            expanded={openCategories[type] || false}
            disableGutters
            elevation={0}
            square
            sx={{
              backgroundColor: theme.palette.background.default,
              mb: 1,
              borderRadius: 2,
              border: `1px solid ${theme.palette.divider}`,
              "&:before": {
                display: "none",
              },
            }}
          >
            <AccordionSummary
              expandIcon={<FiChevronUp />}
              onClick={() => toggleCategory(type)}
            >
              <Typography
                sx={{
                  fontWeight: 500,
                  fontSize: 12,
                  textTransform: "uppercase",
                }}
              >
                {t(type.split(":")[1])} ({groupedTemplates[type].length})
              </Typography>
            </AccordionSummary>

            <AccordionDetails>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
                  gap: 2,
                }}
              >
                {groupedTemplates[type]
                  .filter(
                    (template) =>
                      template?.name
                        ?.toLowerCase()
                        .includes(searchTemplate.toLowerCase()) ||
                      template?.description
                        ?.toLowerCase()
                        .includes(searchTemplate.toLowerCase())
                  )
                  .map((template) => (
                    <Card
                      key={template._id}
                      variant="outlined"
                      onMouseEnter={() => setHoveredCard(template._id)}
                      onMouseLeave={() => setHoveredCard(null)}
                      onClick={() => handleCardClick(template)}
                      sx={{
                        borderRadius: 2,
                        p: 1,
                        backgroundColor: theme.palette.background.paper,
                        transition: "0.2s",
                        position: "relative",
                        "&:hover": {
                          backgroundColor: theme.palette.action.hover,
                        },
                      }}
                    >
                      {hoveredCard === template._id && (
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            openConfirm({
                              title: t("Delete Template"),
                              message: t(
                                "Are you sure you want to delete this template?"
                              ),
                              onOk: () => {
                                handleDeleteTemplate(template._id);
                              },
                            });
                          }}
                          sx={{
                            position: "absolute",
                            top: 4,
                            right: 4,
                            backgroundColor: theme.palette.error.main,
                            color: theme.palette.common.white,
                            "&:hover": {
                              backgroundColor: theme.palette.error.light,
                            },
                          }}
                        >
                          <AiOutlineDelete size={14} />
                        </IconButton>
                      )}
                      <CardContent
                        sx={{
                          textAlign: "center",
                          padding: "10px !important",
                          cursor: "pointer",
                        }}
                        title={template.name}
                      >
                        <BiCategory
                          size={20}
                          style={{
                            marginBottom: 4,
                            color: theme.palette.primary.main,
                          }}
                        />
                        <Typography
                          sx={{
                            fontSize: 12,
                            fontWeight: 500,
                            textOverflow: "ellipsis",
                            overflow: "hidden",
                            whiteSpace: "nowrap",
                            maxWidth: "100%",
                          }}
                        >
                          {template.name}
                        </Typography>
                      </CardContent>
                    </Card>
                  ))}
              </Box>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
    </>
  );
};

export default TemplateList;
