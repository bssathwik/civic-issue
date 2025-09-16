import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Paper,
  Avatar,
} from '@mui/material';
import {
  Report,
  Group,
  Timeline,
  LocationOn,
  PhotoCamera,
  Security,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const HomePage: React.FC = () => {
  const { user } = useAuth();

  const features = [
    {
      icon: <Report color="primary" sx={{ fontSize: 40 }} />,
      title: 'Report Issues',
      description: 'Easily report civic issues in your neighborhood with photos and location data.',
    },
    {
      icon: <PhotoCamera color="primary" sx={{ fontSize: 40 }} />,
      title: 'Photo Evidence',
      description: 'Upload photos to provide visual evidence and help authorities understand the issue.',
    },
    {
      icon: <LocationOn color="primary" sx={{ fontSize: 40 }} />,
      title: 'GPS Location',
      description: 'Automatic location tracking ensures issues are precisely located for quick resolution.',
    },
    {
      icon: <Group color="primary" sx={{ fontSize: 40 }} />,
      title: 'Community Validation',
      description: 'Citizens can upvote and validate issues to prioritize community needs.',
    },
    {
      icon: <Security color="primary" sx={{ fontSize: 40 }} />,
      title: 'AI Spam Detection',
      description: 'Advanced AI filters spam and categorizes issues for efficient processing.',
    },
    {
      icon: <Timeline color="primary" sx={{ fontSize: 40 }} />,
      title: '48hr Tracking',
      description: 'Track issue resolution within 48 hours with real-time status updates.',
    },
  ];

  const stats = [
    { label: 'Issues Reported', value: '1,234' },
    { label: 'Issues Resolved', value: '987' },
    { label: 'Active Users', value: '5,678' },
    { label: 'Response Rate', value: '92%' },
  ];

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #2196F3 0%, #21CBF3 100%)',
          color: 'white',
          py: 8,
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid component="div" xs={12} md={6}>
              <Typography variant="h2" component="h1" gutterBottom fontWeight="bold">
                Make Your City Better
              </Typography>
              <Typography variant="h5" paragraph>
                Report civic issues, track their resolution, and collaborate with your community 
                to build a better place to live.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
                {user ? (
                  <Button
                    variant="contained"
                    size="large"
                    component={Link}
                    to="/report"
                    sx={{ bgcolor: 'white', color: 'primary.main' }}
                  >
                    Report an Issue
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    size="large"
                    component={Link}
                    to="/register"
                    sx={{ bgcolor: 'white', color: 'primary.main' }}
                  >
                    Get Started
                  </Button>
                )}
                <Button
                  variant="outlined"
                  size="large"
                  component={Link}
                  to="/issues"
                  sx={{ borderColor: 'white', color: 'white' }}
                >
                  Browse Issues
                </Button>
              </Box>
            </Grid>
            <Grid component="div" xs={12} md={6}>
              <Box
                sx={{
                  textAlign: 'center',
                  '& img': { maxWidth: '100%', height: 'auto' },
                }}
              >
                <Typography variant="h1" sx={{ fontSize: '8rem', opacity: 0.3 }}>
                  🏛️
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Stats Section */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Grid container spacing={4}>
          {stats.map((stat, index) => (
            <Grid component="div" xs={6} md={3} key={index}>
              <Paper elevation={2} sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="h3" color="primary" fontWeight="bold">
                  {stat.value}
                </Typography>
                <Typography variant="subtitle1" color="textSecondary">
                  {stat.label}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Features Section */}
      <Box sx={{ bgcolor: 'grey.50', py: 8 }}>
        <Container maxWidth="lg">
          <Typography variant="h3" align="center" gutterBottom fontWeight="bold">
            Powerful Features
          </Typography>
          <Typography variant="h6" align="center" color="textSecondary" paragraph>
            Everything you need to report, track, and resolve civic issues effectively
          </Typography>
          
          <Grid container spacing={4} sx={{ mt: 4 }}>
            {features.map((feature, index) => (
              <Grid component="div" xs={12} md={4} key={index}>
                <Card sx={{ height: '100%', textAlign: 'center' }}>
                  <CardContent sx={{ p: 3 }}>
                    <Avatar
                      sx={{
                        bgcolor: 'primary.light',
                        width: 80,
                        height: 80,
                        mx: 'auto',
                        mb: 2,
                      }}
                    >
                      {feature.icon}
                    </Avatar>
                    <Typography variant="h5" gutterBottom fontWeight="bold">
                      {feature.title}
                    </Typography>
                    <Typography variant="body1" color="textSecondary">
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Paper
          elevation={3}
          sx={{
            p: 6,
            textAlign: 'center',
            bgcolor: 'primary.main',
            color: 'white',
          }}
        >
          <Typography variant="h4" gutterBottom fontWeight="bold">
            Ready to Make a Difference?
          </Typography>
          <Typography variant="h6" paragraph>
            Join thousands of citizens who are actively improving their communities.
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 4 }}>
            {!user && (
              <Button
                variant="contained"
                size="large"
                component={Link}
                to="/register"
                sx={{ bgcolor: 'white', color: 'primary.main' }}
              >
                Sign Up Now
              </Button>
            )}
            <Button
              variant="outlined"
              size="large"
              component={Link}
              to="/issues"
              sx={{ borderColor: 'white', color: 'white' }}
            >
              Explore Issues
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default HomePage;