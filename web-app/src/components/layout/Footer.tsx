import React from 'react';
import {
  Box,
  Container,
  Typography,
  Link,
  Grid,
  Divider,
} from '@mui/material';

const Footer: React.FC = () => {
  return (
    <Box 
      component="footer" 
      sx={{ 
        bgcolor: 'primary.dark', 
        color: 'white', 
        py: 3, 
        mt: 'auto' 
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom>
              🏛️ CivicConnect
            </Typography>
            <Typography variant="body2">
              Empowering citizens to make their communities better through 
              collaborative issue reporting and resolution.
            </Typography>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom>
              Quick Links
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link href="/issues" color="inherit" underline="hover">
                Browse Issues
              </Link>
              <Link href="/report" color="inherit" underline="hover">
                Report Issue
              </Link>
              <Link href="/leaderboard" color="inherit" underline="hover">
                Leaderboard
              </Link>
              <Link href="/dashboard" color="inherit" underline="hover">
                Dashboard
              </Link>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom>
              Support
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link href="/help" color="inherit" underline="hover">
                Help Center
              </Link>
              <Link href="/contact" color="inherit" underline="hover">
                Contact Us
              </Link>
              <Link href="/privacy" color="inherit" underline="hover">
                Privacy Policy
              </Link>
              <Link href="/terms" color="inherit" underline="hover">
                Terms of Service
              </Link>
            </Box>
          </Grid>
        </Grid>
        
        <Divider sx={{ my: 2, borderColor: 'rgba(255, 255, 255, 0.2)' }} />
        
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2" color="rgba(255, 255, 255, 0.7)">
            © {new Date().getFullYear()} CivicConnect. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;