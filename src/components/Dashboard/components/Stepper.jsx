import * as React from 'react';
import Box from '@mui/material/Box';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';

const steps = [
  'Level 1 Exam',
  'Level 2 Exam',
  'Level 3 Exam',
];

export default function HorizontalLinearAlternativeLabelStepper() {
  return (
    <Box sx={{ width: '100%' }}>
      <Stepper activeStep={1} alternativeLabel>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>
              <p className='text-gray-500 text-sm font-semibold'>{label}</p>
            </StepLabel>
          </Step>
        ))}
      </Stepper>
    </Box>
  );
}
