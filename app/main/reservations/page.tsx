'use client'

import * as React from 'react';
import Box from '@mui/material/Box';
import { Alert, Button, Card, CardActions, CardContent, Chip, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, InputLabel, MenuItem, Rating, Select, Skeleton, Snackbar, TextField, Typography } from '@mui/material';
import { CalendarMonthOutlined, GroupsOutlined, PlaceOutlined } from '@mui/icons-material';
import { addAnonymousReservation, deleteReservation, editReservation, EditReservationParams, FeedbackParams, getReservation, getReservationOptions, loadReservations, sendFeedback } from './actions';
import { useEffect } from 'react';
import Link from 'next/link';
import { UserContext } from '@/app/providers/userProvider';
import { loadLocations, loadSports } from '../filters';
import { Reservation, ReservationOption } from '@/app/models/reservation';
import { ReservationsProvider } from '@/app/providers/reservationsProvider';
import { SectionHeader } from '@/app/widgets/section-header';

interface FeedbackDialogProps {
	reservation: Reservation,
	isOpen: boolean,
	handleClose: () => void,
	handleSendFeedback: (score: number, message: string) => void,
}

/**
 * @description Componente che gestisce la Dialog (finestra) per lasciare il
 * feedback di una attività svolta.
 */
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
		>
			<DialogTitle>
				{"Lascia feedback"}
			</DialogTitle>
			<DialogContent
				sx={{ minWidth: 320 }}>
				<Typography>Come valuteresti la tua esperienza?</Typography>
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

/**
 * @description Schermata per eliminare una prenotazione
 */
