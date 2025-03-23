'use client'

import * as React from 'react';
import Box from '@mui/material/Box';
import { Button, Card, CardActions, CardContent, Chip, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, InputAdornment, InputLabel, MenuItem, OutlinedInput, Rating, Select, Skeleton, Snackbar, TextField, Typography } from '@mui/material';
import { CalendarMonthOutlined, GroupsOutlined, PlaceOutlined, SearchOutlined } from '@mui/icons-material';
import { deleteReservation, editReservation, EditReservationParams, FeedbackParams, getReservationOptions, loadReservations, sendFeedback } from './actions';
import { useEffect } from 'react';
import Link from 'next/link';
import { UserContext } from '@/app/providers/userProvider';
import { loadLocations, loadSports } from '../filters';
import { Reservation, ReservationOption } from '@/app/models/reservation';

interface FeedbackDialogProps {
	reservation: Reservation,
	isOpen: boolean,
	handleClose: () => void,
	handleSendFeedback: (score: number, message: string) => void,
}

function FeedbackDialog(props: FeedbackDialogProps) {
	const [score, setScore] = React.useState(5);
	const [message, setMessage] = React.useState('');

	function handleSendFeedback() {
		props.handleSendFeedback(score, message);
	}

	return (
		<Dialog
			open={props.isOpen}
			onClose={props.handleClose}
			aria-labelledby="alert-dialog-title"
			aria-describedby="alert-dialog-description"
		>
			<DialogTitle id="alert-dialog-title">
				{"Lascia feedback"}
			</DialogTitle>
			<DialogContent
				sx={{ minWidth: 320 }}>
				<Box sx={{ display: 'flex', flexDirection: 'row', gap: 1, alignItems: 'center' }}>
					<Typography>Punteggio:</Typography>
					<Rating
						size='large'
						value={score}
						onChange={(event, newValue) => {
							setScore(newValue || 0);
						}}
					/>
				</Box>
				<Box sx={{ padding: 1 }} />
				<TextField
					fullWidth
					id="outlined-multiline-flexible"
					label="Messaggio (opzionale)"
					multiline
					value={message}
					onChange={event => setMessage(event.target.value)}
				/>
			</DialogContent>
			<DialogActions>
				<Button onClick={props.handleClose}>Annulla</Button>
				<Button variant='outlined' onClick={handleSendFeedback}>
					Invia feedback
				</Button>
			</DialogActions>
		</Dialog>
	);
}

interface DeleteDialogProps {
	reservation: Reservation,
	isOpen: boolean,
	handleClose: () => void,
	handleDeleteReservation: (reservation: Reservation) => void,
}

function DeleteReservationDialog(props: DeleteDialogProps) {
	return (
		<Dialog
			open={props.isOpen}
			onClose={props.handleClose}
			aria-labelledby="alert-dialog-title"
			aria-describedby="alert-dialog-description"
		>
			<DialogTitle id="alert-dialog-title">
				{"Eliminare prenotazione?"}
			</DialogTitle>
			<DialogContent
				sx={{ minWidth: 320 }}>
				<Typography>L&apos;operazione è irreversibile!</Typography>
			</DialogContent>
			<DialogActions>
				<Button onClick={props.handleClose}>No, annulla</Button>
				<Button variant='outlined' color='error' onClick={() => props.handleDeleteReservation(props.reservation)}>
					Sì, elimina
				</Button>
			</DialogActions>
		</Dialog>
	);
}

interface EditDialogProps {
	reservation: Reservation,
	reservationOptions: ReservationOption[],
	isOpen: boolean,
	handleClose: () => void,
	handleEditReservation: (time: string, partecipants: number, option: ReservationOption, reservation: Reservation) => void,
}

