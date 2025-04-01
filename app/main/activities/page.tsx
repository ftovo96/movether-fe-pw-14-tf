'use client'

import * as React from 'react';
import Box from '@mui/material/Box';
import { Alert, Button, Card, CardActions, CardContent, Chip, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, InputLabel, MenuItem, Select, Skeleton, Snackbar, Typography } from '@mui/material';
import { AccessTimeOutlined, CalendarMonthOutlined, GroupsOutlined, PlaceOutlined } from '@mui/icons-material';
import { ActivityOption, getActivitiesOptions, loadActivities, reserveActivity, ReserveActivityParams } from './actions';
import { useEffect } from 'react';
import { Activity } from '@/app/models/activity';
import Link from 'next/link';
import { UserContext } from '@/app/providers/userProvider';
import { loadLocations, loadSports } from '../filters';
import { Reservation } from '@/app/models/reservation';
import { ReservationsProvider } from '@/app/providers/reservationsProvider';
import { SectionHeader } from '@/app/widgets/section-header';

export interface ActivityDialogProps {
	activity: Activity,
	isOpen: boolean,
	handleClose: () => void,
	handleReserveActivity: (activityOption: ActivityOption, partecipants: number) => void,
}

/**
 * @description Componente che gestisce la Dialog (finestra) per effettuare
 * e modificare le prenotazioni.
 */
export function ActivityDialog(props: ActivityDialogProps) {
	const [timeValue, setTimeValue] = React.useState<string>(props.activity.times.length === 1 ? props.activity.times[0] : '');
	const [partecipantsValue, setPartecipantsValue] = React.useState<number>(1);
	const [partecipantsValues, setPartecipantsValues] = React.useState<number[]>([]);
	const user = React.useContext(UserContext);
	const activityOptions = React.useRef<ActivityOption[]>([]);

	useEffect(() => {
		_loadActivityOptions();
	}, []);

	function handleReserveActivity() {
		if (!timeValue || !partecipantsValue) {
			return;
		}
		const _activityOption = activityOptions.current.find(activity => activity.time === timeValue)!;
		props.handleReserveActivity(_activityOption, partecipantsValue);
	}

	async function _loadActivityOptions() {
		const _activityOptions = await getActivitiesOptions(props.activity.id, user.isLoggedIn ? user.id : null);
		activityOptions.current = _activityOptions;
		if (activityOptions.current.length === 1) {
			onChangeTimeOption(activityOptions.current[0].time);
		} else {
			const partecipantsValues = Array.from({ length: activityOptions.current[0].availablePartecipants }).map((x, index) => index + 1);
			setPartecipantsValues(partecipantsValues);
		}
		console.log(_activityOptions);
	}

	function onChangeTimeOption(time: string) {
		setTimeValue(time);
		const _activityOption = activityOptions.current.find(activity => activity.time === time)!;
		const partecipantsValues = Array.from({ length: _activityOption.availablePartecipants }).map((x, index) => index + 1);
		setPartecipantsValues(partecipantsValues);
		if (partecipantsValue > _activityOption.availablePartecipants) {
			setPartecipantsValue(_activityOption.availablePartecipants);
		} else if (!user.isLoggedIn) {
			setPartecipantsValue(1);
		}
	}

	return (
		<Dialog
			open={props.isOpen}
			onClose={props.handleClose}
		>
			<DialogTitle>
				{"Prenota attività"}
			</DialogTitle>
			<DialogContent
				sx={{ minWidth: 320 }}>
				<Typography paddingBottom={2}>Sport: {props.activity.sport}</Typography>
				<Typography paddingBottom={2}>Località: {props.activity.location}</Typography>
				<Typography paddingBottom={2}>Descrizione: {props.activity.description}</Typography>
				<FormControl variant="filled" fullWidth>
					<InputLabel>Orario</InputLabel>
					<Select
						value={timeValue}
						disabled={props.activity.times.length < 2}
						onChange={(event) => onChangeTimeOption(event.target.value)}
					>
						{
							props.activity.times.map(time => <MenuItem key={time} value={time}>{time}</MenuItem>)
						}
					</Select>
				</FormControl>
				<Box sx={{ padding: 1 }} />
				{
					partecipantsValues.length || !timeValue ?
						<FormControl variant="filled" fullWidth>
							<InputLabel>Posti</InputLabel>
							<Select
								value={partecipantsValue}
								disabled={partecipantsValues.length < 2 || !user.isLoggedIn}
								onChange={(event) => setPartecipantsValue(+event.target.value)}
							>
								{
									partecipantsValues.map(value => <MenuItem key={value} value={value}>{value}</MenuItem>)
								}
							</Select>
						</FormControl>
						:
						<Alert severity="error">
							<Typography>
								Attività non disponibile nell&apos;orario selezionato
							</Typography>
						</Alert>
				}
			</DialogContent>
			<DialogActions>
				<Button onClick={props.handleClose}>Annulla</Button>
				<Button variant='outlined' onClick={handleReserveActivity} disabled={!timeValue || !partecipantsValue}>
					Prenota
				</Button>
			</DialogActions>
		</Dialog>
	);
}

