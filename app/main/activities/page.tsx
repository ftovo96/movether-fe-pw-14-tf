'use client'

import * as React from 'react';
import Box from '@mui/material/Box';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import RestoreIcon from '@mui/icons-material/Restore';
import FavoriteIcon from '@mui/icons-material/Favorite';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { AppBar, Button, Card, CardActions, CardContent, Chip, Container, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, FormControl, IconButton, InputLabel, MenuItem, Select, Toolbar, Typography } from '@mui/material';
import { AccessTimeOutlined, CalendarMonthOutlined, GroupsOutlined, LockClockOutlined, MenuOutlined, PlaceOutlined, TimerOutlined } from '@mui/icons-material';
import { loadActivities, reserveActivity, ReserveActivityParams } from './actions';
import { useEffect } from 'react';
import { Activity } from '@/app/models/activity';
import Link from 'next/link';
import { UserContext } from '@/app/providers/userProvider';

interface ActivityDialogProps {
  activity: Activity,
  isOpen: boolean,
  handleClose: () => void,
  handleReserveActivity: () => void,
}

function ActivityDialog(props: ActivityDialogProps) {
  const [timeValue, setTimeValue] = React.useState<string>(props.activity.times.length === 1? props.activity.times[0] : '');
  const [partecipantsValue, setPartecipantsValue] = React.useState<number>(1);
  const partecipantsValues: number[] = Array.from({ length: props.activity.maxPartecipants }).map((x, index) => index + 1);

  return (
    <Dialog
      open={props.isOpen}
      onClose={props.handleClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">
        {"Prenota attività"}
      </DialogTitle>
      <DialogContent
        sx={{ minWidth: 320 }}>
        {/* <DialogContentText id="alert-dialog-description">
          Let Google help apps determine location. This means sending anonymous
          location data to Google, even when no apps are running.
        </DialogContentText> */}
        <FormControl variant="filled" fullWidth>
          <InputLabel id="demo-simple-select-filled-label">Orario</InputLabel>
          <Select
            labelId="demo-simple-select-filled-label"
            id="demo-simple-select-filled"
            value={timeValue}
            disabled={props.activity.times.length < 2}
            onChange={(event) => setTimeValue(event.target.value)}
          >
            {
              props.activity.times.map(time => <MenuItem key={time} value={time}>{time}</MenuItem>)
            }
          </Select>
        </FormControl>
        <Box sx={{ padding: 1 }} />
        <FormControl variant="filled" fullWidth>
          <InputLabel id="demo-simple-select-filled-label">Posti</InputLabel>
          <Select
            labelId="demo-simple-select-filled-label"
            id="demo-simple-select-filled"
            value={partecipantsValue}
            disabled={partecipantsValues.length < 2}
            onChange={(event) => setPartecipantsValue(+event.target.value)}
          >
            {
              partecipantsValues.map(value => <MenuItem key={value} value={value}>{value}</MenuItem>)
            }
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={props.handleClose}>Annulla</Button>
        <Button variant='outlined' onClick={props.handleReserveActivity}>
          Prenota
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default function ActivitiesPage() {
  const [loading, setLoading] = React.useState(false);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const activities = React.useRef<Activity[]>([]);
  const selectedActivity = React.useRef<Activity | null>(null);
  const user = React.useContext(UserContext);

  useEffect(() => {
    loadAllActivities();
  }, []);

  function handleClickActivity(activity: Activity) {
    selectedActivity.current = activity;
    setIsDialogOpen(true);
  }

  function handleCloseDialog() {
    setIsDialogOpen(false);
  }

  async function handleReserveActivity() {
    const params: ReserveActivityParams = {
      activity: selectedActivity.current!,
      partecipants: 1,
      reservationId: selectedActivity.current!.reservationId || null,
      time: selectedActivity.current!.times[0],
      userId: null,
    };
    console.log(params);
    const reservation = await reserveActivity(params);
    if (reservation === null) {
      console.error('error!');
    } else {
      selectedActivity.current = null;
      setIsDialogOpen(false);
      loadAllActivities();
    }
  }

  async function loadAllActivities() {
    setLoading(true);
    activities.current = await loadActivities();
    console.log(activities)
    setLoading(false);
  }

  return (
    <>
      <Box sx={{ padding: 2, }}>
        <Typography sx={{ fontSize: 26, fontWeight: 'bold' }}>Attività: {activities.current.length}</Typography>
        <Typography>Utente: {user.isLoggedIn? `${user.name} ${user.surname}` : 'Anonimo'}</Typography>
        <p>Loading: {loading ? 'true' : 'false'}</p>
        <Box sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', rowGap: 2, columnGap: 2 }}>
          {activities.current.map(activity =>
            <Card key={activity.id} sx={{
              minWidth: 275, flexGrow: 1,
              flexShrink: 1,
              flexBasis: 0,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}>
              <CardContent>
                <Chip label="Prenotazione anonima" color="primary" size='small' />
                <Typography gutterBottom sx={{ fontSize: 18 }}>
                  {activity.sport} - <Link href={'/'}>{activity.companyName}</Link>
                </Typography>
                <Typography>
                  <CalendarMonthOutlined />
                  Data: {activity.date.toLocaleDateString()}
                </Typography>
                <Typography>
                  <AccessTimeOutlined />
                  Orari disponibili: {activity.times.join(' - ')}
                </Typography>
                <Typography>
                  <GroupsOutlined />
                  Posti disponibili: {activity.maxPartecipants}
                </Typography>
                <Typography>
                  <PlaceOutlined />
                  Località: {activity.location}
                </Typography>
              </CardContent>
              <CardActions >
                <Button variant='outlined' size="small" onClick={() => handleClickActivity(activity)}>Prenota</Button>
              </CardActions>
            </Card>
          )}
        </Box>
      </Box>
      {isDialogOpen ? <ActivityDialog isOpen={isDialogOpen} activity={selectedActivity.current!} handleClose={handleCloseDialog} handleReserveActivity={() => handleReserveActivity()}></ActivityDialog> : null}
    </>
  );
}