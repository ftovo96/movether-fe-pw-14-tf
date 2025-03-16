'use client'

// // import type { Metadata } from "next";
// // import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
// // import Container from "@mui/material/Container/Container";
// // import { AppBar, Box, Button, IconButton, Toolbar, Typography } from "@mui/material";
// // import { MenuOutlined } from "@mui/icons-material";

import { AccountCircleOutlined, CloseOutlined, DeleteOutline, FavoriteOutlined, InboxOutlined, LocationOnOutlined, MailOutlineOutlined, RestoreOutlined } from "@mui/icons-material";
import { BottomNavigation, BottomNavigationAction, Button, Paper, Typography } from "@mui/material";
import AppBar from "@mui/material/AppBar/AppBar";
import Box from "@mui/material/Box/Box";
import CssBaseline from "@mui/material/CssBaseline/CssBaseline";
import Divider from "@mui/material/Divider/Divider";
import Drawer from "@mui/material/Drawer/Drawer";
import List from "@mui/material/List/List";
import ListItem from "@mui/material/ListItem/ListItem";
import ListItemButton from "@mui/material/ListItemButton/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon/ListItemIcon";
import ListItemText from "@mui/material/ListItemText/ListItemText";
import Toolbar from "@mui/material/Toolbar/Toolbar";
import { useWindowSize } from "../hooks/useWindowSize";
import { useRouter } from "next/navigation";
import { LoginCredentials, LoginProvider, UserContext } from "../providers/userProvider";
import { useState } from "react";
// // export const metadata: Metadata = {
// //   title: "Create Next App",
// //   description: "Generated by create next app",
// // };

// // export default function Layout({
// //   children,
// // }: Readonly<{
// //   children: React.ReactNode;
// // }>) {
// //   return (
// //     <Container>
// //     <Box sx={{ flexGrow: 1 }}>
// //       <AppBar position="static">
// //         <Toolbar>
// //           <IconButton
// //             size="large"
// //             edge="start"
// //             color="inherit"
// //             aria-label="menu"
// //             sx={{ mr: 2 }}
// //           >
// //             <MenuOutlined></MenuOutlined>
// //           </IconButton>
// //           <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
// //             Main
// //           </Typography>
// //           <Button color="inherit">Login</Button>
// //         </Toolbar>
// //       </AppBar>
// //     </Box>
// //           {children}
// //     </Container>
// //   );
// // }


// 'use client'

// import * as React from 'react';
// import AppBar from '@mui/material/AppBar';
// import Box from '@mui/material/Box';
// import CssBaseline from '@mui/material/CssBaseline';
// import Divider from '@mui/material/Divider';
// import Drawer from '@mui/material/Drawer';
// import IconButton from '@mui/material/IconButton';
// import InboxIcon from '@mui/icons-material/MoveToInbox';
// import List from '@mui/material/List';
// import ListItem from '@mui/material/ListItem';
// import ListItemButton from '@mui/material/ListItemButton';
// import ListItemIcon from '@mui/material/ListItemIcon';
// import ListItemText from '@mui/material/ListItemText';
// import MailIcon from '@mui/icons-material/Mail';
// import MenuIcon from '@mui/icons-material/Menu';
// import Toolbar from '@mui/material/Toolbar';
// import Typography from '@mui/material/Typography';
// import { BottomNavigation, BottomNavigationAction, Button } from '@mui/material';
// import { useRouter } from 'next/navigation'
// import Link from 'next/link';
// import { FavoriteOutlined, LocationOnOutlined, RestoreOutlined } from '@mui/icons-material';

// const drawerWidth = 240;
// const toolbarHeight = 64;
// const bottomNavigationHeight = 56;

// // interface Props {
// //   /**
// //    * Injected by the documentation to work in an iframe.
// //    * Remove this when copying and pasting into your project.
// //    */
// //   window?: () => Window;
// // }

// export default function Layout({
//   children,
// }: Readonly<{
//   children: React.ReactNode;
// }>) {
//   // const { window } = props;
//   const router = useRouter();
//   const [mobileOpen, setMobileOpen] = React.useState(false);
//   const [isClosing, setIsClosing] = React.useState(false);

//   const handleDrawerClose = () => {
//     setIsClosing(true);
//     setMobileOpen(false);
//   };

//   const handleDrawerTransitionEnd = () => {
//     setIsClosing(false);
//   };

//   const handleDrawerToggle = () => {
//     if (!isClosing) {
//       setMobileOpen(!mobileOpen);
//     }
//   };

