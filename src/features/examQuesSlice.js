import { createSlice,createAsyncThunk  } from "@reduxjs/toolkit";
import { fetchQuestion,fetchExam,addResult,Attempts, fetchLevel,GeneratePasskey,VerifyPasscode, AddInterview,Interview,AttemptCount,ReportReason,AllCenter,fetchCenterUser,Approved,createExamSet,setterExamSet,AddReport,jobApply,delExamSet,addQuestionToExamSet,getAssignUserSubject,editExamSet,editQuestionToExamSet} from "../services/examQuesServices";

const initialState = {
  allQuestion: [],
  examSet: [],
  setterExamSet:[],
  interview:{},
  exam: "",
  attempts: [],
  allcenter:[],
  attemptCount: [],
  levels:[],
  reportReason:[],
  passkeyresponse:{},
  approvedpasskey:[],
  verifyresponse:{},
  centerUser:[],
  jobApply:[],
  setterUser:[],
  subject: "",
  language: "",
  status: "idle",
  loading: false,
  error: null,
};

export const getLevels = createAsyncThunk(
  "getLevels",
  async (__, { rejectWithValue }) => {
    try {
     
      const data = await fetchLevel();
      
      return data;
    } catch (error) {
      console.log('Error in getLevels:', error);
      let errorMessage = 'An error occurred';
      if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
        
      } else if (error.message) {
        errorMessage = error.message;
       
      }
      return rejectWithValue(errorMessage);
    }
  }
);
export const getAllQues = createAsyncThunk(
  "getAllQues",
  async ({ exam_id, language }, { rejectWithValue }) => {
    console.log("exam_id, language ",exam_id, language )
    try {
      const data = await fetchQuestion({ exam_id, language });
      return data;
    }catch (error) {
      console.log('Error in getLevels:', error);
      let errorMessage = 'An error occurred';
      if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
        
      } else if (error.message) {
        errorMessage = error.message;
       
      }
      return rejectWithValue(errorMessage);
    }
  }
  
);

  export const getExamSet= createAsyncThunk(
    "getExamSet",
    async ({ level_id, subject_id,type,class_category_id }, { rejectWithValue }) => {
      console.error("exa",{ level_id, subject_id,class_category_id })
      try {
        const data = await fetchExam({ level_id, subject_id,type,class_category_id });
        console.log("examSet",data)
         return data; 
      } catch (error) {
        console.log('Error in getLevels:', error);
        let errorMessage = 'An error occurred';
        if (error.response && error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
          
        } else if (error.message) {
          errorMessage = error.message;
         
        }
        return rejectWithValue(errorMessage);
      }
    }
  );

  

  export const postResult= createAsyncThunk(
    "postResult",
    async ({ exam,correct_answer,
      incorrect_answer,
      is_unanswered,language}, { rejectWithValue }) => {
      console.log("result",{ correct_answer,
        incorrect_answer,
        is_unanswered,})
      try {
        const data = await addResult({ exam,correct_answer,
          incorrect_answer,
          is_unanswered,language});
         return data; 
      } catch (error) {
        return rejectWithValue({
          message: error.message, 
          code: error.code || "UNKNOWN_ERROR", 
        });
      }
    }
    );

    export const postInterview= createAsyncThunk(
      "postInterview",
      async ({ subject,time,class_category}, { rejectWithValue }) => {
        console.log("interview",{ subject,time,class_category})
        try {
          const data = await AddInterview({ subject,time,class_category});
           return data; 
        } catch (error) {
          return rejectWithValue({
            message: error.message, 
            code: error.code || "UNKNOWN_ERROR", 
          });
        }
      }
      );
      export const getInterview= createAsyncThunk(
        "getInterview",
        async (__, { rejectWithValue }) => {
          
          try {
            const data = await Interview();
             return data; 
          } catch (error) {
            console.log('Error in getLevels:', error);
            let errorMessage = 'An error occurred';
            if (error.response && error.response.data && error.response.data.message) {
              errorMessage = error.response.data.message;
              
            } else if (error.message) {
              errorMessage = error.message;
             
            }
            return rejectWithValue(errorMessage);
          }
        }
        
        );
      
    

export const attemptsExam = createAsyncThunk(
  "attemptExam",
  async (_, { rejectWithValue }) => {
    try {
      const data = await Attempts();
      return data;
    }catch (error) {
      console.log('Error in getLevels:', error);
      let errorMessage = 'An error occurred';
      if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
        
      } else if (error.message) {
        errorMessage = error.message;
       
      }
      return rejectWithValue(errorMessage);
    }
  }
);