function EditReservationDialog(props: EditDialogProps) {
	const [reservationOption, setReservationOption] = React.useState<ReservationOption>(props.reservationOptions[0]);
	const [timeValue, setTimeValue] = React.useState<string>(props.reservation.time);
	const [partecipantsValue, setPartecipantsValue] = React.useState<number>(props.reservation.partecipants);
	const [partecipantsValues, setPartecipantsValues] = React.useState<number[]>([]);

	useEffect(() => handleChangeTime(props.reservation.time), []);

	function handleChangeTime(time: string) {
		const option = props.reservationOptions.find((option) => option.time === time)!;
		const _partecipantsValues = Array.from({ length: option.availablePartecipants }).map((x, index) => index + 1);
		setTimeValue(time);
		setPartecipantsValues(_partecipantsValues);
		if (partecipantsValue > option.availablePartecipants) {
			setPartecipantsValue(option.availablePartecipants);
		}
		setReservationOption(option);
	}

	return (
		<Dialog
			open={props.isOpen}
			onClose={props.handleClose}
			aria-labelledby="alert-dialog-title"
			aria-describedby="alert-dialog-description"
		>
			<DialogTitle id="alert-dialog-title">
				{"Modifica prenotazione"}
			</DialogTitle>
			<DialogContent
				sx={{ minWidth: 420 }}>
				<FormControl variant="filled" fullWidth>
					<InputLabel id="demo-simple-select-filled-label">Orario</InputLabel>
					<Select
						labelId="demo-simple-select-filled-label"
						id="demo-simple-select-filled"
						value={timeValue}
						disabled={props.reservationOptions.length < 2}
						onChange={(event) => handleChangeTime(event.target.value)}
					>
						{
							props.reservationOptions.map(option => <MenuItem key={option.time} value={option.time}>{option.time}</MenuItem>)
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
				<Button variant='outlined' onClick={() => props.handleEditReservation(timeValue, partecipantsValue, reservationOption, props.reservation)}>
					Modifica prenotazione
				</Button>
			</DialogActions>
		</Dialog>
	);
}

interface ReservationCardProps {
	reservation: Reservation | null,
	handleClickFeedback: (reservation: Reservation) => void,
	handleEditReservation: (reservation: Reservation) => void,
	handleDeleteReservation: (reservation: Reservation) => void,
	// handleClickActivity: (activity: Activity) => void,
}

function ReservationCard(props: ReservationCardProps) {
	function getRow(text: string, icon: React.ReactElement) {
		return (
			<Typography sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'start', alignItems: 'center', gap: 1, paddingBottom: 1 }}>
				{icon}
				{props.reservation ? text : <Skeleton width={'100%'} />}
			</Typography>
		);
	}

	let statusChip: React.ReactElement;
	let isDisabled: boolean;
	let actions: React.ReactElement[] = [];
	let reservationTitle;
	if (props.reservation !== null) {
		reservationTitle = <>{props.reservation.sport} - <Link href={`/main/companies/${props.reservation.companyId}`}>{props.reservation.companyName}</Link></>;
		const reservationDate = new Date(`${props.reservation.date.toDateString()} ${props.reservation.time}`);
		const hasExpired = Date.now() > reservationDate.getTime();
		const isExpiring = (Date.now() - reservationDate.getTime()) < (24 * 60 * 60 * 1000);
		isDisabled = hasExpired && !isExpiring && props.reservation.validated === false;
		if (props.reservation.validated) {
			statusChip = <Chip label='Validata' color='success' size='small' />;
		} else if (hasExpired && props.reservation.validated === false) {
			statusChip = <Chip label='Scaduta' color='error' size='small' />
		} else if (hasExpired && !props.reservation.validated) {
			statusChip = <Chip label='In attesa di validazione' color='warning' size='small' />
		} else if (isExpiring) {
			statusChip = <Chip label='In scandenza' color='warning' size='small' />
		} else {
			statusChip = <Chip label='Disponibile' color='success' size='small' />;
		}
		if (props.reservation.validated && !props.reservation.feedbackId) {
			actions = [
				<Button key='feedback' variant='outlined' size="small" onClick={() => props.handleClickFeedback(props.reservation!)}>Lascia feedback</Button>
			];
		} else if (!hasExpired) {
			actions = [
				<Button key='edit' variant='outlined' size="small" onClick={() => props.handleEditReservation(props.reservation!)}>Modifica</Button>,
				<Button key='delete' variant='outlined' color='error' size="small" onClick={() => props.handleDeleteReservation(props.reservation!)}>Elimina</Button>
			];
		}
	} else {
		isDisabled = false;
		statusChip = <Skeleton width={64} />;
		actions = [<Skeleton key={0} width={80}></Skeleton>];
	}
	return (
		<Card sx={{
			minWidth: 275, flexGrow: 1,
			flexShrink: 1,
			flexBasis: 0,
			display: 'flex',
			flexDirection: 'column',
			justifyContent: 'space-between',
			opacity: !isDisabled ? null : 0.5,
			backgroundColor: !isDisabled ? null : 'lightgray'
		}}>
			<CardContent>
				{statusChip}
				<Box sx={{ paddingBottom: 1 }} />
				<Typography gutterBottom sx={{ fontSize: 20, fontWeight: 'bold' }}>{reservationTitle}</Typography>
				<Box sx={{ paddingBottom: 1 }} />
				{getRow(`Data: ${props.reservation?.date.toLocaleDateString()} alle  ${props.reservation?.time}`, <CalendarMonthOutlined />)}
				{getRow(`Posti disponibili: ${props.reservation?.availablePartecipants}`, <GroupsOutlined />)}
				{getRow(`Posti riservati: ${props.reservation?.partecipants}`, <GroupsOutlined />)}
				{getRow(`Località: ${props.reservation?.location}`, <PlaceOutlined />)}
			</CardContent>
			<CardActions sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'end', alignItems: 'center' }}>
				{actions}
			</CardActions>
		</Card>
	);
}

