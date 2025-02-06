import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Grid,
  List,
  ListItem,
  ListItemText,
  Divider,
  Button,
} from "@mui/material";

const QuestionList = ({ questions }) => (
  <List sx={{ width: "100%", bgcolor: "background.paper" }}>
    {questions?.map((question, index) => (
      <div key={question.id}>
        <ListItem alignItems="flex-start">
          <ListItemText
            primary={`${index + 1}. ${question.text}`}
            secondary={
              <>
                <Typography variant="body2" color="text.primary">
                  Options:
                </Typography>
                {question.options.map((option, i) => (
                  <Typography
                    key={i}
                    variant="body2"
                    color={
                      i + 1 === question.correct_option
                        ? "success.main"
                        : "text.secondary"
                    }
                  >
                    {i + 1}. {option}
                  </Typography>
                ))}
                <Typography variant="body2" mt={1} color="text.primary">
                  Solution: {question.solution}
                </Typography>
              </>
            }
          />
        </ListItem>
        <Divider variant="inset" component="li" />
      </div>
    ))}
  </List>
);

const ViewQuestionModal = ({ open, onClose, selectedExam }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Exam Details - {selectedExam?.name}</DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" gutterBottom>
              Basic Information
            </Typography>
            <Typography variant="body1">
              <strong>Subject:</strong> {selectedExam?.subject?.subject_name}
            </Typography>
            <Typography variant="body1">
              <strong>Level:</strong> {selectedExam?.level?.name}
            </Typography>
            <Typography variant="body1">
              <strong>Class Category:</strong>{" "}
              {selectedExam?.class_category?.name}
            </Typography>
            <Typography variant="body1">
              <strong>Total Marks:</strong> {selectedExam?.total_marks}
            </Typography>
            <Typography variant="body1">
              <strong>Duration:</strong> {selectedExam?.duration} minutes
            </Typography>
            <Typography variant="body1">
              <strong>Type:</strong> {selectedExam?.type || "N/A"}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Questions ({selectedExam?.questions?.length})
            </Typography>
            <QuestionList questions={selectedExam?.questions} />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ViewQuestionModal;
