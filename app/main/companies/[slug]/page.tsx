'use client'

import * as React from 'react';
import Box from '@mui/material/Box';
import { Card, CardContent, IconButton, Rating, Skeleton, Snackbar, Tooltip, Typography } from '@mui/material';
import { useEffect } from 'react';
import { Activity } from '@/app/models/activity';
import { UserContext } from '@/app/providers/userProvider';
import { Feedback } from '@/app/models/feedback';
import { AccountCircleOutlined, ArrowBack } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { loadActivities, reserveActivity, ReserveActivityParams } from '../../activities/actions';
import { getCompany, loadFeedbacks } from './actions';
import { ActivityCard, ActivityDialog, ReservationCodesDialog } from '../../activities/page';
import { useParams } from 'next/navigation'
import { Company } from '@/app/models/company';
import { Reservation } from '@/app/models/reservation';
import { ReservationsProvider } from '@/app/providers/reservationsProvider';

interface FeedbackCardProps {
  feedback: Feedback | null,
}

function FeedbackCard(props: FeedbackCardProps) {
  let feedbackFooter;
  if (props.feedback) {
    const userName = props.feedback.userName || 'Anonimo';
    const date = new Date(props.feedback.timestamp).toLocaleDateString();
    feedbackFooter = <>{userName} - {date}</>;
  } else {
    feedbackFooter = <Skeleton width={96} />;
  }
  return (
    <Card sx={{
      minWidth: 275, flexGrow: 1,
      flexShrink: 1,
      flexBasis: 0,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
    }}>
      <CardContent sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        flexGrow: 1
      }}>
        <Box>
          {
            props.feedback ?
              <Rating name="read-only" value={props.feedback.score} readOnly /> :
              <Skeleton width={64} />
          }
          <Typography gutterBottom sx={{ fontSize: 20, fontWeight: 'bold' }}>{props.feedback?.message || <Skeleton />}</Typography>
          <Box sx={{ paddingBottom: 1 }} />
        </Box>
        <Typography sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'start', alignItems: 'center', gap: 1, paddingBottom: 1 }}>
          <AccountCircleOutlined />
          {feedbackFooter}
        </Typography>
      </CardContent>
    </Card>
  );
}

export default function ActivitiesPage() {
  const [isLoadingFeedbacks, setIsLoadingFeedbacks] = React.useState(false);
  const [isLoadingActivities, setIsLoadingActivities] = React.useState(false);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [isReservationDialogOpen, setIsReservationDialogOpen] = React.useState(false);
  const [activities, setActivities] = React.useState<Activity[]>([]);
  const [feedbacks, setFeedbacks] = React.useState<Feedback[]>([]);
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const selectedActivity = React.useRef<Activity | null>(null);
  const createdReservation = React.useRef<Reservation | null>(null);
  const router = useRouter();
  const params = useParams<{ slug: string; }>();
  const [company, setCompany] = React.useState<Company | null>(null);
  const [snackbarMessage, setSnackbarMessage] = React.useState<string>('');
  const user = React.useContext(UserContext);

  useEffect(() => {
    _loadCompany();
  }, [params, user.isLoggedIn]);

  async function _loadActivities() {
    setIsLoadingActivities(true);
    const queryParams: Map<string, string | null> = new Map<string, string | null>();
    if (user.isLoggedIn) {
      queryParams.set('userId', `${user.id}`);
    }
    queryParams.set('companyId', `${params.slug}`);
    const _activities = await loadActivities(queryParams);
    setActivities(_activities);
    console.log(activities);
    timeoutRef.current = null;
    setIsLoadingActivities(false);
  }

  async function _loadCompany() {
    const _company = await getCompany(params.slug);
    setCompany(_company);
    _loadActivities();
    _loadFeedbacks();
  }

  async function _loadFeedbacks() {
    setIsLoadingFeedbacks(true);
    const _feedbacks = await loadFeedbacks(`${params.slug}`);
    setFeedbacks(_feedbacks);
    setIsLoadingFeedbacks(false);
  }

  function handleClickActivity(activity: Activity) {
    selectedActivity.current = activity;
    setIsDialogOpen(true);
  }

  function handleCloseDialog() {
    setIsDialogOpen(false);
  }

  function handleCloseReservationCodesDialog() {
		setIsReservationDialogOpen(false);
		_loadActivities();
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
      setSnackbarMessage('Impossibile prenotare l\'attività');
    } else {
      setIsDialogOpen(false);
      if (user.isLoggedIn) {
        setSnackbarMessage('Attività prenotata');
        _loadActivities();
      } else {
        createdReservation.current = reservation;
        ReservationsProvider.saveReservation(reservation);
        setIsReservationDialogOpen(true);
      }
    }
  }

  const feedbacksToRender = isLoadingFeedbacks ? [null, null] : feedbacks;
  const activitiesToRender = isLoadingActivities ? [null, null, null, null] : activities;
  return (
    <>
      <Box sx={{ padding: 2, }}>
        <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', paddingBottom: 2 }}>
          <Box>
            <Tooltip title="Indietro">
              <IconButton onClick={() => router.back()}>
                <ArrowBack />
              </IconButton>
            </Tooltip>
          </Box>
          <Typography sx={{ fontSize: 26, fontWeight: 'bold' }}>{company?.name || <Skeleton width={120} />}</Typography>
        </Box>
        <Typography sx={{ fontSize: 20, fontWeight: 'bold', paddingBottom: 2 }}>Gli ultimi feedback</Typography>
        <Box sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', rowGap: 2, columnGap: 2 }}>
          {feedbacksToRender.map((feedback, index) =>
            <FeedbackCard key={feedback?.id || index} feedback={feedback} />
          )}
        </Box>
        <Typography sx={{ fontSize: 20, fontWeight: 'bold', paddingTop: 6, paddingBottom: 2 }}>Attività</Typography>
        <Box sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', rowGap: 2, columnGap: 2 }}>
          {activitiesToRender.map((activity, index) =>
            <ActivityCard key={activity?.id || index} activity={activity} handleClickActivity={handleClickActivity} isLoggedIn={user.isLoggedIn} showCompanyLink={false} />
          )}
        </Box>
      </Box>
      {isDialogOpen ? <ActivityDialog isOpen={isDialogOpen} activity={selectedActivity.current!} handleClose={handleCloseDialog} handleReserveActivity={() => handleReserveActivity()}></ActivityDialog> : null}
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