export default function ReservationsPage() {
	const [loading, setLoading] = React.useState(false);
	const [isFeedbackDialogOpen, setIsFeedbackDialogOpen] = React.useState(false);
	const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
	const [reservations, setReservations] = React.useState<Reservation[]>([]);
	const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);
	const [sports, setSports] = React.useState<string[]>([]);
	const [locations, setLocations] = React.useState<string[]>([]);
	const [location, setLocation] = React.useState<string>('ALL');
	const [search, setSearch] = React.useState<string>('');
	const [sport, setSport] = React.useState<string>('ALL');
	const [reservationOptions, setReservationOptions] = React.useState<ReservationOption[]>([]);
	const selectedReservation = React.useRef<Reservation | null>(null);
	const [snackbarMessage, setSnackbarMessage] = React.useState<string>('');
	const user = React.useContext(UserContext);

	useEffect(() => {
		_loadSports();
		_loadLocations();
	}, []);

	useEffect(() => {
		deboucedLoadReservations();
	}, [search, sport, location, user.isLoggedIn]);

	async function _loadReservations() {
		setLoading(true);
		const params: Map<string, string | null> = new Map<string, string | null>();
		if (user.isLoggedIn) {
			params.set('userId', `${user.id}`);
		}
		params.set('search', search);
		params.set('sport', sport);
		params.set('location', location);
		const _reservations = await loadReservations(params);
		setReservations(_reservations);
		console.log(_reservations);
		timeoutRef.current = null;
		setLoading(false);
	}

	function handleClickFeedback(reservation: Reservation) {
		selectedReservation.current = reservation;
		setIsFeedbackDialogOpen(true);
	}

	async function handleEditReservation(reservation: Reservation) {
		selectedReservation.current = reservation;
		const _reservationOptions = await getReservationOptions(reservation.id);
		console.log(_reservationOptions);
		setReservationOptions(_reservationOptions);
		setIsEditDialogOpen(true);
	}

	function handleDeleteReservation(reservation: Reservation) {
		selectedReservation.current = reservation;
		setIsDeleteDialogOpen(true);
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

	function handleCloseFeedbackDialog() {
		setIsFeedbackDialogOpen(false);
	}

	function handleCloseEditDialog() {
		setIsEditDialogOpen(false);
	}

	function handleCloseDeleteDialog() {
		setIsDeleteDialogOpen(false);
	}

	async function handleSendFeedback(score: number, message: string) {
		if (!user.isLoggedIn) {
			return;
		}
		const params: FeedbackParams = {
			reservationId: selectedReservation.current!.id,
			feedbackScore: score,
			feedbackMessage: message || null,
			userId: user.id,
		};
		console.log(params);
		const result = await sendFeedback(params);
		if (!result) {
			console.error('error!');
			setSnackbarMessage('Impossibile inviare il feedback');
		} else {
			setSnackbarMessage('Feedback inviato');
			selectedReservation.current = null;
			setIsFeedbackDialogOpen(false);
			deboucedLoadReservations();
		}
	}

	async function _deleteReservation(reservation: Reservation) {
		const result = await deleteReservation(reservation);
		if (!result) {
			setSnackbarMessage('Impossibile eliminare la prenotazione');
		} else {
			setSnackbarMessage('Prenotazione eliminata');
			selectedReservation.current = null;
			setIsDeleteDialogOpen(false);
			deboucedLoadReservations();
		}
	}

	async function _editReservation(time: string, partecipants: number, option: ReservationOption, reservation: Reservation) {
		if (!user.isLoggedIn) {
			return;
		}
		const params: EditReservationParams = {
			activityId: 0,
			partecipants: partecipants,
			reservationId: reservation.id,
			time: time,
			userId: user.id,
		};
		const result = await editReservation(params);
		if (!result) {
			setSnackbarMessage('Impossibile modificare la prenotazione');
		} else {
			setSnackbarMessage('Prenotazione modificata');
			selectedReservation.current = null;
			setIsEditDialogOpen(false);
			deboucedLoadReservations();
		}
	}

	async function deboucedLoadReservations() {
		if (timeoutRef.current !== null) {
			clearTimeout(timeoutRef.current);
			console.log('Cancelling timeout...');
		}
		timeoutRef.current = setTimeout(() => _loadReservations(), 250);
	}

	async function _loadLocations() {
		const _locations = await loadLocations();
		setLocations(_locations);
	}

	async function _loadSports() {
		const _sports = await loadSports();
		setSports(_sports);
	}

	const reservationsToRender = loading ? [null, null, null, null] : reservations;
	return (
		<>
			<Box sx={{ padding: 2, }}>
				<Typography sx={{ fontSize: 26, fontWeight: 'bold', paddingBottom: 2 }}>Prenotazioni</Typography>
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
					reservationsToRender.length ?
						<Box sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', rowGap: 2, columnGap: 2 }}>
							{reservationsToRender.map((reservation, index) =>
								<ReservationCard key={reservation?.id || index} reservation={reservation} handleClickFeedback={handleClickFeedback} handleDeleteReservation={handleDeleteReservation} handleEditReservation={handleEditReservation} />
							)}
						</Box>
						:
						<Typography variant='h6' align='center' marginTop={4} marginBottom={4}>Nessuna prenotazione</Typography>
				}
			</Box>
			{isFeedbackDialogOpen ? <FeedbackDialog isOpen={isFeedbackDialogOpen} reservation={selectedReservation.current!} handleClose={handleCloseFeedbackDialog} handleSendFeedback={handleSendFeedback}></FeedbackDialog> : null}
			{isDeleteDialogOpen ? <DeleteReservationDialog isOpen={isDeleteDialogOpen} reservation={selectedReservation.current!} handleClose={handleCloseDeleteDialog} handleDeleteReservation={_deleteReservation}></DeleteReservationDialog> : null}
			{isEditDialogOpen ? <EditReservationDialog isOpen={isEditDialogOpen} reservation={selectedReservation.current!} reservationOptions={reservationOptions} handleClose={handleCloseEditDialog} handleEditReservation={_editReservation}></EditReservationDialog> : null}
			<Snackbar
				open={!!snackbarMessage}
				autoHideDuration={6000}
				onClose={() => setSnackbarMessage('')}
				message={snackbarMessage}
			/>
		</>
	);
}