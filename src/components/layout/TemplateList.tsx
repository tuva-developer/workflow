import React, { useState, useMemo, useCallback } from "react";
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
  Chip,
  Tooltip,
} from "@mui/material";
import { FiChevronUp } from "react-icons/fi";
import { AiOutlineDelete } from "react-icons/ai";
import { BiCategory } from "react-icons/bi";
import { useAppContext } from "@/hooks/useAppContext";
import { useTranslation } from "react-i18next";
import SearchTextField from "@/components/common/SearchTextField";
import { useTemplatesQuery } from "@/hooks/query/useTemplatesQuery";
import { useDeleteTemplate } from "@/hooks/mutations/useTemplateMutations";
import {
  MdArrowDownward,
  MdArrowUpward,
  MdUnfoldLess,
  MdUnfoldMore,
} from "react-icons/md";

interface TemplateListProps {
  isOpen?: boolean;
}

const TemplateList: React.FC<TemplateListProps> = ({ isOpen = true }) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const { setTemplateSelected, openConfirm, closeConfirm } = useAppContext();

  const [searchTemplate, setSearchTemplate] = useState<string>("");
  const [sortAsc, setSortAsc] = useState<boolean>(true);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>(
    {}
  );

  const { data, isLoading } = useTemplatesQuery(undefined, isOpen);
  const templates = useMemo<Template[]>(
    () => (data?.items ?? []) as Template[],
    [data]
  );

  const deleteTemplateMutation = useDeleteTemplate();

  const handleCardClick = useCallback(
    (template: Template) => {
      setTemplateSelected({ ...template });
    },
    [setTemplateSelected]
  );

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
        const type: string = config?.element?.type || "Unknown";
        (acc[type] ||= []).push(template);
      } catch {
        (acc["Unknown"] ||= []).push(template);
      }
      return acc;
    }, {} as Record<string, Template[]>);
    return groups;
  }, [templates]);

  const toggleCategory = (category: string) => {
    setOpenCategories((prev) => ({ ...prev, [category]: !prev[category] }));
  };

  const filterByQuery = useCallback(
    (tpl: Template) => {
      const q = searchTemplate.trim().toLowerCase();
      if (!q) return true;
      return (
        tpl?.name?.toLowerCase().includes(q) ||
        tpl?.description?.toLowerCase().includes(q)
      );
    },
    [searchTemplate]
  );

  const highlight = (text: string | undefined, q: string) => {
    const str = text ?? "";
    const query = q.trim();
    if (!query) return str;
    const i = str.toLowerCase().indexOf(query.toLowerCase());
    if (i === -1) return str;
    return (
      <>
        {str.slice(0, i)}
        <mark style={{ padding: 0 }}>{str.slice(i, i + query.length)}</mark>
        {str.slice(i + query.length)}
      </>
    );
  };

  const totalAfterFilter = useMemo(() => {
    const q = searchTemplate.trim().toLowerCase();
    if (!q) return templates.length;
    return templates.filter(filterByQuery).length;
  }, [templates, searchTemplate, filterByQuery]);

  const groupKeys = useMemo(() => {
    return Object.keys(groupedTemplates).sort((a, b) => a.localeCompare(b));
  }, [groupedTemplates]);

  const visibleGroupKeys = useMemo(() => {
    const q = searchTemplate.trim().toLowerCase();
    if (!q) return groupKeys;
    return groupKeys.filter((type) =>
      groupedTemplates[type].some((tpl) => {
        const name = tpl?.name?.toLowerCase() || "";
        const desc = tpl?.description?.toLowerCase() || "";
        return name.includes(q) || desc.includes(q);
      })
    );
  }, [groupedTemplates, groupKeys, searchTemplate]);

  const allVisibleExpanded = useMemo(() => {
    if (visibleGroupKeys.length === 0) return false;
    return visibleGroupKeys.every((k) => openCategories[k]);
  }, [visibleGroupKeys, openCategories]);

  const toggleAllVisible = useCallback(() => {
    setOpenCategories((prev) => {
      const next = { ...prev };
      const target = !allVisibleExpanded;
      visibleGroupKeys.forEach((k) => (next[k] = target));
      return next;
    });
  }, [allVisibleExpanded, visibleGroupKeys, setOpenCategories]);

  const compareByName = useCallback(
    (a: Template, b: Template) => {
      const an = (a?.name ?? "").toLowerCase();
      const bn = (b?.name ?? "").toLowerCase();
      if (an === bn) return 0;
      return sortAsc ? (an < bn ? -1 : 1) : an > bn ? -1 : 1;
    },
    [sortAsc]
  );

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Box
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 1,
          px: 2,
          py: 1,
          bgcolor: theme.palette.background.default,
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            flexWrap: "nowrap",
            minWidth: 0,
          }}
        >
          <SearchTextField
            value={searchTemplate}
            onChangeDebounced={(val) => setSearchTemplate(val)}
            tooltip={t("Search templates")}
            sx={{ flex: 1 }}
          />

          <Chip
            size="medium"
            variant="outlined"
            icon={
              allVisibleExpanded ? (
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <MdUnfoldLess size={20} />
                </Box>
              ) : (
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <MdUnfoldMore size={20} />
                </Box>
              )
            }
            label={allVisibleExpanded ? t("Collapse all") : t("Expand all")}
            onClick={toggleAllVisible}
            sx={{ flexShrink: 0, fontSize: 11 }}
          />

          <Chip
            size="medium"
            variant="outlined"
            onClick={() => setSortAsc((v) => !v)}
            icon={
              sortAsc ? (
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <MdArrowUpward size={18} />
                </Box>
              ) : (
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <MdArrowDownward size={18} />
                </Box>
              )
            }
            label={sortAsc ? t("Sort A → Z") : t("Sort Z → A")}
            sx={{ flexShrink: 0, fontSize: 11 }}
          />

          <Chip
            size="small"
            variant="filled"
            label={`${t("Results")} : ${totalAfterFilter}`}
            sx={{ flexShrink: 0, fontSize: 11 }}
          />
        </Box>
      </Box>

      <Box sx={{ flex: 1, overflow: "auto", px: 2, py: 1 }}>
        {isLoading && (
          <Box sx={{ py: 4, textAlign: "center", color: "text.secondary" }}>
            <Typography variant="body2">{t("Loading...")}</Typography>
          </Box>
        )}

        {!isLoading && groupKeys.length === 0 && (
          <Box sx={{ py: 6, textAlign: "center", color: "text.secondary" }}>
            <Typography variant="body2">{t("No templates yet")}</Typography>
          </Box>
        )}

        {!isLoading && groupKeys.length > 0 && totalAfterFilter === 0 && (
          <Box sx={{ py: 6, textAlign: "center", color: "text.secondary" }}>
            <Typography variant="body2">
              {t("No templates match your search")}
            </Typography>
          </Box>
        )}

        {!isLoading &&
          groupKeys.map((type) => {
            const filtered = groupedTemplates[type].filter(filterByQuery);
            const expanded = !!openCategories[type];

            if (searchTemplate.trim() && filtered.length === 0) return null;

            return (
              <Accordion
                key={type}
                expanded={expanded}
                disableGutters
                elevation={0}
                square
                sx={{
                  backgroundColor: theme.palette.background.default,
                  mb: 1,
                  borderRadius: 2,
                  border: `1px solid ${theme.palette.divider}`,
                  "&:before": { display: "none" },
                }}
              >
                <AccordionSummary
                  expandIcon={
                    <Box
                      sx={{
                        display: "inline-flex",
                      }}
                    >
                      <FiChevronUp />
                    </Box>
                  }
                  onClick={() => toggleCategory(type)}
                  sx={{ px: 2 }}
                >
                  <Typography
                    sx={{
                      fontWeight: 500,
                      fontSize: 12,
                      textTransform: "uppercase",
                    }}
                  >
                    {t(type.split(":")[1] ?? type)} ({filtered.length})
                  </Typography>
                </AccordionSummary>

                <AccordionDetails sx={{ pt: 0, px: 2, pb: 2 }}>
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fill, minmax(120px, 1fr))",
                      gap: 2,
                    }}
                  >
                    {[...filtered].sort(compareByName).map((template) => (
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
                          cursor: "pointer",
                        }}
                      >
                        {hoveredCard === template._id && (
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteTemplate(template._id);
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

                        <Tooltip
                          arrow
                          placement="top"
                          title={
                            <Box
                              sx={{
                                whiteSpace: "normal",
                                textAlign: "center",
                                maxWidth: 100,
                              }}
                            >
                              <Typography
                                variant="subtitle2"
                                sx={{ fontWeight: 500, fontSize: 12 }}
                              >
                                {highlight(
                                  template.name || t("Untitled"),
                                  searchTemplate
                                )}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.main"
                                sx={{ fontSize: 11 }}
                              >
                                {template.description ? (
                                  highlight(
                                    template.description,
                                    searchTemplate
                                  )
                                ) : (
                                  <i>{t("No description")}</i>
                                )}
                              </Typography>
                            </Box>
                          }
                        >
                          <CardContent sx={{ textAlign: "center", p: 1 }}>
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
                              {highlight(template.name, searchTemplate)}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{
                                fontSize: 11,
                                display: "block",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                marginTop: 0.5,
                              }}
                            >
                              {highlight(
                                template.description,
                                searchTemplate
                              ) || <i>{t("No description")}</i>}
                            </Typography>
                          </CardContent>
                        </Tooltip>
                      </Card>
                    ))}
                  </Box>
                </AccordionDetails>
              </Accordion>
            );
          })}
      </Box>
    </Box>
  );
};

export default TemplateList;
