'use client'

import * as React from 'react';
import Box from '@mui/material/Box';
import { Button, Card, CardActions, CardContent, Chip, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, InputAdornment, InputLabel, MenuItem, OutlinedInput, Select, Skeleton, Snackbar, TextField, Typography } from '@mui/material';
import { AccessTimeOutlined, CalendarMonthOutlined, GroupsOutlined, PlaceOutlined, SearchOutlined } from '@mui/icons-material';
import { loadActivities, reserveActivity, ReserveActivityParams } from './actions';
import { useEffect } from 'react';
import { Activity } from '@/app/models/activity';
import Link from 'next/link';
import { UserContext } from '@/app/providers/userProvider';
import { loadLocations, loadSports } from '../filters';

export interface ActivityDialogProps {
	activity: Activity,
	isOpen: boolean,
	handleClose: () => void,
	handleReserveActivity: (partecipants: number, time: string) => void,
}

export function ActivityDialog(props: ActivityDialogProps) {
	const [timeValue, setTimeValue] = React.useState<string>(props.activity.times.length === 1 ? props.activity.times[0] : '');
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
				<Button variant='outlined' onClick={() => props.handleReserveActivity(partecipantsValue, timeValue)}>
					Prenota
				</Button>
			</DialogActions>
		</Dialog>
	);
}

export interface ActivityCardProps {
	activity: Activity | null,
	isLoggedIn: boolean,
	showCompanyLink: boolean,
	handleClickActivity: (activity: Activity) => void,
}

export function ActivityCard(props: ActivityCardProps) {
	function getRow(text: string, icon: React.ReactElement) {
		return (
			<Typography sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'start', alignItems: 'center', gap: 1, paddingBottom: 1 }}>
				{icon}
				{props.activity ? text : <Skeleton width={'100%'} />}
			</Typography>
		);
	}

	let statusChip: React.ReactElement;
	let isAvailable;
	let activityTitle;
	if (!props.activity) {
		statusChip = <Skeleton width={64} />;
		activityTitle = <Skeleton />;
		isAvailable = true;
	} else {
		activityTitle = <>
			{props.activity.sport} {props.showCompanyLink ? <>- <Link href={`/main/companies/${props.activity.companyId}`}>{props.activity.companyName}</Link></> : null}
		</>
		if (props.activity.isBanned) {
			statusChip = <Chip label='Non disponibile' color='error' size='small' />;
			isAvailable = false;
		} else if (props.isLoggedIn) {
			statusChip = <Chip label='Disponibile' color='success' size='small' />;
			isAvailable = true;
		} else if (props.activity.allowAnonymous) {
			statusChip = <Chip label='Prenotazione anonima' color='primary' size='small' />;
			isAvailable = true;
		} else {
			statusChip = <Chip label='Non disponibile' color='error' size='small' />;
			isAvailable = false;
		}
	}

	return (
		<Card
			elevation={isAvailable ? 1 : 0}
			sx={{
				minWidth: 275, flexGrow: 1,
				flexShrink: 1,
				flexBasis: 0,
				display: 'flex',
				flexDirection: 'column',
				justifyContent: 'space-between',
				opacity: isAvailable ? null : 0.5,
				backgroundColor: isAvailable ? null : 'lightgray'
			}}
		>
			<CardContent>
				{statusChip}
				<Box sx={{ paddingBottom: 1 }} />
				<Typography gutterBottom sx={{ fontSize: 20, fontWeight: 'bold' }}>{activityTitle}</Typography>
				<Box sx={{ paddingBottom: 1 }} />
				{getRow(`Data: ${props.activity?.date.toLocaleDateString()}`, <CalendarMonthOutlined />)}
				{getRow(`Orari disponibili: ${props.activity?.times.join(' - ')}`, <AccessTimeOutlined />)}
				{getRow(`Posti disponibili: ${props.activity?.maxPartecipants}`, <GroupsOutlined />)}
				{getRow(`Località: ${props.activity?.location}`, <PlaceOutlined />)}
			</CardContent>
			{isAvailable ?
				<CardActions sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'end', alignItems: 'center' }}>
					{
						props.activity ?
							<Button variant='outlined' size="small" onClick={() => props.handleClickActivity(props.activity!)}>Prenota</Button> : <Skeleton width={80}></Skeleton>
					}
				</CardActions>
				: null
			}
		</Card>
	);
}

