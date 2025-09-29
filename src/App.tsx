import '@/App.css'
import '@/i18n';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import CssBaseline from "@mui/material/CssBaseline";
import { Box, useTheme } from "@mui/material";
import AppRoutes from '@/routes/AppRoutes';
import { AppProvider } from '@/contexts/AppProvider';
import { LanguageProvider } from '@/contexts/LanguageProvider';
import ConfirmDialog from '@/components/common/Confirm';
import LoadingSpinner from '@/components/common/LoadingSpinner';

function App() {
  const theme = useTheme();

  return (
    <AppProvider>
      <LanguageProvider>
        <CssBaseline />
        <ToastContainer />
        <Box sx={{
          height: '100vh',
          width: '100vw',
          overflow: 'hidden',
          background: theme.palette.background.default,
          display: 'flex',
          flexDirection: 'column',
        }}>
          <AppRoutes />
          <ConfirmDialog />
          <LoadingSpinner />
        </Box>
      </LanguageProvider>
    </AppProvider>
  )
}

export default App;