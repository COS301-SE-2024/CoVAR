import type { Metadata } from "next";
import { layoutStyle } from '../styles/layoutStyle';
import "./globals.css";
import Sidebar from "./sidebar";
import { AuthProvider } from "@/functions/authContext";
import { CustomThemeProvider } from "@/styles/customThemeProvider";
import { Box } from "@mui/material";

export const metadata: Metadata = {
  title: "CoVAR",
  description: "Penetration tests all in one place",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
   return (
    <html lang="en">
      <body>
      <CustomThemeProvider>
        <AuthProvider>
          <Box sx={layoutStyle}>
            <Sidebar />
            {children}
          </Box>
        </AuthProvider>
      </CustomThemeProvider>
      </body>
    </html>
  );
}
