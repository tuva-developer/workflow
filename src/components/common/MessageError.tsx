import { Alert, AlertTitle, Box, Paper } from "@mui/material";
import { BiMessageAltError } from "react-icons/bi";

const LoginMessage = () => {
  const messageType = sessionStorage.getItem("message_type");

  let message = "";

  switch (messageType) {
    case "model_not_found":
      message = "Model not found.";
      break;
    case "instance_not_found":
      message = "Instance not found.";
      break;
    case "invalid_token":
      message = "Invalid token.";
      break;
    case "access_denied":
      message = "Access denied.";
      break;
    default:
      message = "Not found.";
  }

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      height='100vh'
      width='100vw'
      bgcolor="background.default"
      p={2}
    >
      <Paper sx={{ p: 3, maxWidth: 400, textAlign: "center" }}>
        <Alert severity='error' icon={<BiMessageAltError style={{ fontSize: '32px' }} />}>
          <AlertTitle>Error</AlertTitle>
          {message}
        </Alert>
      </Paper>
    </Box>
  );
};

export default LoginMessage;
