import React from "react";
import {
  Card,
  CardContent,
  Grid,
  Avatar,
  Typography,
  Box,
  Divider,
  Chip,
  useMediaQuery,
  useTheme,
  Paper,
  Tooltip,
} from "@mui/material";
import VerifiedIcon from '@mui/icons-material/Verified';
import GppBadIcon from '@mui/icons-material/GppBad';

const TeacherCard = ({ teacherData }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  if (!teacherData) return null;

  return (
    <Card
      elevation={3}
      sx={{
        borderRadius: { xs: 1.5, sm: 2 },
        overflow: "hidden",
        mb: { xs: 2, sm: 3 },
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
        <Grid container spacing={{ xs: 2, sm: 3 }}>
          {/* Left Column - Image and Bio */}
          <Grid
            item
            xs={12}
            sm={4}
            md={3}
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: { xs: "center", sm: "flex-start" },
              mb: { xs: 1, sm: 0 }
            }}
          >
            {/* Profile Image */}
            <Box sx={{ 
              width: '100%',
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center'
            }}>
              <Avatar
                alt={teacherData?.Fname || "N/A"}
                src={teacherData?.profiles?.profile_picture || ""}
                sx={{
                  width: { xs: 120, sm: 130, md: 150 },
                  height: { xs: 120, sm: 130, md: 150 },
                  borderRadius: 2,
                  boxShadow: 2,
                  mb: 1.5,
                }}
              />
            </Box>

            {/* Bio Section - Mobile Only */}
            {isMobile && (
              <Box sx={{ width: '100%', mt: 1 }}>
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: 1.5,
                    bgcolor: 'background.default',
                    borderRadius: 1,
                    borderLeft: '3px solid',
                    borderColor: 'primary.main',
                  }}
                >
                  <Typography variant="subtitle2" fontWeight={600} mb={0.5}>
                    Professional Bio
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      lineHeight: 1.6,
                      color: 'text.secondary',
                      fontSize: '0.875rem',
                    }}
                  >
                    {teacherData?.profiles?.bio || "No professional summary available for this teacher."}
                  </Typography>
                </Paper>
              </Box>
            )}
          </Grid>

          {/* Right Column - Details */}
          <Grid item xs={12} sm={8} md={9}>
            {/* Name and Email with Verification Badge */}
            <Box sx={{ mb: { xs: 2, sm: 3 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                <Typography
                  variant={isMobile ? "h6" : "h5"}
                  sx={{
                    fontWeight: 700,
                    color: 'primary.main',
                    lineHeight: 1.2,
                  }}
                >
                  {teacherData?.Fname || "N/A"} {teacherData?.Lname || "N/A"}
                </Typography>
                
                <Tooltip 
                  title={teacherData?.is_verified ? "Verified Teacher" : "Not Verified"}
                  arrow
                >
                  {teacherData?.is_verified ? (
                    <VerifiedIcon 
                      color="success" 
                      fontSize={isMobile ? "small" : "medium"} 
                      sx={{ verticalAlign: 'middle' }} 
                    />
                  ) : (
                    <GppBadIcon 
                      color="error"
                      fontSize={isMobile ? "small" : "medium"} 
                      sx={{ verticalAlign: 'middle' }} 
                    />
                  )}
                </Tooltip>
              </Box>
              
              {teacherData?.email && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ 
                    fontSize: { xs: '0.9rem', sm: '1rem' },
                    mt: 0.5
                  }}
                >
                  {teacherData.email}
                </Typography>
              )}
            </Box>

            <Divider sx={{ mb: { xs: 2, sm: 2.5 } }} />
            
            {/* Bio Section - Tablet and Desktop */}
            {!isMobile && (
              <>
                <Box sx={{ mb: 2.5 }}>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: 600,
                      mb: 1,
                      color: 'text.primary',
                    }}
                  >
                    Professional Bio
                  </Typography>
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      p: 1.5,
                      bgcolor: 'background.default',
                      borderRadius: 1,
                      borderLeft: '4px solid',
                      borderColor: 'primary.main',
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        lineHeight: 1.6,
                        color: 'text.secondary',
                        fontSize: '0.95rem',
                      }}
                    >
                      {teacherData?.profiles?.bio || "No professional summary available for this teacher."}
                    </Typography>
                  </Paper>
                </Box>
                <Divider sx={{ mb: 2.5 }} />
              </>
            )}
            
            {/* Personal and Contact Information - Combined */}
            <Box>
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 600,
                  mb: 1.5,
                  color: 'text.primary',
                }}
              >
                Teacher Information
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <DetailItem 
                    label="Phone"
                    value={teacherData?.profiles?.phone_number || "Not provided"} 
                  />
                  <DetailItem 
                    label="Gender"
                    value={teacherData?.profiles?.gender || "Not specified"} 
                  />
                  <DetailItem 
                    label="Religion"
                    value={teacherData?.profiles?.religion || "Not specified"} 
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <DetailItem 
                    label="Date of Birth"
                    value={teacherData?.profiles?.date_of_birth || "Not provided"} 
                  />
                  <DetailItem 
                    label="Marital Status"
                    value={teacherData?.profiles?.marital_status || "Not specified"} 
                  />
                </Grid>
              </Grid>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

// Helper component for info items with improved layout
const DetailItem = ({ label, value }) => (
  <Box 
    sx={{ 
      mb: 1.5,
      display: 'flex',
      flexDirection: 'row',
      borderBottom: '1px dashed',
      borderColor: 'divider',
      pb: 0.75,
      '&:last-child': {
        borderBottom: 'none'  
      }
    }}
  >
    <Typography
      variant="body2"
      sx={{ 
        fontWeight: 600, 
        color: 'text.secondary',
        width: '120px',
        flexShrink: 0
      }}
    >
      {label}:
    </Typography>
    <Typography
      variant="body2"
      sx={{
        color: 'text.primary',
        wordBreak: 'break-word'
      }}
    >
      {value}
    </Typography>
  </Box>
);

export default TeacherCard;