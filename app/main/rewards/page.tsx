'use client'

import * as React from 'react';
import Box from '@mui/material/Box';
import { Alert, Button, Card, CardActions, CardContent, Dialog, DialogActions, DialogContent, DialogTitle, Skeleton, Typography } from '@mui/material';
import { loadRedeemedRewards, loadRewards, loadUserPoints, redeemReward } from './actions';
import { UserContext } from '@/app/providers/userProvider';
import { RedeemedReward, Reward } from '@/app/models/reward';
import Link from 'next/link';
import { SectionHeader } from '@/app/widgets/section-header';

interface RewardCardProps {
  reward: Reward | null,
  points: number,
  isLoggedIn: boolean,
  onClickRedeemReward: (reward: Reward) => void
}

/**
 * @description Componente che mostra i dati di un premio disponibile
 */
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
          {props.reward?.description || <Skeleton />}
        </Typography>
        {props.points === 0 && props.isLoggedIn && props.reward ?
          <>
            <Box sx={{ paddingBottom: 1 }} />
            <Typography>Non hai abbastanza punti</Typography>
          </> : null
        }
      </CardContent>
      {
        props.isLoggedIn ?
          <CardActions sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'end', alignItems: 'center' }}>
            {props.reward ?
              <Button variant='outlined' onClick={() => props.onClickRedeemReward(props.reward!)}>Riscatta</Button>
              :
              <Skeleton key={0} width={80} />
            }
          </CardActions> : null
      }
    </Card>
  );
}

interface RedeemedRewardCardProps {
  redeemedReward: RedeemedReward | null,
}

/**
 * @description Componente che mostra i dati di un premio riscattato
 */
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
          {props.redeemedReward?.description || <Skeleton />}
        </Typography>
        <Box sx={{ paddingBottom: 1 }} />
        <Typography>{props.redeemedReward?.code || <Skeleton />}</Typography>
      </CardContent>
    </Card>
  );
}

interface DeleteDialogProps {
  isOpen: boolean,
  handleClose: () => void,
  handleRedeemReward: () => void,
}

/**
 * @description Componente che gestisce la Dialog (finestra) per riscattare
 * un premio
 */
function RedeemRewardDialog(props: DeleteDialogProps) {
  return (
    <Dialog
      open={props.isOpen}
      onClose={props.handleClose}
    >
      <DialogTitle>
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
  const [isLoadingRewards, setIsLoadingRewards] = React.useState<boolean>(true);
  const [isLoadingRedeemedRewards, setIsLoadingRedeemedRewards] = React.useState<boolean>(true);
  const [isDialogOpen, setIsDialogOpen] = React.useState<boolean>(false);
  const selectedReward = React.useRef<Reward | null>(null);
  const user = React.useContext(UserContext);

  React.useEffect(() => { loadData() }, [user.isLoggedIn]);

  async function loadData() {
    setIsLoadingRewards(true);
    if (user.isLoggedIn) {
      setIsLoadingRedeemedRewards(true);
      const _rewards = await loadRewards(user.id);
      const _redeemedRewards = await loadRedeemedRewards(user.id);
      const _points = await loadUserPoints(user.id);
      setIsLoadingRewards(false);
      setIsLoadingRedeemedRewards(false);
      setRewards(_rewards);
      setRedeemedRewards(_redeemedRewards);
      setPoints(_points);
    } else {
      const _rewards = await loadRewards(0);
      setIsLoadingRewards(false);
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
    if (user.isLoggedIn) {
      await redeemReward(selectedReward.current!.id, user.id);
      setIsDialogOpen(false);
      loadData();
      selectedReward.current = null;
    }
  }

  let alertMessage;
  if (user.isLoggedIn) {
    alertMessage = `Riscatta i premi che vuoi. Ogni premio costa 1 punto (hai ${points} punti).`;
  } else {
    alertMessage = <Typography>Per riscattare i premi devi <Link style={{ textDecoration: 'underline' }} href={'/login'}>effettuare il login</Link>!</Typography>
  }
  const banner = <Alert severity="info">{alertMessage}</Alert>;

  const rewardsToRender = isLoadingRewards ? [null, null, null] : rewards;
  const redeemedRewardsToRender = isLoadingRedeemedRewards ? [null, null, null] : redeemedRewards;
  return (
    <>
      <Box sx={{ padding: 2, }}>
        <SectionHeader
          title='Premi'
          showBackButton={false}
          showSearchField={false}
          showFilters={false}
          showBanner={true}
          banner={banner}
        />
        <Box sx={{ padding: 1 }} />
        <Box sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', rowGap: 2, columnGap: 2 }}>
          {rewardsToRender.map((reward, index) =>
            <RewardCard key={reward?.id || index} reward={reward} points={points} isLoggedIn={user.isLoggedIn} onClickRedeemReward={handleOpenRedeemRewardDialog} />
          )}
        </Box>
        <Box sx={{ padding: 2 }} />
        {user.isLoggedIn ?
          <>
            <Typography sx={{ fontSize: 20, fontWeight: 'bold', paddingBottom: 2 }}>Premi riscattati</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', rowGap: 2, columnGap: 2 }}>
              {
                redeemedRewardsToRender.length ? redeemedRewardsToRender.map((redeemReward, index) =>
                  <RedeemedRewardCard key={redeemReward?.code || index} redeemedReward={redeemReward} />
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