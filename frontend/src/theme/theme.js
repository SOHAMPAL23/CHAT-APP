import { createTheme } from '@mui/material/styles';

// Custom color palettes for different themes
export const colorPalettes = {
    discord: {
        primary: {
            main: '#5865F2',
            light: '#7289DA',
            dark: '#4752C4',
            contrastText: '#FFFFFF',
        },
        secondary: {
            main: '#EB459E',
            light: '#ED4245',
            dark: '#C13584',
        },
        background: {
            default: '#36393F',
            paper: '#2F3136',
            elevated: '#202225',
            hover: '#3C3F45',
        },
        text: {
            primary: '#DCDDDE',
            secondary: '#B9BBBE',
            disabled: '#72767D',
            muted: '#8E9297',
        },
        divider: '#202225',
        success: '#43B581',
        warning: '#FAA61A',
        error: '#ED4245',
        info: '#00AFF4',
    },
    ocean: {
        primary: {
            main: '#00D9FF',
            light: '#33E1FF',
            dark: '#00A8CC',
            contrastText: '#FFFFFF',
        },
        secondary: {
            main: '#7B2CBF',
            light: '#9D4EDD',
            dark: '#5A189A',
        },
        background: {
            default: '#0A1929',
            paper: '#132F4C',
            elevated: '#001E3C',
            hover: '#1A3A52',
        },
        text: {
            primary: '#E7EBF0',
            secondary: '#B2BAC2',
            disabled: '#6F7E8C',
            muted: '#8796A5',
        },
        divider: '#1E4976',
        success: '#00E676',
        warning: '#FFB300',
        error: '#FF1744',
        info: '#00B0FF',
    },
    sunset: {
        primary: {
            main: '#FF6B6B',
            light: '#FF8E8E',
            dark: '#CC5555',
            contrastText: '#FFFFFF',
        },
        secondary: {
            main: '#FFD93D',
            light: '#FFE066',
            dark: '#CCAE31',
        },
        background: {
            default: '#2D1B2E',
            paper: '#3E2C41',
            elevated: '#1F1320',
            hover: '#4A3A4D',
        },
        text: {
            primary: '#F8E9D2',
            secondary: '#D4C5AA',
            disabled: '#9B8D7A',
            muted: '#B5A68F',
        },
        divider: '#4A2C4D',
        success: '#6BCF7F',
        warning: '#FFB84D',
        error: '#FF5252',
        info: '#4FC3F7',
    },
    forest: {
        primary: {
            main: '#4CAF50',
            light: '#6FBF73',
            dark: '#3D8B40',
            contrastText: '#FFFFFF',
        },
        secondary: {
            main: '#8BC34A',
            light: '#A2CF6E',
            dark: '#6F9C3B',
        },
        background: {
            default: '#1B2A1F',
            paper: '#263B2E',
            elevated: '#121A15',
            hover: '#2F4A38',
        },
        text: {
            primary: '#E8F5E9',
            secondary: '#C8E6C9',
            disabled: '#81C784',
            muted: '#A5D6A7',
        },
        divider: '#2E5339',
        success: '#66BB6A',
        warning: '#FFA726',
        error: '#EF5350',
        info: '#29B6F6',
    },
    midnight: {
        primary: {
            main: '#BB86FC',
            light: '#C89FFF',
            dark: '#9666CA',
            contrastText: '#000000',
        },
        secondary: {
            main: '#03DAC6',
            light: '#35E1D5',
            dark: '#02AE9E',
        },
        background: {
            default: '#121212',
            paper: '#1E1E1E',
            elevated: '#0A0A0A',
            hover: '#2A2A2A',
        },
        text: {
            primary: '#FFFFFF',
            secondary: '#B3B3B3',
            disabled: '#666666',
            muted: '#999999',
        },
        divider: '#2C2C2C',
        success: '#00C853',
        warning: '#FFD600',
        error: '#CF6679',
        info: '#2196F3',
    },
};

// Light mode palettes
export const lightPalettes = {
    default: {
        primary: {
            main: '#5865F2',
            light: '#7289DA',
            dark: '#4752C4',
            contrastText: '#FFFFFF',
        },
        secondary: {
            main: '#EB459E',
            light: '#F06FA3',
            dark: '#C13584',
        },
        background: {
            default: '#FFFFFF',
            paper: '#F6F6F6',
            elevated: '#FAFAFA',
            hover: '#EEEEEE',
        },
        text: {
            primary: '#2E3338',
            secondary: '#4F5660',
            disabled: '#A0A4A8',
            muted: '#72767D',
        },
        divider: '#E3E5E8',
        success: '#43B581',
        warning: '#FAA61A',
        error: '#ED4245',
        info: '#00AFF4',
    },
};

