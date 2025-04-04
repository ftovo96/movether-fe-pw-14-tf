'use client'

import { Paper } from "@mui/material";
import Box from "@mui/material/Box/Box";
import CssBaseline from "@mui/material/CssBaseline/CssBaseline";
import { useWindowSize } from "../hooks/useWindowSize";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const windowSize = useWindowSize();
  let contentHeight;
  let contentWidth;
  const isMobile = window.innerWidth < 960;
  if (isMobile) {
    contentHeight = windowSize.height;
    contentWidth = windowSize.width;
  } else {
    contentHeight = 600;
    contentWidth = 420;
  }

  return <>
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <Box className="main-content" sx={{
        width: `100vw`,
        height: '100vh',
        display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center'
      }}>
        <Paper elevation={isMobile ? 0 : 1} sx={{ height: contentHeight + 'px', width: contentWidth + 'px', overflow: 'scroll', margin: 2, borderRadius: 2 }}>
          <Box>
            {children}
          </Box>
        </Paper>
      </Box>
    </Box>
  </>
}
