import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion } from "framer-motion";
import { useSelector, useDispatch } from "react-redux";
import FilterdExamCard from "./components/FilterdExamCard";
import { Helmet } from "react-helmet-async";
import { checkPasskey } from "../../services/examServices";
import ExamCenterModal from "./components/passkeyCard";
import {
  FaBuilding,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaCheckCircle,
  FaLock
} from "react-icons/fa";

function StartTest() {
  const { examCards } = useSelector((state) => state?.exam);
  const [passkeyStatus, setPasskeyStatus] = useState(null);
  const [isExamCenterModalOpen, setIsExamCenterModalOpen] = useState(false);
  const [isVerifyCard, setIsVerifyCard] = useState(false);
  const filterdExamCardRef = useRef(null);

  const refreshPasskeyStatus = async () => {
    try {
      const response = await checkPasskey({ exam: examCards?.id });
      if (response?.passkey == true) {
        setPasskeyStatus(response);
        setIsVerifyCard(true);
      } else {
        setPasskeyStatus(null);
        setIsVerifyCard(false);
      }
    } catch (error) {
      setPasskeyStatus(null);
      setIsVerifyCard(false);
    }
  };

  useEffect(() => {
    refreshPasskeyStatus();
  }, [examCards]);

  return (
    <>
      <Helmet>
        <title>Start Test - PTPI</title>
      </Helmet>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 mt-16 md:mt-2">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-9/12 lg:w-9/12">
            
            {/* Assigned Exam Center Info */}
            {passkeyStatus?.passkey && passkeyStatus?.center && ['requested', 'fulfilled'].includes(passkeyStatus?.status) && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 rounded-lg bg-white border border-slate-100"
              >
                <div className="bg-slate-50 border-b border-slate-100 px-5 py-3 flex items-center justify-between">
                  <h3 className="flex items-center gap-2 text-base font-semibold text-slate-800">
                    <FaBuilding className="text-teal-600" /> Assigned Exam Center / आवंटित परीक्षा केंद्र
                  </h3>
                  <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${passkeyStatus.status === 'fulfilled' ? 'bg-green-100 text-green-700' : 'bg-teal-100 text-teal-700'}`}>
                    {passkeyStatus.status === 'fulfilled' ? 'Verified' : 'Pending Verification'}
                  </span>
                </div>

                <div className="p-5">
                  {passkeyStatus.status === 'fulfilled' ? (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Center Details</p>
                            <h4 className="text-lg font-bold text-slate-800">{passkeyStatus.center.name}</h4>
                          </div>

                          <div className="flex gap-3">
                            <FaMapMarkerAlt className="mt-1 text-slate-400 shrink-0" />
                            <div>
                              <p className="text-xs font-semibold text-slate-500 mb-0.5">Address / पता</p>
                              <p className="text-slate-600 text-sm">
                                {passkeyStatus.center.area && `${passkeyStatus.center.area}, `}
                                {passkeyStatus.center.city}, {passkeyStatus.center.state} - {passkeyStatus.center.pincode}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Contact Information</p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-8 w-8 items-center justify-center rounded bg-slate-50 text-teal-600">
                                <FaPhoneAlt size={14} />
                              </div>
                              <a href={`tel:${passkeyStatus.center.phone}`} className="text-sm font-bold text-slate-700">
                                {passkeyStatus.center.phone}
                              </a>
                            </div>

                            {passkeyStatus.center.alt_phone && (
                              <div className="flex items-center gap-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded bg-slate-50 text-slate-600">
                                  <FaPhoneAlt size={14} />
                                </div>
                                <a href={`tel:${passkeyStatus.center.alt_phone}`} className="text-sm font-bold text-slate-700">
                                  {passkeyStatus.center.alt_phone}
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="mt-5 pt-4 border-t border-slate-50">
                        <div className="flex items-start gap-2 text-slate-500">
                          <FaCheckCircle className="mt-0.5 text-green-500 shrink-0" size={12} />
                          <p className="text-xs leading-relaxed">
                            <span className="font-bold text-slate-700">Next Step:</span> Your verification is complete. You can now proceed with your examination.
                          </p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-6">
                       <FaLock className="mx-auto text-slate-300 mb-3" size={24} />
                       <p className="text-sm text-slate-500 font-medium">Center details will be visible once your passkey request is fulfilled by the administrator.</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            <div>
              <FilterdExamCard ref={filterdExamCardRef} onExamDataChange={refreshPasskeyStatus} passkeyStatus={passkeyStatus} />
            </div>

          </div>
          
          <div className="w-full md:w-3/12 lg:w-3/12 mt-6 md:mt-0 border-l border-slate-150 pl-6 space-y-6 hidden md:block">
            <img src="/help.png" alt="Test Steps" className="w-full h-auto" />
          </div>
        </div>
      </div>

      {isExamCenterModalOpen && (
        <ExamCenterModal
          isOpen={isExamCenterModalOpen}
          onClose={() => setIsExamCenterModalOpen(false)}
          examCards={examCards}
          isverifyCard={isVerifyCard}
          examCenterData={passkeyStatus?.center}
        />
      )}
    </>
  );
}

export default StartTest;
