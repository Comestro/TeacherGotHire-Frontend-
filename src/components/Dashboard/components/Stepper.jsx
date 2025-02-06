import React, { useEffect } from "react";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import StepContent from "@mui/material/StepContent";
import Typography from "@mui/material/Typography";
import { useDispatch, useSelector } from "react-redux";
import { getLevels } from "../../../features/examQuesSlice";


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

  const data = useSelector((state)=>state.examQues.levels);
  const dispatch = useDispatch();

  console.log("data",data);

  useEffect(()=>{
     dispatch(getLevels());
  },[])


  const allLevels = ["Level 1", "Level 2 Online", "Level 2 Offline", "Interview"];


  return (
    <div style={{ maxWidth: 800, margin: "auto", padding: 16 }}>
      <Stepper orientation="vertical">
        {data && data?.map((item, index) => {
          // Calculate how far progress should go
          const progressPercentage = ((item?.levels?.length / allLevels.length) * 100).toFixed(0);

          return (
            <Step key={index} active={true}>
              <StepLabel>
                <Typography variant="h6">
                  {item.classcategory_name} - {item.subject_name}
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