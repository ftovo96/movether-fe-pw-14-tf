
import * as React from 'react';
import Box from '@mui/material/Box';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import RestoreIcon from '@mui/icons-material/Restore';
import FavoriteIcon from '@mui/icons-material/Favorite';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { AppBar, Button, Card, CardActions, CardContent, Container, IconButton, Toolbar, Typography } from '@mui/material';
import { MenuOutlined } from '@mui/icons-material';

export default function Home() {

  return <p>Hello react!</p>

  // return (
  //   <Container>
  //   <Box sx={{ flexGrow: 1 }}>
  //     <AppBar position="static">
  //       <Toolbar>
  //         <IconButton
  //           size="large"
  //           edge="start"
  //           color="inherit"
  //           aria-label="menu"
  //           sx={{ mr: 2 }}
  //         >
  //           <MenuOutlined></MenuOutlined>
  //         </IconButton>
  //         <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
  //           News
  //         </Typography>
  //         <Button color="inherit">Login</Button>
  //       </Toolbar>
  //     </AppBar>
  //   </Box>
  //   <Box height={32}></Box>
  //   <Card sx={{ minWidth: 275 }}>
  //     <CardContent>
  //       <Typography gutterBottom sx={{ color: 'text.secondary', fontSize: 14 }}>
  //         Word of the Day
  //       </Typography>
  //       <Typography variant="h5" component="div">
  //         content
  //       </Typography>
  //       <Typography sx={{ color: 'text.secondary', mb: 1.5 }}>adjective</Typography>
  //       <Typography variant="body2">
  //         well meaning and kindly.
  //         <br />
  //         {'"a benevolent smile"'}
  //       </Typography>
  //     </CardContent>
  //     <CardActions>
  //       <Button size="small">Learn More</Button>
  //     </CardActions>
  //   </Card>
  //   <Box height={32}></Box>
  //   <Box>
  //     <BottomNavigation
  //       showLabels
  //       value={value}
  //       onChange={(event, newValue) => {
  //         setValue(newValue);
  //       }}
  //     >
  //       <BottomNavigationAction label="Recents" icon={<RestoreIcon />} />
  //       <BottomNavigationAction label="Favorites" icon={<FavoriteIcon />} />
  //       <BottomNavigationAction label="Nearby" icon={<LocationOnIcon />} />
  //     </BottomNavigation>
  //   </Box>
  //   </Container>
  // );
}