//   const drawer = (
//     <div>
//       <Toolbar />
//       <Divider />
//       <List>
//         {['Inbox', 'Starred', 'Send email', 'Drafts'].map((text, index) => (
//           <ListItem key={text} disablePadding>
//             <ListItemButton>
//               <ListItemIcon>
//                 {index % 2 === 0 ? <InboxIcon /> : <MailIcon />}
//               </ListItemIcon>
//               <ListItemText primary={text} />
//             </ListItemButton>
//           </ListItem>
//         ))}
//       </List>
//       <Divider />
//       <List>
//         {['All mail', 'Trash', 'Spam'].map((text, index) => (
//           <ListItem key={text} disablePadding>
//             <ListItemButton>
//               <ListItemIcon>
//                 {index % 2 === 0 ? <InboxIcon /> : <MailIcon />}
//               </ListItemIcon>
//               <ListItemText primary={text} />
//             </ListItemButton>
//           </ListItem>
//         ))}
//       </List>
//     </div>
//   );

//   // Remove this const when copying and pasting into your project.
//   // const container = window !== undefined ? () => window().document.body : undefined;
//   // const container = window !== undefined ? () => window().document.body : undefined;
//   const container = window.document.body;
//   const windowHeight = window.innerHeight;
//   const contentHeight = windowHeight - toolbarHeight - bottomNavigationHeight;

//   return (
//     <Box sx={{ display: 'flex' }}>
//       <CssBaseline />
//       <AppBar
//         position="fixed"
//         sx={{
//           width: { sm: `calc(100% - ${drawerWidth}px)` },
//           ml: { sm: `${drawerWidth}px` },
//         }}
//       >
//         <Toolbar>
//           <IconButton
//             color="inherit"
//             aria-label="open drawer"
//             edge="start"
//             onClick={handleDrawerToggle}
//             sx={{ mr: 2, display: { sm: 'none' } }}
//           >
//             <MenuIcon />
//           </IconButton>
//           <Typography variant="h6" noWrap component="div">
//             Responsive drawer
//           </Typography>
//           <Button color="inherit">
//             <Link href={'/login'}>Login</Link>
//           </Button>
//         </Toolbar>
//       </AppBar>
//       <Box
//         component="nav"
//         sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
//         aria-label="mailbox folders"
//       >
//         {/* The implementation can be swapped with js to avoid SEO duplication of links. */}
//         <Drawer
//           container={container}
//           variant="temporary"
//           open={mobileOpen}
//           onTransitionEnd={handleDrawerTransitionEnd}
//           onClose={handleDrawerClose}
//           sx={{
//             display: { xs: 'block', sm: 'none' },
//             '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
//           }}
//           slotProps={{
//             root: {
//               keepMounted: true, // Better open performance on mobile.
//             },
//           }}
//         >
//           {drawer}
//         </Drawer>
//         <Drawer
//           variant="permanent"
//           sx={{
//             display: { xs: 'none', sm: 'block' },
//             '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
//           }}
//           open
//         >
//           {drawer}
//         </Drawer>
//       </Box>
//       <Box
//         component="main"
//         sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth}px)`, padding: 0 } }}
//       >
//         <Toolbar />
//         <Box height={contentHeight} sx={{ overflow: 'scroll', padding: 0}}>
//           {children}
//         </Box>
//         {/* <Typography sx={{ marginBottom: 2 }}>
//           Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
//           tempor incididunt ut labore et dolore magna aliqua. Rhoncus dolor purus non
//           enim praesent elementum facilisis leo vel. Risus at ultrices mi tempus
//           imperdiet. Semper risus in hendrerit gravida rutrum quisque non tellus.
//           Convallis convallis tellus id interdum velit laoreet id donec ultrices.
//           Odio morbi quis commodo odio aenean sed adipiscing. Amet nisl suscipit
//           adipiscing bibendum est ultricies integer quis. Cursus euismod quis viverra
//           nibh cras. Metus vulputate eu scelerisque felis imperdiet proin fermentum
//           leo. Mauris commodo quis imperdiet massa tincidunt. Cras tincidunt lobortis
//           feugiat vivamus at augue. At augue eget arcu dictum varius duis at
//           consectetur lorem. Velit sed ullamcorper morbi tincidunt. Lorem donec massa
//           sapien faucibus et molestie ac.
//         </Typography>
//         <Typography sx={{ marginBottom: 2 }}>
//           Consequat mauris nunc congue nisi vitae suscipit. Fringilla est ullamcorper
//           eget nulla facilisi etiam dignissim diam. Pulvinar elementum integer enim
//           neque volutpat ac tincidunt. Ornare suspendisse sed nisi lacus sed viverra
//           tellus. Purus sit amet volutpat consequat mauris. Elementum eu facilisis
//           sed odio morbi. Euismod lacinia at quis risus sed vulputate odio. Morbi
//           tincidunt ornare massa eget egestas purus viverra accumsan in. In hendrerit
//           gravida rutrum quisque non tellus orci ac. Pellentesque nec nam aliquam sem
//           et tortor. Habitant morbi tristique senectus et. Adipiscing elit duis
//           tristique sollicitudin nibh sit. Ornare aenean euismod elementum nisi quis
//           eleifend. Commodo viverra maecenas accumsan lacus vel facilisis. Nulla
//           posuere sollicitudin aliquam ultrices sagittis orci a.
//         </Typography> */}
//         <BottomNavigation
//           showLabels
//           value={0}
//           onChange={(event, newValue) => {
//             // setValue(newValue);
//           }}
//         >
//           <BottomNavigationAction label="Recents" icon={<RestoreOutlined />} />
//           <BottomNavigationAction label="Favorites" icon={<FavoriteOutlined />} />
//           <BottomNavigationAction label="Nearby" icon={<LocationOnOutlined />} />
//         </BottomNavigation>
//       </Box>
//     </Box>
//   );
// }

