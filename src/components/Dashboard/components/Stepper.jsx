
import React, { useEffect } from "react";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import StepContent from "@mui/material/StepContent";
import Typography from "@mui/material/Typography";
import { useDispatch, useSelector } from "react-redux";
import { attemptsExam } from "../../../features/examQuesSlice";

const ProgressBar = ({ progress }) => (
  <div style={{ width: "100%", backgroundColor: "#e0e0e0", borderRadius: 8, height: 12, marginTop: 8 }}>
    <div
      style={{
        width: `${progress}%`,
        backgroundColor: "#76c7c0",
        height: 12,
        borderRadius: 8,
      }}
    ></div>
  </div>
);

const Steppers = () => {
  const { attempts } = useSelector((state) => state.examQues);
  const dispatch = useDispatch();
  useEffect(() => {
    try{
      dispatch(attemptsExam());
    }catch(err){
       throw err;
    }
   }, [dispatch]);

  // Filter data to include only attempts where isqualified is true
  const qualifiedAttempts = attempts?.filter((item) => item.isqualified === true);

  console.log("qualifiedAttempts", qualifiedAttempts);

  // Group attempts by class category and subject
  const groupedAttempts = qualifiedAttempts?.reduce((acc, item) => {
    const key = `${item.exam.class_category.name}-${item.exam.subject.subject_name}`;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(item);
    return acc;
  }, {});

  console.log("groupedAttempts", groupedAttempts);

  const allLevels = ["1st Level", "2nd Level Online", "2nd Level Offline", "Interview"];

  return (
    <div style={{ maxWidth: 800, margin: "auto", padding: 16 }}>
      <Stepper orientation="vertical">
        {groupedAttempts &&
          Object.entries(groupedAttempts).map(([key, attempts], index) => {
            // Find the highest level achieved in this group
            const highestLevelIndex = Math.max(
              ...attempts.map((item) =>
                allLevels.findIndex((level) => level === item.exam.level.name)
              )
            );

            // Calculate progress percentage
            const progressPercentage = (
              ((highestLevelIndex + 1) / allLevels.length) * 100
            ).toFixed(0);

            return (
              <Step key={index} active={true}>
                <StepLabel>
                  <Typography variant="h6">
                    {attempts[0].exam.class_category.name} - {attempts[0].exam.subject.subject_name}
                  </Typography>
                </StepLabel>
                <StepContent>
                  <div style={{ marginTop: 8 }}>
                    <ProgressBar progress={progressPercentage} />
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                      {allLevels.map((level) => (
                        <Typography key={level} variant="caption">
                          {level}
                        </Typography>
                      ))}
                    </div>
                  </div>
                </StepContent>
              </Step>
            );
          })}
      </Stepper>
    </div>
  );
};

export default Steppers;