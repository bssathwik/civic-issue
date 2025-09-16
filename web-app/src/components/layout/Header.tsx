import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Badge,
  Avatar,
  Box,
  Container,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  AccountCircle,
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotification();
  const navigate = useNavigate();
  
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState<null | HTMLElement>(null);

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleNotificationMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setNotificationAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    handleMenuClose();
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    handleMenuClose();
  };

  return (
    <AppBar position="static">
      <Container maxWidth="lg">
        <Toolbar>
          <Typography 
            variant="h6" 
            component={Link} 
            to="/" 
            sx={{ 
              flexGrow: 1, 
              textDecoration: 'none', 
              color: 'inherit',
              fontWeight: 'bold'
            }}
          >
            🏛️ CivicConnect
          </Typography>

          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 2 }}>
            <Button color="inherit" component={Link} to="/issues">
              Browse Issues
            </Button>
            <Button color="inherit" component={Link} to="/leaderboard">
              Leaderboard
            </Button>
          </Box>

          {user ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {/* Notifications */}
              <IconButton
                color="inherit"
                onClick={handleNotificationMenuOpen}
              >
                <Badge badgeContent={unreadCount} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>

              {/* Profile Menu */}
              <IconButton
                onClick={handleProfileMenuOpen}
                color="inherit"
              >
                {user.avatar ? (
                  <Avatar src={user.avatar} sx={{ width: 32, height: 32 }} />
                ) : (
                  <AccountCircle />
                )}
              </IconButton>

              <Typography variant="body2" sx={{ display: { xs: 'none', sm: 'block' } }}>
                {user.name}
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button color="inherit" component={Link} to="/login">
                Login
              </Button>
              <Button 
                variant="outlined" 
                color="inherit" 
                component={Link} 
                to="/register"
              >
                Sign Up
              </Button>
            </Box>
          )}

          {/* Profile Menu */}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <MenuItem onClick={() => handleNavigation('/dashboard')}>
              Dashboard
            </MenuItem>
            <MenuItem onClick={() => handleNavigation('/profile')}>
              Profile
            </MenuItem>
            <MenuItem onClick={() => handleNavigation('/report')}>
              Report Issue
            </MenuItem>
            {user?.role === 'admin' && (
              <MenuItem onClick={() => handleNavigation('/admin')}>
                Admin Panel
              </MenuItem>
            )}
            {(user?.role === 'field_worker' || user?.role === 'admin') && (
              <MenuItem onClick={() => handleNavigation('/field-worker')}>
                Field Worker Panel
              </MenuItem>
            )}
            <MenuItem onClick={handleLogout}>
              Logout
            </MenuItem>
          </Menu>

          {/* Notification Menu */}
          <Menu
            anchorEl={notificationAnchorEl}
            open={Boolean(notificationAnchorEl)}
            onClose={handleMenuClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            PaperProps={{
              sx: { width: 320, maxHeight: 400 }
            }}
          >
            <MenuItem onClick={() => handleNavigation('/dashboard')}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                View All Notifications
              </Typography>
            </MenuItem>
            {unreadCount === 0 ? (
              <MenuItem disabled>
                <Typography variant="body2" color="textSecondary">
                  No new notifications
                </Typography>
              </MenuItem>
            ) : (
              <MenuItem disabled>
                <Typography variant="body2" color="primary">
                  {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                </Typography>
              </MenuItem>
            )}
          </Menu>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Header;