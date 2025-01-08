import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { attemptsExam } from "../../features/examQuesSlice";

const ViewAttempts = () => {
    const examSet = useSelector((state) => state.examQues.examSet || []);
    console.log("Exam set", examSet)
    const examAttempts = useSelector((state) => state.examQues?.attempts);
    console.log("examAttempts", examAttempts);
    const dispatch = useDispatch();
    

 useEffect(() => {
     dispatch(attemptsExam());
     
   }, []);
 
   return (
    <div className="p-5">
      <div className="relative overflow-x-auto shadow sm:rounded-lg">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-white uppercase bg-[#3E98C7]">
            <tr>
              <th scope="col" className="px-6 py-3">
                Attempt
              </th>
              <th scope="col" className="px-6 py-3">
                Level
              </th>
              <th scope="col" className="px-6 py-3">
                Subject
              </th>
              <th scope="col" className="px-6 py-3">
                Results
              </th>
              <th scope="col" className="px-6 py-3">
                <span className="sr-only">Edit</span>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="bg-[#E5F1F9] border-b hover:bg-gray-50">
              <th
                scope="row"
                className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap"
              >
                Testing
              </th>
              <td className="px-6 py-4">English</td>
              <td className="px-6 py-4">pass</td>
              <td className="px-6 py-4">43</td>
              <td className="px-6 py-4 text-right">
                <a
                  href="#"
                  className="font-medium text-[#3E98C7] hover:underline"
                >
                  view results
                </a>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ViewAttempts;