export const attemptsCount = createAsyncThunk(
  "attemptCount",
  async (_, { rejectWithValue }) => {
    try {
      const data = await AttemptCount();
      return data;
    } catch (error) {
      console.log('Error in getLevels:', error);
      let errorMessage = 'An error occurred';
      if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
        
      } else if (error.message) {
        errorMessage = error.message;
       
      }
      return rejectWithValue(errorMessage);
    }
  }
);


export const getReport = createAsyncThunk(
  "getReport",
  async (_, { rejectWithValue }) => {
    try {
      const data = await ReportReason();
      return data;
    } catch (error) {
      console.log('Error in getLevels:', error);
      let errorMessage = 'An error occurred';
      if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
        
      } else if (error.message) {
        errorMessage = error.message;
       
      }
      return rejectWithValue(errorMessage);
    }
  }
);
export const generatePasskey= createAsyncThunk(
  "generatePasskey",
  async ({ user_id,exam_id,center_id}, { rejectWithValue }) => {
    console.log("generate password",{ user_id,exam_id,center_id})
    try {
      const data = await GeneratePasskey({ user_id,exam_id,center_id});
       return data; 
    } catch (error) {
      console.log('Error in getLevels:', error);
      let errorMessage = 'An error occurred';
      if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
        
      } else if (error.message) {
        errorMessage = error.message;
       
      }
      return rejectWithValue(errorMessage);
    }
  }
  );
  export const getAllCenter= createAsyncThunk(
    "getAllCenter",
    async (__, { rejectWithValue }) => {
      
      try {
        const data = await AllCenter();
        console.log("data",data);
         return data; 
      } catch (error) {
        console.log('Error in getLevels:', error);
        let errorMessage = 'An error occurred';
        if (error.response && error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
          
        } else if (error.message) {
          errorMessage = error.message;
         
        }
        return rejectWithValue(errorMessage);
      }
    }
    );

  export const verifyPasscode= createAsyncThunk(
    "verifyPasscode",
    async ({ user_id,exam_id,passcode}, { rejectWithValue }) => {
      try {
        const data = await VerifyPasscode({ user_id,exam_id,passcode});
         return data; 
      } catch (error) {
        console.log('Error in getLevels:', error);
        let errorMessage = 'An error occurred';
        if (error.response && error.response.data.error ) {
          errorMessage = error.response.data.error;
          
        } else if (error.message) {
          errorMessage = error.message;
         
        }
        return rejectWithValue(errorMessage);
      }
    }
    );

    export const approveCenterUser= createAsyncThunk(
      "approveCenterUser",
      async ({user_id,exam_id}, { rejectWithValue }) => {
        try {
          const data = await Approved({user_id,exam_id});
           return data; 
        } catch (error) {
          console.log('Error in getLevels:', error);
          let errorMessage = 'An error occurred';
          if (error.response && error.response.data && error.response.data.message) {
            errorMessage = error.response.data.message;
            
          } else if (error.message) {
            errorMessage = error.message;
           
          }
          return rejectWithValue(errorMessage);
        }
      }
      );

    export const getAllCenterUser= createAsyncThunk(
      "getAllCenterUser",
      async (__, { rejectWithValue }) => {
        
        try {
          const data = await fetchCenterUser();
           return data; 
        } catch (error) {
          console.log('Error in getLevels:', error);
          let errorMessage = 'An error occurred';
          if (error.response && error.response.data && error.response.data.message) {
            errorMessage = error.response.data.message;
            
          } else if (error.message) {
            errorMessage = error.message;
           
          }
          return rejectWithValue(errorMessage);
        }
      }
      );

      export const postExamSet= createAsyncThunk(
        "postExamSet",
        
        async (payload, { rejectWithValue }) => {
         console.log("setter",payload) 
          try {
            const data = await createExamSet(payload);
             return data; 
          } catch (error) {
            console.log('Error in getLevels:', error);
            let errorMessage = 'An error occurred';
            if (error.response && error.response.data && error.response.data.message) {
              errorMessage = error.response.data.message;
              
            } else if (error.message) {
              errorMessage = error.message;
             
            }
            return rejectWithValue(errorMessage);
          }
        }
        );



        export const getExamSets= createAsyncThunk(
          "getExamSets",
          async (__, { rejectWithValue }) => {
            
            try {
              const data = await setterExamSet();
               return data; 
            } catch (error) {
              console.log('Error in getLevels:', error);
              let errorMessage = 'An error occurred';
              if (error.response && error.response.data && error.response.data.message) {
                errorMessage = error.response.data.message;
                
              } else if (error.message) {
                errorMessage = error.message;
               
              }
              return rejectWithValue(errorMessage);
            }
          }
          );

          export const putExamSet= createAsyncThunk(
            "putExamSet",
            async ({ payload, id }, { rejectWithValue }) => {
              
              try {
                const data = await editExamSet({ payload, id });
                 return data; 
              } catch (error) {
                console.log('Error in getLevels:', error);
                let errorMessage = 'An error occurred';
                if (error.response && error.response.data && error.response.data.message) {
                  errorMessage = error.response.data.message;
                  
                } else if (error.message) {
                  errorMessage = error.message;
                 
                }
                return rejectWithValue(errorMessage);
              }
            }
            );


            export const deleteExamSet= createAsyncThunk(
              "deleteExamSet",
              async (id, { rejectWithValue }) => {
                
                try {
                  const data = await delExamSet(id);
                   return data; 
                } catch (error) {
                  console.log('Error in getLevels:', error);
                  let errorMessage = 'An error occurred';
                  if (error.response && error.response.data && error.response.data.message) {
                    errorMessage = error.response.data.message;
                    
                  } else if (error.message) {
                    errorMessage = error.message;
                   
                  }
                  return rejectWithValue(errorMessage);
                }
              }
              );

              export const postReport= createAsyncThunk(
                "postReport",
                
                async ({question,issue_type}, { rejectWithValue }) => {
                 
                  try {
                    const data = await AddReport({question,issue_type});
                     return data; 
                  } catch (error) {
                    console.log('Error in getLevels:', error);
                    let errorMessage = 'An error occurred';
                    if (error.response && error.response.data && error.response.data.message) {
                      errorMessage = error.response.data.message;
                      
                    } else if (error.message) {
                      errorMessage = error.message;
                     
                    }
                    return rejectWithValue(errorMessage);
                  }
                }
                );

                export const postJobApply= createAsyncThunk(
                  "postJobApply",
                  
                  async ({subject, class_category}, { rejectWithValue }) => {
                   
                    try {
                      const data = await jobApply({subject, class_category});
                       return data; 
                    } catch (error) {
                      console.log('Error in getLevels:', error);
                      let errorMessage = 'An error occurred';
                      if ( error.response.data.error) {
                        errorMessage = error.response.data.error;
                        
                      } else if (error.message) {
                        errorMessage = error.message;
                       
                      }
                      return rejectWithValue(errorMessage);
                    }
                  }
                  );

                  export const postQuestionToExamSet= createAsyncThunk(
                    "postQuestionToExamSet",
                    
                    async (payload, { rejectWithValue }) => {
                     console.log("setter",payload) 
                      try {
                        const data = await addQuestionToExamSet(payload);
                         return data; 
                      } catch (error) {
                        console.log('Error in getLevels:', error);
                        let errorMessage = 'An error occurred';
                        if (error.response && error.response.data && error.response.data.message) {
                          errorMessage = error.response.data.message;
                          
                        } else if (error.message) {
                          errorMessage = error.message;
                         
                        }
                        return rejectWithValue(errorMessage);
                      }
                    }
                    );

                    export const putQuestionToExamSet= createAsyncThunk(
                      "putQuestionToExamSet",
                      
                      async ({ questionId, payload}, { rejectWithValue }) => {
                       console.log(" question update in slice",payload) 
                        try {
                          const data = await editQuestionToExamSet(questionId, payload);
                           return data; 
                        }catch (error) {
                          console.log('Error in getLevels:', error);
                          let errorMessage = 'An error occurred';
                          if (error.response && error.response.data && error.response.data.message) {
                            errorMessage = error.response.data.message;
                            
                          } else if (error.message) {
                            errorMessage = error.message;
                           
                          }
                          return rejectWithValue(errorMessage);
                        }
                      }
                      );
            
                    export const getSetterInfo= createAsyncThunk(
                      "getSetterInfo",
                      async (__, { rejectWithValue }) => {
                        
                        try {
                          const data = await getAssignUserSubject();
                           return data; 
                        } catch (error) {
                          console.log('Error in getLevels:', error);
                          let errorMessage = 'An error occurred';
                          if (error.response && error.response.data && error.response.data.message) {
                            errorMessage = error.response.data.message;
                            
                          } else if (error.message) {
                            errorMessage = error.message;
                           
                          }
                          return rejectWithValue(errorMessage);
                        }
                      }
                      );
