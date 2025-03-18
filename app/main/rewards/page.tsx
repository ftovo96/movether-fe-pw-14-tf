'use client'

import * as React from 'react';
import Box from '@mui/material/Box';
import { Alert, Button, Card, CardActions, CardContent, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';
import { loadRedeemedRewards, loadRewards, loadUserPoints, redeemReward } from './actions';
import { LoginProvider } from '@/app/providers/userProvider';
import { RedeemedReward, Reward } from '@/app/models/reward';
import Link from 'next/link';

interface RewardCardProps {
  reward: Reward,
  points: number,
  isLoggedIn: boolean,
  onClickRedeemReward: (reward: Reward) => void
}

function RewardCard(props: RewardCardProps) {
  return (
    <Card sx={{
      minWidth: 275, flexGrow: 1,
      flexShrink: 1,
      flexBasis: 0,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      opacity: props.points > 0 || !props.isLoggedIn ? null : 0.5,
      backgroundColor: props.points > 0 || !props.isLoggedIn ? null : 'lightgray'
    }}>
      <CardContent>
        <Box sx={{ paddingBottom: 1 }} />
        <Typography gutterBottom sx={{ fontSize: 20, fontWeight: 'bold' }}>
          {props.reward.description}
        </Typography>
        {props.points === 0 && props.isLoggedIn ?
          <>
            <Box sx={{ paddingBottom: 1 }} />
            <Typography>Non hai abbastanza punti</Typography>
          </> : null
        }
      </CardContent>
      {
        props.isLoggedIn ?
          <CardActions sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'end', alignItems: 'center' }}>
            <Button variant='outlined' onClick={() => props.onClickRedeemReward(props.reward)}>Riscatta</Button>
          </CardActions> : null
      }
    </Card>
  );
}

interface RedeemedRewardCardProps {
  redeemedReward: RedeemedReward,
}

function RedeemedRewardCard(props: RedeemedRewardCardProps) {
  return (
    <Card sx={{
      minWidth: 275, flexGrow: 1,
      flexShrink: 1,
      flexBasis: 0,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
    }}>
      <CardContent>
        <Box sx={{ paddingBottom: 1 }} />
        <Typography gutterBottom sx={{ fontSize: 20, fontWeight: 'bold' }}>
          {props.redeemedReward.description}
        </Typography>
        <Box sx={{ paddingBottom: 1 }} />
        <Typography>{props.redeemedReward.code}</Typography>
      </CardContent>
    </Card>
  );
}

interface DeleteDialogProps {
  isOpen: boolean,
  handleClose: () => void,
  handleRedeemReward: () => void,
}

function RedeemRewardDialog(props: DeleteDialogProps) {
  return (
    <Dialog
      open={props.isOpen}
      onClose={props.handleClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">
        {"Riscatta premio"}
      </DialogTitle>
      <DialogContent
        sx={{ minWidth: 320 }}>
        <Typography>Vuoi riscattare il premio?</Typography>
        <Typography sx={{ fontWeight: 'bold' }}>I punti non sono rimborsabili.</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={props.handleClose}>Annulla</Button>
        <Button variant='outlined' onClick={() => props.handleRedeemReward()}>
          Riscatta premio
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default function Rewards() {
  const [rewards, setRewards] = React.useState<Reward[]>([]);
  const [redeemedRewards, setRedeemedRewards] = React.useState<RedeemedReward[]>([]);
  const [points, setPoints] = React.useState<number>(0);
  const [isDialogOpen, setIsDialogOpen] = React.useState<boolean>(false);
  const selectedReward = React.useRef<Reward | null>(null);
  const isLoggedIn = LoginProvider.isLoggedIn();

  React.useEffect(() => { loadData() }, [isLoggedIn]);

  async function loadData() {
    const user = LoginProvider.getUser();
    if (user.isLoggedIn) {
      const _rewards = await loadRewards(user.id);
      const _redeemedRewards = await loadRedeemedRewards(user.id);
      const _points = await loadUserPoints(user.id);
      setRewards(_rewards);
      setRedeemedRewards(_redeemedRewards);
      setPoints(_points);
    } else {
      const _rewards = await loadRewards(0);
      setRewards(_rewards);
    }
  }

  function handleCloseDialog() {
    setIsDialogOpen(false);
  }

  function handleOpenRedeemRewardDialog(reward: Reward) {
    selectedReward.current = reward;
    setIsDialogOpen(true);
  }

  async function handleRedeemReward() {
    const user = LoginProvider.getUser();
    if (user.isLoggedIn) {
      await redeemReward(selectedReward.current!.id, user.id);
      setIsDialogOpen(false);
      loadData();
      selectedReward.current = null;
    }
  }

  let alertMessage;
  if (isLoggedIn) {
    alertMessage = `Riscatta i premi che vuoi. Ogni premio costa 1 punto (hai ${points} punti).`;
  } else {
    alertMessage = <Typography>Per riscattare i premi devi <Link style={{ textDecoration: 'underline' }} href={'/login'}>effettuare il login</Link>!</Typography>
  }

  return (
    <>
      <Box sx={{ padding: 2, }}>
        <Typography sx={{ fontSize: 26, fontWeight: 'bold', paddingBottom: 2 }}>Premi</Typography>
        <Alert severity="info">{alertMessage}</Alert>
        <Box sx={{ padding: 1 }} />
        <Box sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', rowGap: 2, columnGap: 2 }}>
          {rewards.map(reward =>
            <RewardCard key={reward.id} reward={reward} points={points} isLoggedIn={isLoggedIn} onClickRedeemReward={handleOpenRedeemRewardDialog} />
          )}
        </Box>
        <Box sx={{ padding: 2 }} />
        {isLoggedIn ?
          <>
            <Typography sx={{ fontSize: 20, fontWeight: 'bold', paddingBottom: 2 }}>Premi riscattati</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', rowGap: 2, columnGap: 2 }}>
              {
                redeemedRewards.length ? redeemedRewards.map(redeemReward =>
                  <RedeemedRewardCard key={redeemReward.code} redeemedReward={redeemReward} />
                ) : <Box sx={{ display: 'flex', flexGrow: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}><Typography sx={{ fontSize: 20 }} align='center'>Nessun premio riscattato</Typography></Box>
              }
            </Box>
          </> : null
        }
      </Box>
      {isDialogOpen ? <RedeemRewardDialog isOpen={isDialogOpen} handleClose={handleCloseDialog} handleRedeemReward={handleRedeemReward} /> : null}
    </>
  );
}