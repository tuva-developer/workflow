import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import {
  Box,
  IconButton,
  Paper,
  TextField,
  Typography,
  List,
  ListItem,
  useTheme,
  Slide,
  ClickAwayListener,
  Tooltip,
} from "@mui/material";
import {
  MdSend,
  MdClose,
  MdFullscreen,
  MdFullscreenExit,
  MdAttachFile,
  MdOutlineAttachFile,
} from "react-icons/md";
import { useTranslation } from "react-i18next";
import TypingAnimation from "@/components/common/TypingAnimation";
import { sendChatAI } from "@/services/ai";

interface Message {
  sender: "user" | "ai";
  text: string;
  file: File | null;
}

const AIChatbox = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [chatboxExited, setChatboxExited] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { sender: "ai", text: t("Hello! How can I assist you today?"), file: null },
  ]);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [fullscreenTooltipOpen, setFullscreenTooltipOpen] = useState(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (open) {
      messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
    }
  }, [open]);

  const handleSend = () => {
    if (!input.trim() && !uploadedFile) return;

    const userMessage: Message = {
      sender: "user",
      text: input,
      file: uploadedFile || null,
    };
    setMessages((prev) => [...prev, userMessage]);

    setInput("");
    setUploadedFile(null);

    async function SendChatAI() {
      try {
        const response = await sendChatAI({
          modelName: "Gemma Model 2 (9B IT)",
          message: input,
        });

        const aiResponse: Message = {
          sender: "ai",
          text: response?.text ?? t("I am not sure how to respond to that."),
          file: null,
        };
        setMessages((prev) => [...prev, aiResponse]);
      } catch (error) {
        setMessages((prev) => [
          ...prev,
          {
            sender: "ai",
            text: t("Sorry, something went wrong."),
            file: null,
          },
        ]);
      } finally {
        setLoading(false);
      }
    }

    setLoading(true);

    setTimeout(() => {
      SendChatAI();
    }, 500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (
      e.key === "Enter" &&
      !e.shiftKey &&
      !e.ctrlKey &&
      !e.altKey &&
      !e.metaKey
    ) {
      e.preventDefault();
      if (!input) return;
      handleSend();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setUploadedFile(e.target.files[0]);
    }
  };

  const handleClickAway = () => {
    if (open) setOpen(false);
  };

  const chatbox = (
    <ClickAwayListener onClickAway={handleClickAway}>
      <Box
        sx={{
          position: "fixed",
          bottom: 6,
          right: 6,
          zIndex: theme.zIndex.appBar + 1,
        }}
      >
        {!open && chatboxExited && (
          <Box sx={{ position: "fixed", bottom: 16, right: 16 }}>
            <Tooltip title={t("Open AI Chatbox")}>
              <IconButton
                size="medium"
                color="primary"
                onClick={() => {
                  setChatboxExited(false);
                  setOpen(true);
                }}
                sx={{
                  bgcolor: theme.palette.primary.main,
                  boxShadow: 4,
                  "&:hover": { bgcolor: theme.palette.primary.light },
                }}
              >
                <img
                  src="/images/chatbot.png"
                  alt="AI Chat Icon"
                  width={32}
                  height={32}
                />
              </IconButton>
            </Tooltip>
          </Box>
        )}

        <Slide
          direction="left"
          in={open}
          mountOnEnter
          unmountOnExit
          onExited={() => setChatboxExited(true)}
        >
          <Paper
            sx={{
              width: fullscreen ? "100vw" : 360,
              height: fullscreen ? "100vh" : 500,
              position: fullscreen ? "fixed" : "relative",
              top: fullscreen ? 0 : "auto",
              left: fullscreen ? 0 : "auto",
              display: "flex",
              flexDirection: "column",
              bgcolor: theme.palette.background.default,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: fullscreen ? 0 : 2,
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                color: theme.palette.text.primary,
                px: 2,
                py: 1.5,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography
                variant="subtitle1"
                fontWeight="bold"
                sx={{ display: "flex", alignItems: "center", gap: 1 }}
              >
                <img
                  src="/images/chatbot1.png"
                  alt="AI Chat Icon"
                  width={32}
                  height={32}
                />
                {t("AI Chatbot")}
              </Typography>
              <Box>
                <Tooltip
                  title={fullscreen ? t("Zoom out") : t("Full screen")}
                  open={fullscreenTooltipOpen}
                  onOpen={() => setFullscreenTooltipOpen(true)}
                  onClose={() => setFullscreenTooltipOpen(false)}
                >
                  <IconButton
                    size="medium"
                    sx={{ color: theme.palette.text.primary, mr: 1 }}
                    onClick={() => {
                      setFullscreen(!fullscreen);
                      setFullscreenTooltipOpen(false);
                    }}
                  >
                    {fullscreen ? <MdFullscreenExit /> : <MdFullscreen />}
                  </IconButton>
                </Tooltip>
                <Tooltip title={t("Close AI chatbot")}>
                  <IconButton
                    size="medium"
                    sx={{ color: theme.palette.text.primary }}
                    onClick={() => setOpen(false)}
                  >
                    <MdClose />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            <Box
              sx={{
                flex: 1,
                overflowY: "auto",
                px: 1,
                py: 1,
              }}
            >
              <List sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {messages.map((msg, index) => (
                  <ListItem
                    key={index}
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      px: 0,
                      py: 0,
                    }}
                  >
                    <Box
                      sx={{
                        width: "100%",
                        maxWidth: 800,
                        display: "flex",
                        justifyContent:
                          msg.sender === "user" ? "flex-end" : "flex-start",
                      }}
                    >
                      <Box
                        sx={{
                          bgcolor:
                            msg.sender === "user"
                              ? theme.palette.divider
                              : "transparent",
                          px: 2,
                          py: 1,
                          display: "flex",
                          flexDirection: "column",
                          gap: 1,
                          maxWidth: 800,
                          borderRadius: 2,
                          fontSize: 14,
                        }}
                      >
                        {msg.sender === "user" &&
                          index > 0 &&
                          messages[index]?.file && (
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                                color: "text.secondary",
                                bgcolor: theme.palette.background.paper,
                                borderRadius: 1,
                                border: `1px solid ${theme.palette.divider}`,
                                maxWidth: 800,
                              }}
                            >
                              <MdOutlineAttachFile size={18} />
                              <span
                                style={{
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {messages[index].file?.name}
                              </span>
                            </Box>
                          )}

                        <ReactMarkdown
                          children={msg.text}
                          components={{
                            code({
                              inline = false,
                              className,
                              children,
                              ...props
                            }: {
                              inline?: boolean;
                              className?: string;
                              children?: React.ReactNode;
                            }) {
                              const match = /language-(\w+)/.exec(
                                className || ""
                              );
                              return !inline && match ? (
                                <SyntaxHighlighter
                                  style={oneDark}
                                  language={match[1]}
                                  PreTag="div"
                                  {...props}
                                >
                                  {String(children).replace(/\n$/, "")}
                                </SyntaxHighlighter>
                              ) : (
                                <code
                                  style={{
                                    backgroundColor: theme.palette.divider,
                                    borderRadius: 4,
                                    fontFamily: "monospace",
                                    padding: 2,
                                  }}
                                  {...props}
                                >
                                  {children}
                                </code>
                              );
                            },
                          }}
                        />
                      </Box>
                    </Box>
                  </ListItem>
                ))}

                {loading && (
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                    }}
                  >
                    <Box
                      sx={{
                        width: "100%",
                        maxWidth: 800,
                        display: "flex",
                        justifyContent: "flex-start",
                        px: 2,
                      }}
                    >
                      <TypingAnimation />
                    </Box>
                  </Box>
                )}
                <div ref={messagesEndRef} />
              </List>
            </Box>

            <Box
              sx={{
                p: 1,
                display: "flex",
                justifyContent: "center",
                border: "none",
              }}
            >
              <Box
                sx={{
                  width: "100%",
                  maxWidth: 800,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 1,
                  p: 1,
                  borderRadius: 2,
                  border: `1px solid ${theme.palette.divider}`,
                  backgroundColor: theme.palette.background.paper,
                }}
              >
                {uploadedFile && (
                  <Box
                    sx={{ px: 2, py: 1, fontSize: 12, color: "text.secondary" }}
                  >
                    <MdOutlineAttachFile /> {t("Selected file")}{" "}
                    <strong>{uploadedFile.name}</strong>
                  </Box>
                )}
                <TextField
                  fullWidth
                  multiline
                  size="small"
                  variant="outlined"
                  placeholder={t("Ask anything...")}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  InputProps={{
                    sx: {
                      "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        border: "none",
                      },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        border: "none",
                      },
                      borderRadius: 2,
                      px: 1,
                      maxHeight: 300,
                      overflowY: "auto",
                    },
                  }}
                />
                <Box
                  sx={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "flex-start",
                    gap: 1,
                  }}
                >
                  <input
                    type="file"
                    id="chat-file-upload"
                    hidden
                    onChange={handleFileChange}
                  />
                  <label htmlFor="chat-file-upload">
                    <Tooltip title={t("Attach a file")}>
                      <IconButton component="span">
                        <MdAttachFile />
                      </IconButton>
                    </Tooltip>
                  </label>
                  {input && (
                    <IconButton color="primary" onClick={handleSend}>
                      <MdSend size={24} />
                    </IconButton>
                  )}
                </Box>
              </Box>
            </Box>
          </Paper>
        </Slide>
      </Box>
    </ClickAwayListener>
  );

  return ReactDOM.createPortal(chatbox, document.body);
};

export default AIChatbox;
