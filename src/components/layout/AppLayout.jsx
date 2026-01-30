import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  useMediaQuery,
  useTheme,
  Divider,
  Collapse,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  AccessTime as TrackerIcon,
  Calculate as CalculatorIcon,
  History as HistoryIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
  ExpandLess,
  ExpandMore,
  Circle,
} from '@mui/icons-material';
import { Home, Clock, BarChart3, Eye } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import ThemeToggle from '../ui/ThemeToggle';

const DRAWER_WIDTH = 280;

const dayNames = ['Pondělí', 'Úterý', 'Středa', 'Čtvrtek', 'Pátek', 'Sobota', 'Neděle'];

const menuItems = [
  { text: 'Přehled', icon: <DashboardIcon />, path: '/app' },
  {
    text: 'Tracker času',
    icon: <TrackerIcon />,
    path: '/app/tracker',
    submenu: [
      ...dayNames.map((day, index) => ({
        text: `Den ${index + 1}`,
        subtitle: day,
        path: `/app/tracker/den/${index + 1}`,
        icon: <Circle sx={{ fontSize: 8 }} />,
      })),
      {
        text: 'Zobrazit výsledky',
        subtitle: 'Přehled vašeho týdne',
        path: '/app/tracker/vysledky',
        icon: <Eye size={16} />,
      },
      {
        text: 'Spočítat hodinovku',
        subtitle: 'Na základě vašeho času',
        path: '/app/kalkulacka',
        icon: <CalculatorIcon sx={{ fontSize: 16 }} />,
      }
    ]
  },
  {
    text: 'Kalkulačka',
    icon: <CalculatorIcon />,
    path: '/app/kalkulacka',
    submenu: [
      {
        text: 'Životní náklady',
        subtitle: 'Kolik MUSÍTE vydělat?',
        path: '/app/kalkulacka#krok-1',
        icon: <Home size={16} />,
      },
      {
        text: 'Reálný čas',
        subtitle: 'Kolik hodin fakturujete?',
        path: '/app/kalkulacka#krok-2',
        icon: <Clock size={16} />,
      },
      {
        text: 'Tržní hodnota',
        subtitle: 'Kolik DOOPRAVDY stojíte?',
        path: '/app/kalkulacka#krok-3',
        icon: <BarChart3 size={16} />,
      },
      {
        text: 'Zobrazit výsledky',
        path: '/app/kalkulacka/vysledky',
        icon: <Eye size={16} />,
      }
    ]
  },
  { text: 'Historie', icon: <HistoryIcon />, path: '/app/historie' },
];