function DeleteReservationDialog(props: DeleteDialogProps) {
	return (
		<Dialog
			open={props.isOpen}
			onClose={props.handleClose}
		>
			<DialogTitle>
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


/**
 * @description Componente che gestisce la Dialog per modificare una prenotazione
 */
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
		>
			<DialogTitle>
				{"Modifica prenotazione"}
			</DialogTitle>
			<DialogContent
				sx={{ minWidth: 420 }}>
				<FormControl variant="filled" fullWidth>
					<InputLabel>Orario</InputLabel>
					<Select
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
					<InputLabel>Posti</InputLabel>
					<Select
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

interface AddAnonymousReservationDialogProps {
	isOpen: boolean,
	isLoggedIn: boolean,
	userId: number | null,
	handleClose: () => void,
	handleAddReservation: () => void,
}


/**
 * @description Componente che gestisce la Dialog (finestra) per aggiungere una
 * prenotazione anonima
 */
function AddAnonymousReservationDialog(props: AddAnonymousReservationDialogProps) {
	const [reservationId, setReservationId] = React.useState<string>('');
	const [reservationIdError, setReservationIdError] = React.useState<string>('');
	const [securityCode, setSecurityCode] = React.useState<string>('');
	const [securityCodeError, setSecurityCodeError] = React.useState<string>('');
	const [formSubmitted, setFormSubmitted] = React.useState<boolean>(false);
	const [reservationNotFound, setReservationNotFound] = React.useState<boolean>(false);

	function _canSubmitForm(): boolean {
		if (!formSubmitted) {
			return true;
		}
		return !reservationIdError && !securityCodeError;
	}

	async function _handleAddReservation() {
		setFormSubmitted(true);
		setReservationNotFound(false);
		const isValidReservationId = _handleChangeReservationId(reservationId);
		const isValidSecurityCode = _handleChangeSecurityCode(securityCode);
		if (isValidReservationId && isValidSecurityCode) {
			const reservation = await addAnonymousReservation(+reservationId, securityCode);
			if (reservation) {
				ReservationsProvider.saveReservation(reservation);
				// Se l'utente ha effettuato l'accesso collego subito
				// la prenotazione anonima al suo account.
				if (props.isLoggedIn) {
					ReservationsProvider.linkReservations(props.userId!);
				}
				props.handleAddReservation();
			} else {
				setReservationNotFound(true);
			}
		}
	}

	function _handleChangeReservationId(value: string): boolean {
		const _reservationId = value.trim();
		let _reservationIdError = '';
		if (!_reservationId.length) {
			_reservationIdError = 'Campo obbligatorio';
		}
		setReservationId(_reservationId);
		setReservationIdError(_reservationIdError);
		return !_reservationIdError;
	}

	function _handleChangeSecurityCode(value: string): boolean {
		const _securityCode = value.trim();
		let _securityCodeError = '';
		if (!_securityCode.length) {
			_securityCodeError = 'Campo obbligatorio';
		}
		setSecurityCode(_securityCode);
		setSecurityCodeError(_securityCodeError);
		return !_securityCodeError;
	}

	return (
		<Dialog
			open={props.isOpen}
			onClose={props.handleClose}
		>
			<DialogTitle>
				{"Aggiungi prenotazione tramite codice"}
			</DialogTitle>
			<DialogContent
				sx={{ minWidth: 420 }}>
				<Box sx={{ padding: 1 }}></Box>
				{
					reservationNotFound ?
						<>
							<Alert severity="error">
								<Typography>Prenotazione non trovata. Verificare che il numero di prenotazione e il codice di sicurezza siano corretti.</Typography>
							</Alert>
							<Box sx={{ padding: 2 }}></Box>
						</> : null
				}
				<TextField
					fullWidth
					label='Numero prenotazione'
					variant='outlined'
					id="reservationId"
					type="number"
					value={reservationId}
					onChange={(event) => _handleChangeReservationId(event.target.value)}
					error={!!reservationIdError}
					helperText={reservationIdError}
				/>
				<Box sx={{ padding: 1 }}></Box>
				<TextField
					fullWidth
					label='Codice di sicurezza'
					variant='outlined'
					id="securityCode"
					type="email"
					value={securityCode}
					onChange={(event) => _handleChangeSecurityCode(event.target.value)}
					error={!!securityCodeError}
					helperText={securityCodeError}
				/>
			</DialogContent>
			<DialogActions>
				<Button onClick={props.handleClose}>Annulla</Button>
				<Button variant='outlined' disabled={!_canSubmitForm()} onClick={() => _handleAddReservation()}>
					Aggiungi prenotazione
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

/**
 * @description Componente che mostra i dati di una prenotazione
 */
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
		reservationTitle = <>{props.reservation.sport} - <Link style={{ textDecoration: 'underline' }} href={`/main/companies/${props.reservation.companyId}`}>{props.reservation.companyName}</Link></>;
		const reservationDate = new Date(`${props.reservation.date.toDateString()} ${props.reservation.time}`);
		const hasExpired = Date.now() > reservationDate.getTime();
		const isExpiring = (reservationDate.getTime() - Date.now()) < (24 * 60 * 60 * 1000);
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
	const [isAnonymousReservationDialogOpen, setIsAnonymousReservationDialogOpen] = React.useState(false);
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
		if (user.isLoggedIn) {
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
			setLoading(false);
		} else {
			const _reservations = ReservationsProvider.getReservations();
			setReservations(_reservations);
		}
		timeoutRef.current = null;
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

	async function handleAddAnonymousReservation() {
		setSnackbarMessage('Prenotazione aggiunta');
		setIsAnonymousReservationDialogOpen(false);
		deboucedLoadReservations();
	}

	async function _deleteReservation(reservation: Reservation) {
		const result = await deleteReservation(reservation);
		if (!result) {
			setSnackbarMessage('Impossibile eliminare la prenotazione');
		} else {
			if (!user.isLoggedIn) {
				ReservationsProvider.removeReservation(reservation.id);
			}
			setSnackbarMessage('Prenotazione eliminata');
			selectedReservation.current = null;
			setIsDeleteDialogOpen(false);
			deboucedLoadReservations();
		}
	}

	async function _editReservation(time: string, partecipants: number, option: ReservationOption, reservation: Reservation) {
		const params: EditReservationParams = {
			activityId: 0,
			partecipants: partecipants,
			reservationId: reservation.id,
			time: time,
			userId: null,
		};
		if (user.isLoggedIn) {
			params.userId = user.id;
		}
		const result = await editReservation(params);
		if (!result) {
			setSnackbarMessage('Impossibile modificare la prenotazione');
		} else {
			if (!user.isLoggedIn) {
				const updatedReservation = await getReservation(reservation.id);
				if (updatedReservation) {
					ReservationsProvider.removeReservation(reservation.id);
					ReservationsProvider.saveReservation(updatedReservation);
				}
			}
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

	let banner;
	if (user.isLoggedIn) {
		banner = <>
			<Alert severity="info">
				<Typography>
					Hai effettuato prenotazioni senza essere loggato?&nbsp;
					<span style={{ textDecoration: 'underline', cursor: 'pointer' }} onClick={() => setIsAnonymousReservationDialogOpen(true)}>Aggiungile tramite codice!</span>
				</Typography>
			</Alert>
			<Box sx={{ padding: 1, }} />
		</>
	} else {
		banner = <>
			<Alert severity="info">
				<Typography>
					Per gestire le tue prenotazioni&nbsp;
					<Link style={{ textDecoration: 'underline' }} href={'/login'}>effettua il login</Link>
					&nbsp;oppure&nbsp;
					<span style={{ textDecoration: 'underline', cursor: 'pointer' }} onClick={() => setIsAnonymousReservationDialogOpen(true)}>usa il codice di prenotazione</span>
				</Typography>
			</Alert>
			<Box sx={{ padding: 1, }} />
		</>
	}

	const reservationsToRender = loading ? [null, null, null, null] : reservations;
	return (
		<>
			<Box sx={{ padding: 2, }}>
				<SectionHeader
					title='Prenotazioni'
					showBackButton={false}
					showSearchField={user.isLoggedIn}
					showFilters={user.isLoggedIn}
					showBanner={true}
					search={search}
					sport={sport}
					location={location}
					sports={sports}
					locations={locations}
					banner={banner}
					onChangeSearch={handleChangeSearch}
					onChangeSport={handleChangeSport}
					onChangeLocation={handleChangeLocation}
				/>
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
			{isFeedbackDialogOpen ? <FeedbackDialog isOpen={isFeedbackDialogOpen} reservation={selectedReservation.current!} handleClose={handleCloseFeedbackDialog} handleSendFeedback={handleSendFeedback} /> : null}
			{isDeleteDialogOpen ? <DeleteReservationDialog isOpen={isDeleteDialogOpen} reservation={selectedReservation.current!} handleClose={handleCloseDeleteDialog} handleDeleteReservation={_deleteReservation} /> : null}
			{isEditDialogOpen ? <EditReservationDialog isOpen={isEditDialogOpen} reservation={selectedReservation.current!} reservationOptions={reservationOptions} handleClose={handleCloseEditDialog} handleEditReservation={_editReservation} /> : null}
			{isAnonymousReservationDialogOpen ? <AddAnonymousReservationDialog isOpen={true} isLoggedIn={user.isLoggedIn} userId={user.isLoggedIn? user.id : null} handleClose={() => setIsAnonymousReservationDialogOpen(false)} handleAddReservation={handleAddAnonymousReservation} /> : null}
			<Snackbar
				open={!!snackbarMessage}
				autoHideDuration={6000}
				onClose={() => setSnackbarMessage('')}
				message={snackbarMessage}
			/>
		</>
	);
}