const toolbarHeight = 64;
const bottomNavigationHeight = 56;

export default function Layout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const [user, setUser] = useState(LoginProvider.getUser());
	const windowSize = useWindowSize();
	const router = useRouter();
	const drawerWidth = 240;
	const padding = 16 * 2;
	let contentHeight = windowSize.height - toolbarHeight - padding;
	let contentWidth = windowSize.width;
	const isMobile = window.innerWidth < 960;
	if (isMobile) {
		contentHeight -= bottomNavigationHeight;
	} else {
		contentWidth -= drawerWidth;
	}

	console.log('User', LoginProvider.getUser())

	async function login() {
		const credentials: LoginCredentials = {
			email: 'mario.rossi@gmail.com',
			password: 'password123',
		};
		await LoginProvider.login(credentials);
		setUser(LoginProvider.getUser());
	}

	function logout() {
		LoginProvider.logout();
		setUser(LoginProvider.getUser());
	}

	const drawer = (
		<div>
			<Toolbar />
			<Divider />
			<List>
				{['Inbox', 'Starred', 'Send email', 'Drafts'].map((text, index) => (
					<ListItem key={text} disablePadding>
						<ListItemButton>
							<ListItemIcon>
								{index % 2 === 0 ? <InboxOutlined /> : <MailOutlineOutlined />}
							</ListItemIcon>
							<ListItemText primary={text} />
						</ListItemButton>
					</ListItem>
				))}
			</List>
			<Divider />
			<List>
				{['All mail', 'Trash', 'Spam'].map((text, index) => (
					<ListItem key={text} disablePadding>
						<ListItemButton>
							<ListItemIcon>
								{index % 2 === 0 ? <InboxOutlined /> : <MailOutlineOutlined />}
							</ListItemIcon>
							<ListItemText primary={text} />
						</ListItemButton>
					</ListItem>
				))}
			</List>
		</div>
	);


	return <UserContext.Provider value={user}>
	
		<Box sx={{ display: 'flex' }}>
		<CssBaseline />
		<Drawer
			variant="permanent"
			sx={{
				display: { xs: 'none', sm: 'block' },
				'& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
			}}
			open
		>
			{drawer}
		</Drawer>
		<Box sx={{
			// width: { sm: `calc(100% - ${isMobile? 0 : drawerWidth}px)` },
			width: `${contentWidth}px`,
			height: '100vh',
			// ml: { sm: `${drawerWidth}px` },
			ml: isMobile? 0 : `${drawerWidth}px`,
			backgroundColor: 'pink'
		}}>
			<Box sx={{ padding: 2, display: 'flex', flexDirection: 'row' }}>
				{/* <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
					Photos
				</Typography> */}
				<Box component="div" sx={{ flexGrow: 1 }}></Box>
				{
					LoginProvider.isLoggedIn() ?
						<Button  startIcon={<CloseOutlined />} onClick={() => logout()}>
							Logout
						</Button> :
						<Button  startIcon={<AccountCircleOutlined />} onClick={() => router.push('/login')}>
							Login
						</Button>
				}
			</Box>
			<Paper elevation={isMobile? 0 : 1} sx={{ height: contentHeight + 'px', overflow: 'scroll', margin: 2, borderRadius: 2 }}>
				<Box>
					{windowSize.width}px
					{windowSize.height}px
					{children}
				</Box>
			</Paper>
			<Box sx={{ display: { md: 'none', lg: 'none' } }}>
			         <BottomNavigation
          showLabels
          value={0}
          onChange={(event, newValue) => {
            // setValue(newValue);
          }}
        >
          <BottomNavigationAction label="Recents" icon={<RestoreOutlined />} onClick={() => router.push('activities')} />
          <BottomNavigationAction label="Favorites" icon={<FavoriteOutlined />} onClick={() => router.push('reservations')} />
          <BottomNavigationAction label="Nearby" icon={<LocationOnOutlined />} onClick={() => router.push('rewards')} />
        </BottomNavigation>
			</Box>
		</Box>

	</Box>
	</UserContext.Provider>
}
