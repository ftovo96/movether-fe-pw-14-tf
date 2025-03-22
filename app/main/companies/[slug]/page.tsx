'use client'

import * as React from 'react';
import Box from '@mui/material/Box';
import { Card, CardContent, IconButton, Rating, Tooltip, Typography } from '@mui/material';
import { useEffect } from 'react';
import { Activity } from '@/app/models/activity';
import { LoginProvider } from '@/app/providers/userProvider';
import { Feedback } from '@/app/models/feedback';
import { AccountCircleOutlined, ArrowBack } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { loadActivities, reserveActivity, ReserveActivityParams } from '../../activities/actions';
import { getCompany, loadFeedbacks } from './actions';
import { ActivityCard, ActivityDialog } from '../../activities/page';
import { useParams } from 'next/navigation'
import { Company } from '@/app/models/company';

interface FeedbackCardProps {
  feedback: Feedback,
}

function FeedbackCard(props: FeedbackCardProps) {
  const userName = props.feedback.userName || 'Anonimo';
  const date = new Date(props.feedback.timestamp).toLocaleDateString();
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
          <Rating name="read-only" value={props.feedback.score} readOnly />
          <Typography gutterBottom sx={{ fontSize: 20, fontWeight: 'bold' }}>{props.feedback.message}</Typography>
          <Box sx={{ paddingBottom: 1 }} />
        </Box>
        <Typography sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'start', alignItems: 'center', gap: 1, paddingBottom: 1 }}>
          <AccountCircleOutlined />
          {userName} - {date}
        </Typography>
      </CardContent>
    </Card>
  );
}

export default function ActivitiesPage() {
  const [loading, setLoading] = React.useState(false);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [activities, setActivities] = React.useState<Activity[]>([]);
  const [feedbacks, setFeedbacks] = React.useState<Feedback[]>([]);
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const selectedActivity = React.useRef<Activity | null>(null);
  const router = useRouter();
  const params = useParams<{ slug: string; }>();
  const [company, setCompany] = React.useState<Company | null>(null);
 
  // useEffect(() => {
  //   _loadFeedbacks();
  //   _loadActivities();
  // }, []);
  useEffect(() => {
    _loadCompany();
  }, [params]);

  async function _loadActivities() {
    setLoading(true);
    const queryParams: Map<string, string | null> = new Map<string, string | null>();
    const user = LoginProvider.getUser();
    if (user.isLoggedIn) {
      queryParams.set('userId', `${user.id}`);
    }
    queryParams.set('companyId', `${params.slug}`);
    const _activities = await loadActivities(queryParams);
    setActivities(_activities);
    console.log(activities);
    timeoutRef.current = null;
    setLoading(false);
  }

  async function _loadCompany() {
    const _company = await getCompany(params.slug);
    setCompany(_company);
    _loadActivities();
    _loadFeedbacks();
  }

  async function _loadFeedbacks() {
    const _feedbacks = await loadFeedbacks(`${params.slug}`);
    setFeedbacks(_feedbacks);
  }

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
      _loadActivities();
    }
  }

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
          <Typography sx={{ fontSize: 26, fontWeight: 'bold' }}>{company?.name || ''}</Typography>
        </Box>
        <Typography sx={{ fontSize: 20, fontWeight: 'bold', paddingBottom: 2 }}>Gli ultimi feedback</Typography>
        <Box sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', rowGap: 2, columnGap: 2 }}>
          {feedbacks.map(feedback =>
            <FeedbackCard key={feedback.id} feedback={feedback} />
          )}
        </Box>
        <Typography sx={{ fontSize: 20, fontWeight: 'bold', paddingTop: 6, paddingBottom: 2 }}>Attività</Typography>
        <Box sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', rowGap: 2, columnGap: 2 }}>
          {activities.map(activity =>
            <ActivityCard key={activity.id} activity={activity} handleClickActivity={handleClickActivity} isLoggedIn={LoginProvider.isLoggedIn()} showCompanyLink={false} />
          )}
        </Box>
      </Box>
      {isDialogOpen ? <ActivityDialog isOpen={isDialogOpen} activity={selectedActivity.current!} handleClose={handleCloseDialog} handleReserveActivity={() => handleReserveActivity()}></ActivityDialog> : null}
    </>
  );
}