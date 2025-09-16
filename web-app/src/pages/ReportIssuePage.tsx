import React from 'react';
import { Container, Typography, Box } from '@mui/material';

const ReportIssuePage: React.FC = () => {
  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          ReportIssuePage
        </Typography>
        <Typography variant="body1" color="textSecondary">
          This page will be implemented here
        </Typography>
      </Box>
    </Container>
  );
};

export default ReportIssuePage;
