import React from 'react';
import { Container, Typography, Box } from '@mui/material';

const LoginPage: React.FC = () => {
  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>
          Login
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Login page will be implemented here
        </Typography>
      </Box>
    </Container>
  );
};

export default LoginPage;