export interface ReservationCodesDialogProps {
	reservation: Reservation,
	isOpen: boolean,
	handleClose: () => void,
}

/**
 * @description Componente che mostra la dialog con il numero di prenotazione (id)
 * e codice di sicurezza ("password") per la gestione delle prenotazioni "anonime"
 */
export function ReservationCodesDialog(props: ReservationCodesDialogProps) {
	return (
		<Dialog
			open={props.isOpen}
			onClose={props.handleClose}
		>
			<DialogTitle>
				{"Prenotazione effettuata!"}
			</DialogTitle>
			<DialogContent
				sx={{ minWidth: 320 }}>
				<Typography>Hai effettuato con successo la prenotazione!</Typography>
				<Typography>Per gestirla avrai bisogno dei seguenti codici; non li dimenticare!</Typography>
				<Box sx={{ padding: 1 }} />
				<Box sx={{ display: 'flex', flexDirection: 'row' }}>
					<Typography fontWeight={'bold'}>Numero prenotazione:&nbsp;</Typography>
					<Typography>{props.reservation.id}</Typography>
				</Box>
				<Box sx={{ display: 'flex', flexDirection: 'row' }}>
					<Typography fontWeight={'bold'}>Codice di sicurezza:&nbsp;</Typography>
					<Typography>{props.reservation.securityCode}</Typography>
				</Box>
			</DialogContent>
			<DialogActions>
				<Button variant='outlined' onClick={() => props.handleClose()}>
					Ok, capito!
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

/**
 * @description Componente che mostra i dati di una attività
 */
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
			{props.activity.sport} {props.showCompanyLink ? <>- <Link style={{ textDecoration: 'underline' }} href={`/main/companies/${props.activity.companyId}`}>{props.activity.companyName}</Link></> : null}
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
	const [isReservationDialogOpen, setIsReservationDialogOpen] = React.useState(false);
	const [activities, setActivities] = React.useState<Activity[]>([]);
	const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);
	const [sports, setSports] = React.useState<string[]>([]);
	const [locations, setLocations] = React.useState<string[]>([]);
	const [location, setLocation] = React.useState<string>('ALL');
	const [search, setSearch] = React.useState<string>('');
	const [sport, setSport] = React.useState<string>('ALL');
	const selectedActivity = React.useRef<Activity | null>(null);
	const createdReservation = React.useRef<Reservation | null>(null);
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

	async function handleReserveActivity(activityOption: ActivityOption, partecipants: number) {
		const params: ReserveActivityParams = {
			activityOption: activityOption,
			partecipants: partecipants,
			userId: user.isLoggedIn ? user.id : null,
			reservationId: null,
		};
		if (!user.isLoggedIn) {
			// Se l'utente non ha effettuato l'accesso verifico se ha prenotazioni
			// anonime. Se ce ne è una per l'attività attuale, aggiungo
			// il suo id così da poterla sovrascrivere.
			const reservations = ReservationsProvider.getReservations();
			const foundReservation = reservations.find(res => res.activityId === activityOption.activityId);
			console.log(foundReservation);
			if (foundReservation) {
				params.reservationId = foundReservation.id;
			}
		}
		console.log(params);
		const reservation = await reserveActivity(params);
		if (reservation === null) {
			setSnackbarMessage('Impossibile prenotare l\'attività');
		} else {
			setIsDialogOpen(false);
			if (user.isLoggedIn) {
				setSnackbarMessage('Attività prenotata');
				deboucedLoadActivities();
			} else {
				createdReservation.current = reservation;
				ReservationsProvider.saveReservation(reservation);
				setIsReservationDialogOpen(true);
			}
		}
	}

	function handleCloseReservationCodesDialog() {
		setIsReservationDialogOpen(false);
		deboucedLoadActivities();
	}

	/**
	 * @description Funzione che fa da wrapper a quella che carica le
	 * attività per evitare di effettuare troppe chiamate consecutive,
	 * riducendo la frequenza massima a 1 ogni 250ms (4 al secondo).
	 */
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

	// Se sto caricando le attività creo una lista di elementi fittizzi (null)
	// per mostrare gli skeleton durante il caricamento.
	const activitiesToRender = loading ? [null, null, null, null] : activities;
	return (
		<>
			<Box sx={{ padding: 2, }}>
				<SectionHeader
					title='Attività'
					showBackButton={false}
					showSearchField={true}
					showFilters={true}
					showBanner={false}
					search={search}
					sport={sport}
					location={location}
					sports={sports}
					locations={locations}
					onChangeSearch={handleChangeSearch}
					onChangeSport={handleChangeSport}
					onChangeLocation={handleChangeLocation}
				/>
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
			{isDialogOpen ? <ActivityDialog isOpen={true} activity={selectedActivity.current!} handleClose={handleCloseDialog} handleReserveActivity={handleReserveActivity} /> : null}
			{isReservationDialogOpen ? <ReservationCodesDialog isOpen={true} reservation={createdReservation.current!} handleClose={handleCloseReservationCodesDialog} /> : null}
			<Snackbar
				open={!!snackbarMessage}
				autoHideDuration={6000}
				onClose={() => setSnackbarMessage('')}
				message={snackbarMessage}
			/>
		</>
	);
}