export default function ActivitiesPage() {
	const [loading, setLoading] = React.useState(true);
	const [isDialogOpen, setIsDialogOpen] = React.useState(false);
	const [activities, setActivities] = React.useState<Activity[]>([]);
	const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);
	const [sports, setSports] = React.useState<string[]>([]);
	const [locations, setLocations] = React.useState<string[]>([]);
	const [location, setLocation] = React.useState<string>('ALL');
	const [search, setSearch] = React.useState<string>('');
	const [sport, setSport] = React.useState<string>('ALL');
	const selectedActivity = React.useRef<Activity | null>(null);
	const [snackbarMessage, setSnackbarMessage] = React.useState<string>('');
	const user = React.useContext(UserContext);

	useEffect(() => {
		_loadSports();
		_loadLocations();
	}, []);

	useEffect(() => {
		deboucedLoadActivities();
	}, [search, sport, location, user.isLoggedIn]);

	async function _loadActivities() {
		setLoading(true);
		const params: Map<string, string | null> = new Map<string, string | null>();
		if (user.isLoggedIn) {
			params.set('userId', `${user.id}`);
		}
		params.set('search', search);
		params.set('sport', sport);
		params.set('location', location);
		const _activities = await loadActivities(params);
		setActivities(_activities);
		timeoutRef.current = null;
		setLoading(false);
	}

	function handleClickActivity(activity: Activity) {
		selectedActivity.current = activity;
		setIsDialogOpen(true);
	}

	function handleChangeLocation(location: string) {
		setLocation(location);
	}

	function handleChangeSearch(value: string) {
		setSearch(value);
	}

	function handleChangeSport(sport: string) {
		setSport(sport);
	}

	function handleCloseDialog() {
		setIsDialogOpen(false);
	}

	async function handleReserveActivity(partecipants: number, time: string) {
		const params: ReserveActivityParams = {
			activity: selectedActivity.current!,
			partecipants: partecipants,
			reservationId: selectedActivity.current!.reservationId || null,
			time: time,
			userId: user.isLoggedIn ? user.id : null,
		};
		console.log(params);
		const reservation = await reserveActivity(params);
		if (reservation === null) {
			setSnackbarMessage('Impossibile prenotare l\'attività');
		} else {
			setSnackbarMessage('Attività prenotata');
			selectedActivity.current = null;
			setIsDialogOpen(false);
			deboucedLoadActivities();
		}
	}

	async function deboucedLoadActivities() {
		if (timeoutRef.current !== null) {
			clearTimeout(timeoutRef.current);
			console.log('Cancelling timeout...');
		}
		timeoutRef.current = setTimeout(() => _loadActivities(), 250);
	}

	async function _loadLocations() {
		const _locations = await loadLocations();
		setLocations(_locations);
	}

	async function _loadSports() {
		const _sports = await loadSports();
		setSports(_sports);
	}

	const activitiesToRender = loading ? [null, null, null, null] : activities;
	return (
		<>
			<Box sx={{ padding: 2, }}>
				<Typography sx={{ fontSize: 26, fontWeight: 'bold', paddingBottom: 2 }}>Attività</Typography>
				<OutlinedInput fullWidth placeholder='Cerca...' value={search} onChange={(event) => handleChangeSearch(event.target.value)} size='small' endAdornment={
					<InputAdornment position='end'><SearchOutlined /></InputAdornment>
				} />
				<Box sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', rowGap: 2, columnGap: 2, paddingTop: 2, paddingBottom: 2 }}>
					<Box sx={{
						minWidth: 275, flexGrow: 1,
						flexShrink: 1,
						flexBasis: 0,
						display: 'flex',
						flexDirection: 'column',
						justifyContent: 'space-between',
					}}>
						<TextField
							select
							defaultValue="ALL"
							value={sport}
							onChange={(event) => handleChangeSport(event.target.value)}
							size='small'
							slotProps={{
								input: {
									startAdornment: <InputAdornment position="start">Sport: </InputAdornment>,
								},
							}}
						>
							{sports.map((sport) => (
								<MenuItem key={sport} value={sport}>
									{sport === 'ALL' ? 'Tutti' : sport}
								</MenuItem>
							))}
						</TextField>

					</Box>
					<Box sx={{
						minWidth: 275, flexGrow: 1,
						flexShrink: 1,
						flexBasis: 0,
						display: 'flex',
						flexDirection: 'column',
						justifyContent: 'space-between',
					}}>
						<TextField
							select
							defaultValue="ALL"
							value={location}
							onChange={(event) => handleChangeLocation(event.target.value)}
							size='small'
							slotProps={{
								input: {
									startAdornment: <InputAdornment position="start">Località: </InputAdornment>,
								},
							}}
						>
							{locations.map((location) => (
								<MenuItem key={location} value={location}>
									{location === 'ALL' ? 'Tutti' : location}
								</MenuItem>
							))}
						</TextField>
					</Box>
				</Box>
				{
					activitiesToRender.length ?
						<Box sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', rowGap: 2, columnGap: 2 }}>
							{activitiesToRender.map((activity, index) =>
								<ActivityCard key={activity?.id || index} activity={activity} handleClickActivity={handleClickActivity} isLoggedIn={user.isLoggedIn} showCompanyLink={true} />
							)}
						</Box>
						:
						<Typography variant='h6' align='center' marginTop={4} marginBottom={4}>Nessuna attività disponibile</Typography>
				}
			</Box>
			{isDialogOpen ? <ActivityDialog isOpen={isDialogOpen} activity={selectedActivity.current!} handleClose={handleCloseDialog} handleReserveActivity={handleReserveActivity}></ActivityDialog> : null}
			<Snackbar
				open={!!snackbarMessage}
				autoHideDuration={6000}
				onClose={() => setSnackbarMessage('')}
				message={snackbarMessage}
			/>
		</>
	);
}