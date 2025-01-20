import React from "react";
import { Box, Card, CardContent, Typography } from "@mui/material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

const AnalyticsCard = ({ analytics }) => {
  return (
    <Box mt={3} mb={3}>
      <Card style={{ boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)" }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Analytics
          </Typography>
          <Box display="flex" flexWrap="wrap" gap={3}>
            <Box>
              <Typography variant="subtitle1">Profile Views</Typography>
              <LineChart width={300} height={200} data={analytics.profileViews}>
                <XAxis dataKey="date" />
                <YAxis />
                <CartesianGrid strokeDasharray="3 3" />
                <ChartTooltip />
                <Line type="monotone" dataKey="views" stroke="#8884d8" />
              </LineChart>
            </Box>
            <Box>
              <Typography variant="subtitle1">Job Matches</Typography>
              <BarChart width={300} height={200} data={analytics.jobMatches}>
                <XAxis dataKey="job" />
                <YAxis />
                <CartesianGrid strokeDasharray="3 3" />
                <ChartTooltip />
                <Bar dataKey="matches" fill="#82ca9d" />
              </BarChart>
            </Box>
            <Box>
              <Typography variant="subtitle1">Feedback Ratings</Typography>
              <PieChart width={300} height={200}>
                <Pie
                  data={analytics.feedbackRatings}
                  dataKey="count"
                  nameKey="rating"
                  cx="50%"
                  cy="50%"
                  outerRadius={60}
                  fill="#8884d8"
                >
                  {analytics.feedbackRatings.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <ChartTooltip />
              </PieChart>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default AnalyticsCard;
