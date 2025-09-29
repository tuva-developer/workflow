import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom";
import { UserProvider } from "@/contexts/UserProvider";
import { AppProvider } from "@/contexts/AppProvider";
import { ThemeProvider } from "@/contexts/ThemeProvider";
import "@/index.css";
import 'remixicon/fonts/remixicon.css';
import App from "@/App";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { queryClient } from "@/queryClient";

// Root component
ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <UserProvider>
          <AppProvider>
            <Router>
              <App />
            </Router>
          </AppProvider>
        </UserProvider>
      </ThemeProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </React.StrictMode>
);
