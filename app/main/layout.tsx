'use client'

// import type { Metadata } from "next";
// // import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import { AccountCircleOutlined, DirectionsRun, DirectionsRunOutlined, EmojiEvents, EmojiEventsOutlined, Event, EventOutlined, VisibilityOffOutlined } from "@mui/icons-material";
import { BottomNavigation, BottomNavigationAction, Button, Menu, MenuItem, Paper, Typography } from "@mui/material";
import Box from "@mui/material/Box/Box";
import CssBaseline from "@mui/material/CssBaseline/CssBaseline";
import Drawer from "@mui/material/Drawer/Drawer";
import List from "@mui/material/List/List";
import ListItem from "@mui/material/ListItem/ListItem";
import ListItemButton from "@mui/material/ListItemButton/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon/ListItemIcon";
import ListItemText from "@mui/material/ListItemText/ListItemText";
import Toolbar from "@mui/material/Toolbar/Toolbar";
import { useWindowSize } from "../hooks/useWindowSize";
import { usePathname, useRouter } from "next/navigation";
import { LoginProvider, UserContext } from "../providers/userProvider";
import { useState } from "react";
// export const metadata: Metadata = {
//   title: "BudGym",
//   description: "Trova il tuo prossimo sport!",
// };

const toolbarHeight = 64;
const bottomNavigationHeight = 56;

export default function Layout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const urlPath: string = usePathname();
	const [user, setUser] = useState(LoginProvider.getUser());
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
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

	const drawer = (
		<div style={{ height: '100vh' }}>
			<Toolbar>
				<Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
					BudGym
				</Typography>
			</Toolbar>
			<List sx={{ height: `calc(100vh - ${toolbarHeight}px)`, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
				<ListItem>
					<ListItemButton
						sx={{ borderRadius: 6 }}
						selected={isActiveView(0)}
						onClick={() => {
							goToRoute('activities', 0)
						}}>
						<ListItemIcon>
							{isActiveView(0) ?
								<DirectionsRun /> :
								<DirectionsRunOutlined />
							}
						</ListItemIcon>
						<ListItemText primary={'Attività'} />
					</ListItemButton>
				</ListItem>
				<ListItem>
					<ListItemButton
						sx={{ borderRadius: 6 }}
						selected={isActiveView(1)}
						onClick={() => {
							goToRoute('reservations', 1)
						}}>
						<ListItemIcon>
							{isActiveView(1) ?
								<Event /> :
								<EventOutlined />
							}
						</ListItemIcon>
						<ListItemText primary={'Prenotazioni'} />
					</ListItemButton>
				</ListItem>
				<ListItem >
					<ListItemButton
						sx={{ borderRadius: 6 }}
						selected={isActiveView(2)}
						onClick={() => {
							goToRoute('rewards', 2)
						}}>
						<ListItemIcon>
							{isActiveView(2) ?
								<EmojiEvents /> :
								<EmojiEventsOutlined />
							}
						</ListItemIcon>
						<ListItemText primary={'Premi'} />
					</ListItemButton>
				</ListItem>
			</List>
		</div>
	);

	function goToRoute(route: string, index: number) {
		localStorage.setItem('mainViewIndex', `${index}`);
		router.push(`/main/${route}`);
	}

	function getViewIndex(): number {
		if (urlPath.includes('reservations')) {
			return 1;
		} else if (urlPath.includes('rewards')) {
			return 2;
		} else if (urlPath.includes('activities')){
			return 0;
		} else {
			const savedViewIndex = localStorage.getItem('mainViewIndex');
			if (savedViewIndex !== null) {
				return +savedViewIndex;
			} else {
				return 0;
			}
		}
	}

	function handleClickUserMenu(event: React.MouseEvent<HTMLButtonElement>) {
		setAnchorEl(event.currentTarget);
	};

	function handleCloseUserMenu() {
		setAnchorEl(null);
	};

	function isActiveView(pathIndex: number): boolean {
		return getViewIndex() === pathIndex;
	}

	function logout() {
		LoginProvider.logout();
		setUser(LoginProvider.getUser());
		setAnchorEl(null);
	}

	return <UserContext.Provider value={user}>
		<Box sx={{ display: 'flex', backgroundColor: '#6fbcff29' }}>
			<CssBaseline />
			{
				isMobile ? null :
					<Drawer
						variant="permanent"
						sx={{
							'& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, backgroundColor: 'transparent', borderRight: 'none' },
						}}
						open
					>
						{drawer}
					</Drawer>
			}
			<Box sx={{
				// width: { sm: `calc(100% - ${isMobile? 0 : drawerWidth}px)` },
				width: `${contentWidth}px`,
				height: '100vh',
				// ml: { sm: `${drawerWidth}px` },
				ml: isMobile ? 0 : `${drawerWidth}px`,
			}}>
				<Box sx={{ padding: 2, display: 'flex', flexDirection: 'row' }}>
					{/* <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
					Photos
				</Typography> */}
					<Box component="div" sx={{ flexGrow: 1 }}></Box>
						<Button startIcon={user.isLoggedIn? <AccountCircleOutlined /> : <VisibilityOffOutlined />} onClick={handleClickUserMenu}>
							{user.isLoggedIn? `${user.name} ${user.surname}` : 'Modalità anonima'}
						</Button>
						<Menu
							id="user-menu"
							anchorEl={anchorEl}
							open={!!anchorEl}
							onClose={handleCloseUserMenu}
						>
							{
								user.isLoggedIn?
								<MenuItem onClick={() => logout()}>Logout</MenuItem>
								:
								<MenuItem onClick={() => router.push('/login')}>Accedi</MenuItem>

							}
						</Menu>
				</Box>
				<Paper elevation={isMobile ? 0 : 1} sx={{ height: contentHeight + 'px', overflow: 'scroll', margin: 2, borderRadius: 2 }}>
					<Box>
						{children}
					</Box>
				</Paper>
				{
					isMobile ?
						<Box>
							<BottomNavigation
								showLabels
								value={getViewIndex()}
							>
								<BottomNavigationAction label="Attività" icon={isActiveView(0) ? <DirectionsRun /> : <DirectionsRunOutlined />} onClick={() => goToRoute('activities', 0)} />
								<BottomNavigationAction label="Prenotazioni" icon={isActiveView(1) ? <Event /> : <EventOutlined />} onClick={() => goToRoute('reservations', 1)} />
								<BottomNavigationAction label="Premi" icon={isActiveView(2) ? <EmojiEvents /> : <EmojiEventsOutlined />} onClick={() => goToRoute('rewards', 2)} />
							</BottomNavigation>
						</Box>
						: null
				}
			</Box>

		</Box>
	</UserContext.Provider>
}
