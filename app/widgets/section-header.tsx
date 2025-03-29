import SearchOutlined from "@mui/icons-material/SearchOutlined";
import Box from "@mui/material/Box/Box";
import InputAdornment from "@mui/material/InputAdornment/InputAdornment";
import MenuItem from "@mui/material/MenuItem/MenuItem";
import OutlinedInput from "@mui/material/OutlinedInput/OutlinedInput";
import TextField from "@mui/material/TextField/TextField";
import Typography from "@mui/material/Typography/Typography";

export interface SectionHeaderProps {
    title: string,
    showBackButton: boolean,
    showSearchField: boolean,
    showFilters: boolean,
    showBanner: boolean,
    search?: string,
    sports?: string[],
    sport?: string,
    locations?: string[],
    location?: string,
    banner?: React.ReactElement,
    onChangeSearch?: (search: string) => void,
    onChangeSport?: (sport: string) => void,
    onChangeLocation?: (location: string) => void,
    onClickBack?: () => void,
}

export function SectionHeader(props: SectionHeaderProps) {
    return (
        <>
            <Typography sx={{ fontSize: 26, fontWeight: 'bold', paddingBottom: 2 }}>{props.title}</Typography>
            {props.showSearchField ?
                <OutlinedInput fullWidth placeholder='Cerca...' value={props.search} onChange={(event) => props.onChangeSearch!(event.target.value)} size='small' endAdornment={
                    <InputAdornment position='end'><SearchOutlined /></InputAdornment>
                } /> : null
            }
            {
                props.showFilters ?
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
                                value={props.sport}
                                onChange={(event) => props.onChangeSport!(event.target.value)}
                                size='small'
                                slotProps={{
                                    input: {
                                        startAdornment: <InputAdornment position="start">Sport: </InputAdornment>,
                                    },
                                }}
                            >
                                {props.sports!.map((sport) => (
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
                                value={props.location}
                                onChange={(event) => props.onChangeLocation!(event.target.value)}
                                size='small'
                                slotProps={{
                                    input: {
                                        startAdornment: <InputAdornment position="start">Località: </InputAdornment>,
                                    },
                                }}
                            >
                                {props.locations!.map((location) => (
                                    <MenuItem key={location} value={location}>
                                        {location === 'ALL' ? 'Tutti' : location}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Box>
                    </Box>
                    : null}
            {
                props.showBanner ? props.banner : null
            }
        </>
    );
}