const AppLayout = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();

  const [openMenus, setOpenMenus] = useState({});

  // Auto-expand menu based on current path
  useEffect(() => {
    const newOpenMenus = {};
    menuItems.forEach(item => {
      if (item.submenu && item.submenu.some(sub => location.pathname.startsWith(sub.path.split('#')[0]))) {
        newOpenMenus[item.text] = true;
      }
    });
    setOpenMenus(newOpenMenus);
  }, [location.pathname]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Chyba při odhlašování:', error);
    }
    handleMenuClose();
  };

  const handleNavigation = (path) => {
    // Handle calculator steps with hash
    if (path.includes('/app/kalkulacka#krok-')) {
      const step = parseInt(path.split('#krok-')[1]);
      // Use timestamp to force navigation even on same path
      navigate('/app/kalkulacka', {
        state: { step: step - 1, timestamp: Date.now() },
        replace: location.pathname === '/app/kalkulacka'
      });
    } else {
      navigate(path);
    }
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const handleToggleMenu = (menuText) => {
    setOpenMenus(prev => ({
      ...prev,
      [menuText]: !prev[menuText]
    }));
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 3 }}>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            background: (theme) =>
              theme.palette.mode === 'dark'
                ? '#0DDD0D'
                : 'linear-gradient(135deg, #FFD700 0%, #CD7F32 50%, #A0522D 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          PricePro
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Naceň své služby správně
        </Typography>
      </Box>
      <Divider />
      <List sx={{ flex: 1, px: 2, py: 1 }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          const hasSubmenu = item.submenu && item.submenu.length > 0;
          const isOpen = openMenus[item.text];

          return (
            <Box key={item.text}>
              <ListItem disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  onClick={() => {
                    if (hasSubmenu) {
                      handleToggleMenu(item.text);
                      handleNavigation(item.path);
                    } else {
                      handleNavigation(item.path);
                    }
                  }}
                  sx={{
                    borderRadius: 2,
                    py: 1,
                    px: 1.5,
                    bgcolor: isActive ? (theme) => theme.palette.mode === 'dark' ? 'rgba(13, 221, 13, 0.15)' : 'rgba(205, 127, 50, 0.15)' : 'transparent',
                    color: 'text.primary',
                    border: isActive ? '1px solid' : 'none',
                    borderColor: isActive ? (theme) => theme.palette.mode === 'dark' ? 'rgba(13, 221, 13, 0.3)' : 'rgba(205, 127, 50, 0.3)' : 'transparent',
                    '&:hover': {
                      bgcolor: isActive ? (theme) => theme.palette.mode === 'dark' ? 'rgba(13, 221, 13, 0.2)' : 'rgba(205, 127, 50, 0.2)' : 'action.hover',
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: isActive ? (theme) => theme.palette.mode === 'dark' ? '#0DDD0D' : '#CD7F32' : 'text.secondary',
                      minWidth: 40,
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.text} />
                  {hasSubmenu && (isOpen ? <ExpandLess /> : <ExpandMore />)}
                </ListItemButton>
              </ListItem>

              {/* Submenu with Timeline */}
              {hasSubmenu && (
                <Collapse in={isOpen} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding sx={{ pl: 2 }}>
                    {item.submenu.map((subitem, index) => {
                      const isSubActive = location.pathname === subitem.path;
                      const isLast = index === item.submenu.length - 1;

                      return (
                        <Box key={subitem.path} sx={{ display: 'flex', alignItems: 'flex-start', position: 'relative' }}>
                          {/* Timeline indicator */}
                          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mr: 1.5, mt: 1 }}>
                            <Box
                              sx={{
                                width: 20,
                                height: 20,
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                bgcolor: isSubActive ? (theme) => theme.palette.mode === 'dark' ? 'rgba(13, 221, 13, 0.15)' : 'rgba(205, 127, 50, 0.15)' : 'transparent',
                                border: '1px solid',
                                borderColor: isSubActive ? (theme) => theme.palette.mode === 'dark' ? 'rgba(13, 221, 13, 0.5)' : 'rgba(205, 127, 50, 0.5)' : 'grey.400',
                                color: isSubActive ? (theme) => theme.palette.mode === 'dark' ? '#0DDD0D' : '#CD7F32' : 'grey.600',
                              }}
                            >
                              {subitem.icon}
                            </Box>
                            {!isLast && (
                              <Box
                                sx={{
                                  width: 2,
                                  height: 40,
                                  bgcolor: 'grey.300',
                                  mt: 0.5,
                                }}
                              />
                            )}
                          </Box>

                          {/* Submenu item */}
                          <ListItemButton
                            onClick={() => handleNavigation(subitem.path)}
                            sx={{
                              flex: 1,
                              borderRadius: 1,
                              py: 0.5,
                              px: 1,
                              minHeight: 40,
                              bgcolor: isSubActive ? 'action.selected' : 'transparent',
                              '&:hover': {
                                bgcolor: 'action.hover',
                              },
                            }}
                          >
                            <Box>
                              <Typography
                                variant="body2"
                                sx={{
                                  fontWeight: isSubActive ? 600 : 400,
                                  color: isSubActive ? 'primary.main' : 'text.primary',
                                  fontSize: '0.875rem',
                                }}
                              >
                                {subitem.text}
                              </Typography>
                              {subitem.subtitle && (
                                <Typography
                                  variant="caption"
                                  sx={{
                                    color: 'text.secondary',
                                    fontSize: '0.75rem',
                                    display: 'block',
                                  }}
                                >
                                  {subitem.subtitle}
                                </Typography>
                              )}
                            </Box>
                          </ListItemButton>
                        </Box>
                      );
                    })}
                  </List>
                </Collapse>
              )}
            </Box>
          );
        })}
      </List>
      <Divider />
      <Box sx={{ p: 2 }}>
        <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
          Součást vibecodingpro.cz
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { md: `${DRAWER_WIDTH}px` },
          bgcolor: 'background.paper',
          color: 'text.primary',
          boxShadow: 1,
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Box sx={{ flexGrow: 1 }} />
          <ThemeToggle />
          <IconButton onClick={handleMenuOpen} sx={{ p: 0.5, ml: 1 }}>
            <Avatar
              sx={{
                bgcolor: 'primary.main',
                width: 36,
                height: 36,
              }}
            >
              <PersonIcon />
            </Avatar>
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <MenuItem disabled>
              <Typography variant="body2" color="text.secondary">
                {user?.email}
              </Typography>
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleSignOut}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              Odhlásit se
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: DRAWER_WIDTH,
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: DRAWER_WIDTH,
              borderRight: '1px solid',
              borderColor: 'divider',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 1.5, sm: 2, md: 3 },
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          mt: '64px',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default AppLayout;
