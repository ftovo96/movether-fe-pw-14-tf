'use client'

// import type { Metadata } from "next";
// // import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import { AccountCircleOutlined, CloseOutlined, DirectionsRun, DirectionsRunOutlined, EmojiEvents, EmojiEventsOutlined, Event, EventOutlined } from "@mui/icons-material";
import { BottomNavigation, BottomNavigationAction, Button, Paper, Typography } from "@mui/material";
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
import { useRouter } from "next/navigation";
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
	const [user, setUser] = useState(LoginProvider.getUser());
	const [viewIndex, setViewIndex] = useState<number>(0);
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

	function logout() {
		LoginProvider.logout();
		setUser(LoginProvider.getUser());
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
						selected={viewIndex === 0}
						onClick={() => {
							setViewIndex(0);
							router.push('/main/activities')
						}}>
						<ListItemIcon>
							{viewIndex === 0 ?
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
						selected={viewIndex === 1}
						onClick={() => {
							setViewIndex(1);
							router.push('/main/reservations')
						}}>
						<ListItemIcon>
							{viewIndex === 1 ?
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
						selected={viewIndex === 2}
						onClick={() => {
							setViewIndex(2);
							router.push('/main/rewards')
						}}>
						<ListItemIcon>
							{viewIndex === 2 ?
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
					{
						LoginProvider.isLoggedIn() ?
							<Button startIcon={<CloseOutlined />} onClick={() => logout()}>
								Logout
							</Button> :
							<Button startIcon={<AccountCircleOutlined />} onClick={() => router.push('/login')}>
								Login
							</Button>
					}
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
								value={viewIndex}
								onChange={(event, newValue) => {
									setViewIndex(newValue);
								}}
							>
								<BottomNavigationAction label="Attività" icon={viewIndex === 0 ? <DirectionsRun /> : <DirectionsRunOutlined />} onClick={() => router.push('activities')} />
								<BottomNavigationAction label="Prenotazioni" icon={viewIndex === 1 ? <Event /> : <EventOutlined />} onClick={() => router.push('reservations')} />
								<BottomNavigationAction label="Premi" icon={viewIndex === 2 ? <EmojiEvents /> : <EmojiEventsOutlined />} onClick={() => router.push('rewards')} />
							</BottomNavigation>
						</Box>
						: null
				}
			</Box>

		</Box>
	</UserContext.Provider>
}