// Create theme based on mode and palette
export const createAppTheme = (mode = 'dark', themeName = 'discord') => {
    const palette = mode === 'dark' ? colorPalettes[themeName] : lightPalettes.default;

    return createTheme({
        palette: {
            mode,
            ...palette,
        },
        typography: {
            fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
            h1: {
                fontSize: '2.5rem',
                fontWeight: 700,
                letterSpacing: '-0.02em',
            },
            h2: {
                fontSize: '2rem',
                fontWeight: 700,
                letterSpacing: '-0.01em',
            },
            h3: {
                fontSize: '1.75rem',
                fontWeight: 600,
            },
            h4: {
                fontSize: '1.5rem',
                fontWeight: 600,
            },
            h5: {
                fontSize: '1.25rem',
                fontWeight: 600,
            },
            h6: {
                fontSize: '1rem',
                fontWeight: 600,
            },
            body1: {
                fontSize: '1rem',
                lineHeight: 1.5,
            },
            body2: {
                fontSize: '0.875rem',
                lineHeight: 1.43,
            },
            button: {
                textTransform: 'none',
                fontWeight: 500,
            },
        },
        shape: {
            borderRadius: 8,
        },
        shadows: [
            'none',
            '0px 2px 4px rgba(0, 0, 0, 0.1)',
            '0px 4px 8px rgba(0, 0, 0, 0.12)',
            '0px 6px 12px rgba(0, 0, 0, 0.14)',
            '0px 8px 16px rgba(0, 0, 0, 0.16)',
            '0px 10px 20px rgba(0, 0, 0, 0.18)',
            '0px 12px 24px rgba(0, 0, 0, 0.2)',
            '0px 14px 28px rgba(0, 0, 0, 0.22)',
            '0px 16px 32px rgba(0, 0, 0, 0.24)',
            '0px 18px 36px rgba(0, 0, 0, 0.26)',
            '0px 20px 40px rgba(0, 0, 0, 0.28)',
            '0px 22px 44px rgba(0, 0, 0, 0.3)',
            '0px 24px 48px rgba(0, 0, 0, 0.32)',
            '0px 26px 52px rgba(0, 0, 0, 0.34)',
            '0px 28px 56px rgba(0, 0, 0, 0.36)',
            '0px 30px 60px rgba(0, 0, 0, 0.38)',
            '0px 32px 64px rgba(0, 0, 0, 0.4)',
            '0px 34px 68px rgba(0, 0, 0, 0.42)',
            '0px 36px 72px rgba(0, 0, 0, 0.44)',
            '0px 38px 76px rgba(0, 0, 0, 0.46)',
            '0px 40px 80px rgba(0, 0, 0, 0.48)',
            '0px 42px 84px rgba(0, 0, 0, 0.5)',
            '0px 44px 88px rgba(0, 0, 0, 0.52)',
            '0px 46px 92px rgba(0, 0, 0, 0.54)',
            '0px 48px 96px rgba(0, 0, 0, 0.56)',
        ],
        components: {
            MuiButton: {
                styleOverrides: {
                    root: {
                        borderRadius: 8,
                        padding: '8px 16px',
                        fontWeight: 500,
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15)',
                        },
                    },
                    contained: {
                        boxShadow: 'none',
                        '&:hover': {
                            boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15)',
                        },
                    },
                },
            },
            MuiCard: {
                styleOverrides: {
                    root: {
                        borderRadius: 12,
                        boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.08)',
                        transition: 'all 0.3s ease-in-out',
                        '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.12)',
                        },
                    },
                },
            },
            MuiPaper: {
                styleOverrides: {
                    root: {
                        backgroundImage: 'none',
                    },
                    elevation1: {
                        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
                    },
                },
            },
            MuiTextField: {
                styleOverrides: {
                    root: {
                        '& .MuiOutlinedInput-root': {
                            borderRadius: 8,
                            transition: 'all 0.2s ease-in-out',
                            '&:hover': {
                                transform: 'translateY(-1px)',
                            },
                            '&.Mui-focused': {
                                transform: 'translateY(-1px)',
                            },
                        },
                    },
                },
            },
            MuiChip: {
                styleOverrides: {
                    root: {
                        borderRadius: 6,
                        fontWeight: 500,
                    },
                },
            },
            MuiAvatar: {
                styleOverrides: {
                    root: {
                        fontWeight: 600,
                    },
                },
            },
            MuiTooltip: {
                styleOverrides: {
                    tooltip: {
                        borderRadius: 6,
                        fontSize: '0.75rem',
                        padding: '6px 12px',
                    },
                },
            },
        },
    });
};

// Available theme names
export const themeNames = Object.keys(colorPalettes);

// Default theme
export const defaultTheme = createAppTheme('dark', 'discord');
