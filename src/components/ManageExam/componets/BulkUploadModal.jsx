import React, { useState, useRef } from "react";
import * as XLSX from "xlsx";
import {
  FiX,
  FiUpload,
  FiDownload,
  FiCheckCircle,
  FiAlertCircle,
  FiFileText,
  FiLoader,
} from "react-icons/fi";
import { toast } from "react-toastify";
import { createNewQuestion } from "../../../services/adminManageExam";

const BulkUploadModal = ({
  isOpen,
  onClose,
  examId,
  onUploadSuccess,
  subjectName,
}) => {
  const [file, setFile] = useState(null);
  const [parsing, setParsing] = useState(false);
  const [parsedQuestions, setParsedQuestions] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const isLanguageSubject = () => {
    if (!subjectName) return false;
    const lowerName = subjectName.toLowerCase();
    const languages = [
      "english",
      "hindi",
      "urdu",
      "sanskrit",
      "bengali",
      "marathi",
      "telugu",
      "tamil",
      "gujarati",
      "kannada",
      "malayalam",
      "punjabi",
      "odia",
      "assamese",
      "maithili",
      "santali",
      "kashmiri",
      "nepali",
      "konkani",
      "sindhi",
      "dogri",
      "manipuri",
      "bodo",
      "japanese",
      "french",
      "german",
      "spanish",
    ];
    return languages.some((lang) => lowerName.includes(lang));
  };

  const getPrimaryLanguage = () => {
    if (!subjectName) return "English";
    const lowerName = subjectName.toLowerCase();
    if (lowerName.includes("hindi")) return "Hindi";
    if (lowerName.includes("urdu")) return "Urdu";
    // ... possibly more mappings but English/Hindi/Native is what current logic handles.
    return "English";
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (
        selectedFile.type ===
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
        selectedFile.type === "application/vnd.ms-excel" ||
        selectedFile.name.endsWith(".csv")
      ) {
        setFile(selectedFile);
        parseExcel(selectedFile);
      } else {
        toast.error("Please upload a valid Excel or CSV file");
      }
    }
  };

  const parseExcel = (file) => {
    setParsing(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(sheet);

        if (json.length === 0) {
          toast.error("The file is empty");
          setParsing(false);
          return;
        }

        // Mapping and Validation
        const questions = json
          .map((row, idx) => {
            try {
              // Flexible column names
              const qEng = row["Question (English)"] || row["Question"] || "";
              const optAEng =
                row["Option A (English)"] || row["Option A"] || "";
              const optBEng =
                row["Option B (English)"] || row["Option B"] || "";
              const optCEng =
                row["Option C (English)"] || row["Option C"] || "";
              const optDEng =
                row["Option D (English)"] || row["Option D"] || "";
              const solEng = row["Solution (English)"] || row["Solution"] || "";

              const qHindi = row["Question (Hindi)"] || "";
              const optAHindi = row["Option A (Hindi)"] || "";
              const optBHindi = row["Option B (Hindi)"] || "";
              const optCHindi = row["Option C (Hindi)"] || "";
              const optDHindi = row["Option D (Hindi)"] || "";
              const solHindi = row["Solution (Hindi)"] || "";

              const correct_option_raw = String(row["Correct Option"] || "")
                .trim()
                .toUpperCase();
              let correct_option = 1;
              if (["A", "1"].includes(correct_option_raw)) correct_option = 1;
              else if (["B", "2"].includes(correct_option_raw))
                correct_option = 2;
              else if (["C", "3"].includes(correct_option_raw))
                correct_option = 3;
              else if (["D", "4"].includes(correct_option_raw))
                correct_option = 4;

              return {
                eng: {
                  text: qEng,
                  options: [optAEng, optBEng, optCEng, optDEng],
                  solution: solEng,
                  correct_option,
                },
                hindi: {
                  text: qHindi,
                  options: [optAHindi, optBHindi, optCHindi, optDHindi],
                  solution: solHindi,
                  correct_option,
                },
              };
            } catch (err) {
              console.error(`Error parsing row ${idx + 1}:`, err);
              return null;
            }
          })
          .filter(Boolean);

        setParsedQuestions(questions);
        toast.info(
          `Parsed ${questions.length} questions. Please review and click upload.`,
        );
      } catch (err) {
        toast.error("Failed to parse file. Ensure it is a valid format.");
      } finally {
        setParsing(false);
      }
    };
    reader.readAsBinaryString(file);
  };

  const downloadTemplate = () => {
    const isLanguage = isLanguageSubject();
    const headers = isLanguage
      ? [
          "Question",
          "Option A",
          "Option B",
          "Option C",
          "Option D",
          "Solution",
          "Correct Option",
        ]
      : [
          "Question (English)",
          "Option A (English)",
          "Option B (English)",
          "Option C (English)",
          "Option D (English)",
          "Solution (English)",
          "Question (Hindi)",
          "Option A (Hindi)",
          "Option B (Hindi)",
          "Option C (Hindi)",
          "Option D (Hindi)",
          "Solution (Hindi)",
          "Correct Option",
        ];

    const sampleData = isLanguage
      ? [
          headers,
          [
            "Sample Question Content?",
            "Option 1 text",
            "Option 2 text",
            "Option 3 text",
            "Option 4 text",
            "Explain why...",
            "A",
          ],
        ]
      : [
          headers,
          [
            "Question in English?",
            "A",
            "B",
            "C",
            "D",
            "Explanations...",
            "सामग्री हिंदी में?",
            "क",
            "ख",
            "ग",
            "घ",
            "स्पष्टीकरण...",
            "A",
          ],
        ];

    const ws = XLSX.utils.aoa_to_sheet(sampleData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, "Question_Bulk_Upload_Template.xlsx");
  };

  const handleUpload = async () => {
    if (parsedQuestions.length === 0) return;
    setUploading(true);
    let successCount = 0;
    let failCount = 0;

    const isLang = isLanguageSubject();
    const primaryLang = getPrimaryLanguage();

    for (let i = 0; i < parsedQuestions.length; i++) {
      const item = parsedQuestions[i];
      try {
        const questionsToSubmit = [];

        // Format English/Primary question
        const engQ = {
          language: isLang ? primaryLang : "English",
          text: item.eng.text,
          options: item.eng.options,
          correct_option: item.eng.correct_option,
          solution: item.eng.solution,
        };
        questionsToSubmit.push(engQ);

        if (!isLang) {
          // STANDARD SUBJECT: Add Hindi pair ONLY if Hindi text is present
          if (item.hindi && item.hindi.text && item.hindi.text.trim()) {
            const hindiQ = {
              language: "Hindi",
              text: item.hindi.text,
              options: item.hindi.options.some((o) => o)
                ? item.hindi.options
                : item.eng.options, // We keep the option fallback if specific Hindi options aren't provided but text is
              correct_option: item.hindi.correct_option,
              solution: item.hindi.solution,
            };
            questionsToSubmit.push(hindiQ);
          }
        }
        // LANGUAGE SUBJECT: Do NOT add a second question — only send the single one

        const payload = {
          exam: parseInt(examId),
          questions: questionsToSubmit,
        };

        await createNewQuestion(payload);
        successCount++;
      } catch (err) {
        failCount++;
        console.error(`Failed to upload question at index ${i}:`, err);
      }
      setProgress(Math.round(((i + 1) / parsedQuestions.length) * 100));
    }

    setUploading(false);
    if (successCount > 0) {
      toast.success(`Successfully uploaded ${successCount} questions!`);
      if (failCount > 0) toast.warn(`${failCount} questions failed to upload.`);
      onUploadSuccess();
      onClose();
    } else {
      toast.error(
        "Failed to upload all questions. Please check the console for details.",
      );
    }
  };

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded  shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col border border-gray-100 animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <h2 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
            <FiFileText className="text-teal-600" />
            Bulk Question Upload
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-400 hover:text-gray-600"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex items-start gap-3">
            <FiAlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-bold mb-1">Instructions:</p>
              <ul className="list-disc list-inside space-y-1 text-xs opacity-90">
                <li>Download the template to see the correct format.</li>
                <li>Ensure "Correct Option" is A, B, C, D or 1, 2, 3, 4.</li>
                <li>
                  {isLanguageSubject()
                    ? "This subject is language-specific. Template is simplified."
                    : "Both English and Hindi inputs are supported."}
                </li>
              </ul>
              <button
                onClick={downloadTemplate}
                className="mt-3 flex items-center gap-2 px-3 py-1.5 bg-white text-blue-700 rounded-lg text-xs font-bold hover:bg-blue-100 transition-colors shadow-sm"
              >
                <FiDownload /> Download Excel Template
              </button>
            </div>
          </div>

          {!file ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-200 rounded  p-10 flex flex-col items-center justify-center cursor-pointer hover:border-teal-400 hover:bg-teal-50/30 transition-all group"
            >
              <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <FiUpload className="w-8 h-8 text-teal-600" />
              </div>
              <p className="text-sm font-bold text-gray-700 mb-1">
                Click to Upload Excel File
              </p>
              <p className="text-xs text-gray-500">
                Maximum size: 5MB (.xlsx, .xls, .csv)
              </p>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".xlsx, .xls, .csv"
                className="hidden"
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg text-green-600">
                    <FiCheckCircle />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-800">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {(file.size / 1024).toFixed(1)} KB •{" "}
                      {parsedQuestions.length} Questions parsed
                    </p>
                  </div>
                </div>
                {!uploading && (
                  <button
                    onClick={() => {
                      setFile(null);
                      setParsedQuestions([]);
                    }}
                    className="text-xs font-bold text-red-500 hover:underline"
                  >
                    Remove
                  </button>
                )}
              </div>

              {uploading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-teal-600 uppercase">
                      Processing questions...
                    </span>
                    <span>{progress}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5">
                    <div
                      className="bg-teal-600 h-2.5 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={uploading}
            className="px-4 py-2 text-sm font-bold text-gray-600 hover:text-gray-900 transition-colors bg-white border border-gray-300 rounded-xl hover:bg-gray-100 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={
              !file || parsing || uploading || parsedQuestions.length === 0
            }
            className="px-6 py-2 bg-teal-600 text-white rounded-xl text-sm font-bold hover:bg-teal-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm"
          >
            {(parsing || uploading) && <FiLoader className="animate-spin" />}
            {uploading ? `Uploading...` : `Start Upload`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BulkUploadModal;