const examQuesSlice = createSlice({
  name: "examQues",
  initialState,
  reducers: {
    setSubject(state, action) {
      state.subject = action.payload;
      console.log("action", action.payload);
    },
    setExam(state, action) {
      state.exam = action.payload;
      console.log("action", action.payload);
    },
    setLanguage(state, action) {
      state.language = action.payload;
    },
     resetPasskeyResponse: (state) => {
      state.passkeyresponse = {};
     },
     resetVerifyResponse: (state) => {
      state.verifyresponse = {};
     },
    resetInterview: (state) => {
    state.interview = {};
}
  },
  extraReducers: (builder) => {
    builder
    // for get data handeling
    .addCase(getLevels.pending, (state) => {
      state.status = "loading";
      state.error = null;
    })
    .addCase(getLevels.fulfilled, (state, action) => {
      state.status = "succeeded";
      state.levels = action.payload;
      console.log("stepper",action.payload)
    })
    .addCase(getLevels.rejected, (state, action) => {
      state.status = "failed";
      state.error = action.payload;
    });
    builder
      // for get data handeling
      .addCase(getAllQues.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(getAllQues.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.allQuestion = action.payload;
        // state.verifyresponse = action.payload.verifyresponse || {};
        // state.passkeyresponse = action.payload.passkeyresponse || {};
      })
      .addCase(getAllQues.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;

      });

    builder
      // for get data handeling
      .addCase(attemptsExam.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(attemptsExam.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.attempts = action.payload;
        console.log("action.payload", action.payload);
      })
      .addCase(attemptsExam.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
    
    
    builder
      // for get data handeling
      .addCase(attemptsCount.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(attemptsCount.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.attemptCount = action.payload;
        console.log("action", action.payload);
      })
      .addCase(attemptsCount.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });

    builder
      // for get data handeling
      .addCase(getExamSet.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(getExamSet.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.examSet = action.payload;
        console.log("examset",action.payload)
      })
      .addCase(getExamSet.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });

      builder
      // for get data handeling
      .addCase(getExamSets.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(getExamSets.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.setterExamSet = action.payload;
        console.log("examset",action.payload)
      })
      .addCase(getExamSets.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });

      builder
      // for get data handeling
      .addCase(getInterview.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(getInterview.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.interview = action.payload;
      })
      .addCase(getInterview.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });

      builder
      // for get data handeling
      .addCase(getReport.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(getReport.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.reportReason = action.payload;
      })
      .addCase(getReport.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
      builder
      // for get data handeling
      .addCase(getAllCenter.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(getAllCenter.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.allcenter = action.payload;
        console.log("allcenter",action.payload)
      })
      .addCase(getAllCenter.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });

      builder
      // for get data handeling
      .addCase(getAllCenterUser.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(getAllCenterUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.centerUser = action.payload;
        console.log("centerUser",action.payload)
      })
      .addCase(getAllCenterUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });

      builder
      // for get data handeling
      .addCase(generatePasskey.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(generatePasskey.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.passkeyresponse = action.payload;
      })
      .addCase(generatePasskey.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
      builder
      // for get data handeling
      .addCase(verifyPasscode.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(verifyPasscode.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.verifyresponse = action.payload;
      })
      .addCase(verifyPasscode.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
     

      builder
      // for get data handeling
      .addCase(approveCenterUser.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(approveCenterUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.approvedpasskey = action.payload;
      })
      .addCase(approveCenterUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });

      builder
      // for get data handeling
      .addCase(postJobApply.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(postJobApply.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.jobApply = action.payload;
        console.log("jobapply",action.payload)
      })
      .addCase(postJobApply.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });

      builder
      // for get data handeling
      .addCase(getSetterInfo.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(getSetterInfo.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.setterUser = action.payload;
        console.log("setterUser",action.payload)
      })
      .addCase(getSetterInfo.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });


      
  },
  resetState: () => initialState,
});

export const { setSubject, setExam, setLanguage,resetPasskeyResponse,resetVerifyResponse,resetInterview } = examQuesSlice.actions;
export default examQuesSlice.reducer;
