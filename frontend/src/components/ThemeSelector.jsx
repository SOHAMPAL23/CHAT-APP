import {
    Dialog,
    DialogTitle,
    DialogContent,
    Box,
    Typography,
    ToggleButtonGroup,
    ToggleButton,
    Card,
    CardActionArea,
    Grid,
    Switch,
    FormControlLabel,
    Divider,
} from '@mui/material';
import {
    Brightness4 as DarkIcon,
    Brightness7 as LightIcon,
} from '@mui/icons-material';
import { useThemeStore } from '../store/themeStore';
import { colorPalettes } from '../theme/theme';

export default function ThemeSelector({ open, onClose }) {
    const { mode, themeName, setMode, setThemeName, toggleMode } = useThemeStore();

    const themeOptions = [
        { name: 'discord', label: 'Discord', color: '#5865F2' },
        { name: 'ocean', label: 'Ocean', color: '#00D9FF' },
        { name: 'sunset', label: 'Sunset', color: '#FF6B6B' },
        { name: 'forest', label: 'Forest', color: '#4CAF50' },
        { name: 'midnight', label: 'Midnight', color: '#BB86FC' },
    ];

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Appearance Settings</DialogTitle>
            <DialogContent>
                {/* Dark/Light Mode Toggle */}
                <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                        Theme Mode
                    </Typography>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={mode === 'dark'}
                                onChange={toggleMode}
                                icon={<LightIcon />}
                                checkedIcon={<DarkIcon />}
                            />
                        }
                        label={mode === 'dark' ? 'Dark Mode' : 'Light Mode'}
                    />
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* Theme Selection (only for dark mode) */}
                {mode === 'dark' && (
                    <Box>
                        <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                            Color Theme
                        </Typography>
                        <Grid container spacing={2} sx={{ mt: 1 }}>
                            {themeOptions.map((theme) => (
                                <Grid item xs={6} key={theme.name}>
                                    <Card
                                        variant="outlined"
                                        sx={{
                                            borderWidth: themeName === theme.name ? 2 : 1,
                                            borderColor: themeName === theme.name ? 'primary.main' : 'divider',
                                        }}
                                    >
                                        <CardActionArea onClick={() => setThemeName(theme.name)}>
                                            <Box sx={{ p: 2 }}>
                                                <Box
                                                    sx={{
                                                        width: '100%',
                                                        height: 60,
                                                        borderRadius: 1,
                                                        bgcolor: theme.color,
                                                        mb: 1,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        color: 'white',
                                                        fontWeight: 600,
                                                    }}
                                                >
                                                    {theme.label}
                                                </Box>
                                                <Typography variant="caption" color="text.secondary" align="center" display="block">
                                                    {themeName === theme.name ? '✓ Active' : 'Click to apply'}
                                                </Typography>
                                            </Box>
                                        </CardActionArea>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    </Box>
                )}

                {/* Preview */}
                <Box sx={{ mt: 3, p: 2, bgcolor: 'background.elevated', borderRadius: 1 }}>
                    <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                        Preview
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                        <Box sx={{ width: 40, height: 40, borderRadius: 1, bgcolor: 'primary.main' }} />
                        <Box sx={{ width: 40, height: 40, borderRadius: 1, bgcolor: 'secondary.main' }} />
                        <Box sx={{ width: 40, height: 40, borderRadius: 1, bgcolor: 'success.main' }} />
                        <Box sx={{ width: 40, height: 40, borderRadius: 1, bgcolor: 'warning.main' }} />
                        <Box sx={{ width: 40, height: 40, borderRadius: 1, bgcolor: 'error.main' }} />
                    </Box>
                </Box>
            </DialogContent>
        </Dialog>
    );
}
