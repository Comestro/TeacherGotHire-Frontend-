import React, { useEffect, useState, lazy, Suspense } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiGlobe,
  FiPlus,
  FiLoader,
  FiRefreshCw,
} from "react-icons/fi";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { translateText } from "../../../services/apiService";
import {
  createNewQuestion,
  getExamById,
} from "../../../services/adminManageExam";
import QuestionPreview from "./QuestionPreview";
import { addStyles, EditableMathField } from "react-mathquill";

addStyles();
class EqErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(err, info) {}
  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }
    const {
      fallbackValue = "",
      onChange = () => {},
      onSave = () => {},
      onCancel = () => {},
    } = this.props;

    return (
      <div className="p-4 space-y-3">
        <div className="p-3 text-sm text-red-700 bg-red-50 rounded">
          Equation editor failed to load. You can paste or edit LaTeX below and
          Save to insert it into the field.
        </div>

        <label className="block text-sm font-medium text-gray-700">LaTeX</label>
        <textarea
          value={fallbackValue}
          onChange={(e) => onChange(e.target.value)}
          rows={6}
          className="w-full p-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-red-300 resize-none"
          placeholder="Paste or type LaTeX here, e.g. \frac{a}{b}"
        />

        <div className="flex justify-end space-x-2">
          <button
            onClick={onSave}
            className="bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700"
          >
            Save
          </button>
          <button
            onClick={onCancel}
            className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }
}

const QuestionForm = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [subjectName, setSubjectName] = useState("");

  useEffect(() => {
    const fetchExamDetails = async () => {
      try {
        const response = await getExamById(examId);
        if (response && response.subject && response.subject.subject_name) {
          const fetchedSubjectName = response.subject.subject_name;
          setSubjectName(fetchedSubjectName);
          // Update the language field based on subject
          const primaryLang = getPrimaryLanguageFromName(fetchedSubjectName);
          setEnglishQuestion((prev) => ({ ...prev, language: primaryLang }));
          // Set default language mode based on subject
          const lowerName = fetchedSubjectName.toLowerCase();
          const langList = [
      "english", "hindi", "urdu", "sanskrit", "bengali", 
      "marathi", "telugu", "tamil", "gujarati", "kannada", 
      "malayalam", "punjabi", "odia", "assamese", "maithili", 
      "santali", "kashmiri", "nepali", "konkani", "sindhi", 
      "dogri", "manipuri", "bodo", "japanese", "french", 
      "german", "spanish"
    ];
          const isLang = langList.some((l) => lowerName.includes(l));
          if (isLang) {
            if (lowerName.includes("hindi")) setLanguageMode("hindi");
            else setLanguageMode("english");
          } else {
            setLanguageMode("both");
          }
        }
      } catch (error) {
        console.error("Failed to fetch exam details:", error);
      }
    };
    if (examId) {
      fetchExamDetails();
    }
  }, [examId]);

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
    ];
    return languages.some((lang) => lowerName.includes(lang));
  };

  const getPrimaryLanguageFromName = (name) => {
    if (!name) return "English";
    const lowerName = name.toLowerCase();

    // Map subject names to their language
    if (lowerName.includes("hindi")) return "Hindi";
    if (lowerName.includes("urdu")) return "Urdu";
    if (lowerName.includes("sanskrit")) return "Sanskrit";
    if (lowerName.includes("bengali")) return "Bengali";
    if (lowerName.includes("marathi")) return "Marathi";
    if (lowerName.includes("telugu")) return "Telugu";
    if (lowerName.includes("tamil")) return "Tamil";
    if (lowerName.includes("gujarati")) return "Gujarati";
    if (lowerName.includes("kannada")) return "Kannada";
    if (lowerName.includes("malayalam")) return "Malayalam";
    if (lowerName.includes("punjabi")) return "Punjabi";
    if (lowerName.includes("odia")) return "Odia";
    if (lowerName.includes("assamese")) return "Assamese";
    if (lowerName.includes("maithili")) return "Maithili";
    if (lowerName.includes("santali")) return "Santali";
    if (lowerName.includes("kashmiri")) return "Kashmiri";
    if (lowerName.includes("nepali")) return "Nepali";
    if (lowerName.includes("konkani")) return "Konkani";
    if (lowerName.includes("sindhi")) return "Sindhi";
    if (lowerName.includes("dogri")) return "Dogri";
    if (lowerName.includes("manipuri")) return "Manipuri";
    if (lowerName.includes("bodo")) return "Bodo";

    return "English"; // Default to English for non-language subjects
  };

  const getPrimaryLanguage = () => getPrimaryLanguageFromName(subjectName);

  const [englishQuestion, setEnglishQuestion] = useState({
    language: getPrimaryLanguage(),
    text: "",
    solution: "",
    options: ["", "", "", ""],
    correct_option: 0,
  });

  const [hindiQuestion, setHindiQuestion] = useState({
    language: "Hindi",
    text: "",
    solution: "",
    options: ["", "", "", ""],
    correct_option: 0,
  });

  const [isTranslating, setIsTranslating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [duplicateError, setDuplicateError] = useState(null);
  const [englishSectionEmpty, setEnglishSectionEmpty] = useState(false);
  const [hindiSectionEmpty, setHindiSectionEmpty] = useState(false);
  // Language mode: "english" | "hindi" | "both"
  // Defaults based on subject type
  const [languageMode, setLanguageMode] = useState(() => {
    return "both"; // will be updated by useEffect once subject is fetched
  });
  const [isLatexEnabled, setIsLatexEnabled] = useState(false); // Added toggle state for LaTeX
  const [eqEditorOpen, setEqEditorOpen] = useState(false);
  const [eqEditorValue, setEqEditorValue] = useState("");
  const [eqEditorTarget, setEqEditorTarget] = useState({
    language: "English",
    field: "text", // "text" | "solution" | "options"
    optionIndex: null,
    originalLatexInfo: null, // {match, inner, wrapperStart, wrapperEnd, index, length}
  });
  const [isFromEquationEditor, setIsFromEquationEditor] = useState(false);
  const insertLatexCommand = (command) => {
    setEqEditorValue((prev) => prev + command);
  };
  const LatexToolbar = () => {
    const toolbarItems = [
      { label: "α", command: "\\alpha " },
      { label: "β", command: "\\beta " },
      { label: "γ", command: "\\gamma " },
      { label: "θ", command: "\\theta " },
      { label: "π", command: "\\pi " },
      { label: "Σ", command: "\\sum " },
      { label: "∫", command: "\\int " },
      { label: "∞", command: "\\infty " },
      { label: "±", command: "\\pm " },
      { label: "≤", command: "\\leq " },
      { label: "≥", command: "\\geq " },
      { label: "≠", command: "\\neq " },
      { label: "→", command: "\\rightarrow " },
      { label: "√", command: "\\sqrt{} ", insert: "\\sqrt{" },
      { label: "x/y", command: "\\frac{}{} ", insert: "\\frac{" },
      { label: "x²", command: "^{} ", insert: "^{" },
      { label: "x₁", command: "_{} ", insert: "_{" },
      { label: "∑ᵢ", command: "\\sum_{i=1}^{n} " },
      { label: "∫ᵃᵇ", command: "\\int_{a}^{b} " },
      { label: "lim", command: "\\lim_{x \\to \\infty} " },
      { label: "sin", command: "\\sin " },
      { label: "cos", command: "\\cos " },
      { label: "tan", command: "\\tan " },
      { label: "log", command: "\\log " },
      { label: "ln", command: "\\ln " },
      { label: "()", command: "\\left( \\right) ", insert: "\\left(" },
      { label: "[]", command: "\\left[ \\right] ", insert: "\\left[" },
      { label: "{}", command: "\\left\\{ \\right\\} ", insert: "\\left\\{" },
    ];

    return (
      <div className="border-b border-gray-200 p-3 bg-gray-50">
        <div className="text-xs font-medium text-gray-700 mb-2">
          LaTeX Toolbar
        </div>
        <div className="grid grid-cols-8 gap-1">
          {toolbarItems.map((item, index) => (
            <button
              key={index}
              onClick={() => insertLatexCommand(item.insert || item.command)}
              className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-blue-100 hover:border-blue-400 transition-colors bg-white"
              title={`Insert ${item.command.trim()}`}
              type="button"
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="mt-2 text-xs text-gray-500">
          Click symbols to insert LaTeX code. You can also type directly in the
          editor.
        </div>
      </div>
    );
  };
  const isLatexToken = (token) => {
    if (!token || typeof token !== "string") return false;
    if (/\$/.test(token)) return true;
    if (/^\\[A-Za-z]+/.test(token)) return true;
    if (/[\\^_{}]/.test(token)) return true;
    return false;
  };
  const extractLatexPlaceholders = (input) => {
    const placeholders = [];
    let idx = 0;
    if (!input) return { textWithPlaceholders: input || "", placeholders };
    const regex =
      /(\$\$[\s\S]*?\$\$|\$[^$]*?\$|\\\[[\s\S]*?\\\]|\\\([\s\S]*?\\\)|\\[a-zA-Z]+(?:\s*\{[^}]*\})+)/g;
    const textWithPlaceholders = input.replace(regex, (match) => {
      const key = `__LATEX_${idx}__`;
      placeholders.push(match);
      idx += 1;
      return key;
    });
    return { textWithPlaceholders, placeholders };
  };

  const restoreLatexPlaceholders = (translatedText, placeholders) => {
    let result = translatedText;
    placeholders.forEach((orig, i) => {
      const key = `__LATEX_${i}__`;
      result = result.split(key).join(orig);
    });
    return result;
  };

  const translatePreservingLatex = async (src) => {
    if (!src || !src.trim()) return src || "";
    
    // Split by newlines to preserve paragraph structure
    const lines = src.split(/(\n+)/);
    
    const translatedLines = await Promise.all(lines.map(async (line) => {
      // If it's just newlines, return as is
      if (/^\n+$/.test(line)) return line;
      if (!line.trim()) return line;

      const regex =
        /(\$\$[\s\S]*?\$\$|\$[^$]*?\$|\\\[[\s\S]*?\\\]|\\\([\s\S]*?\\\)|\\[a-zA-Z]+(?:\s*\{[^}]*\})+)/g;

      const promises = [];
      let lastIndex = 0;
      let match;

      while ((match = regex.exec(line)) !== null) {
        if (match.index > lastIndex) {
          const chunk = line.slice(lastIndex, match.index);
          promises.push(
            translateText(chunk, "English", "Hindi").catch(() => chunk),
          );
        }
        promises.push(Promise.resolve(match[0]));
        lastIndex = regex.lastIndex;
      }
      if (lastIndex < line.length) {
        const tail = line.slice(lastIndex);
        promises.push(translateText(tail, "English", "Hindi").catch(() => tail));
      }

      const parts = await Promise.all(promises);
      return parts.join("");
    }));

    return translatedLines.join("");
  };
  const isEnglishWord = (word) => {
    if (!word || word.trim().length === 0) return false;
    const englishChars = word.match(/[A-Za-z]/g);
    const totalChars = word.replace(/[^A-Za-z0-9]/g, "").length;
    return (
      englishChars && totalChars > 0 && englishChars.length / totalChars > 0.7
    );
  };
  const getLastWord = (text) => {
    const words = text.trim().split(/\s+/);
    return words[words.length - 1];
  };
  const replaceLastWord = (text, newWord) => {
    const words = text.trim().split(/\s+/);
    if (words.length === 0) return newWord;

    words[words.length - 1] = newWord;
    return words.join(" ");
  };
  const looksLikeMath = (text) => {
    if (!text || typeof text !== "string") return false;
    if (/[±√=\^_{}\\]/.test(text)) return true;
    if (/[²³¹⁴⁵⁶⁷⁸⁹⁰]/.test(text)) return true;
    if (/\[[^\]]+\]\s*\/\s*[^\s]+/.test(text)) return true;
    if (/[+\-*\/]=?/.test(text)) return true;
    return false;
  };
  const convertPlainMathToLatex = (input) => {
    if (!input || typeof input !== "string") return input;
    let s = input.trim();
    if (/\$.*\$/.test(s) || /\\\[|\\\(|\\begin\{/.test(s)) return s;

    if (!looksLikeMath(s)) return s; // avoid false positives
    s = s.replace(/±/g, " \\pm ");
    const supMap = {
      "²": "2",
      "³": "3",
      "¹": "1",
      "⁴": "4",
      "⁵": "5",
      "⁶": "6",
      "⁷": "7",
      "⁸": "8",
      "⁹": "9",
      "⁰": "0",
    };
    s = s.replace(/([A-Za-z0-9])([²³¹⁴⁵⁶⁷⁸⁹⁰]+)/g, (m, p1, p2) => {
      const nums = p2
        .split("")
        .map((ch) => supMap[ch] || ch)
        .join("");
      return `${p1}^{${nums}}`;
    });
    s = s.replace(/√\s*\(([^)]+)\)/g, (m, inner) => `\\sqrt{${inner.trim()}}`);
    s = s.replace(
      /\[([^\]]+)\]\s*\/\s*([^\s,;]+)/g,
      (m, num, den) => `\\frac{${num.trim()}}{${den.trim()}}`,
    );
    s = s.replace(
      /\(([^)]+)\)\s*\/\s*([^\s,;]+)/g,
      (m, num, den) => `\\frac{${num.trim()}}{${den.trim()}}`,
    );
    s = s.replace(/\s*([+\-*=\/])\s*/g, " $1 ");
    s = s.replace(/\s{2,}/g, " ").trim();
    return `$${s}$`;
  };
  const handleEnglishFieldBlur = (field, value, optionIndex = null) => {
    if (isFromEquationEditor) {
      setIsFromEquationEditor(false);
      return;
    }

    if (!isLatexEnabled) return; // Only convert if LaTeX is enabled

    const converted = convertPlainMathToLatex(value);
    if (converted !== value) {
      updateEnglishQuestion(field, converted, optionIndex);
    }
  };

  const handleManualTranslate = async () => {
    setIsTranslating(true);

    try {
      if (!englishQuestion.text.trim()) {
        toast.error("Please enter the question text in English first");
        return;
      }
      const translationPromises = [
        translatePreservingLatex(englishQuestion.text),
        englishQuestion.solution.trim()
          ? translatePreservingLatex(englishQuestion.solution)
          : Promise.resolve(""),
        ...englishQuestion.options.map((option) =>
          option.trim()
            ? translatePreservingLatex(option)
            : Promise.resolve(""),
        ),
      ];
      const [translatedText, translatedSolution, ...translatedOptions] =
        await Promise.all(translationPromises);
      setHindiQuestion((prev) => ({
        ...prev,
        text: translatedText || "",
        solution: translatedSolution || "",
        options: translatedOptions.map((opt) => opt || ""),
        correct_option: englishQuestion.correct_option,
      }));

      toast.success("Successfully translated to Hindi (LaTeX preserved)");
    } catch (error) {
      toast.error("Failed to translate content. Please try again.");
    } finally {
      setIsTranslating(false);
    }
  };

  const updateEnglishQuestion = (field, value, optionIndex = null) => {
    setEnglishQuestion((prev) => {
      const updated = { ...prev };
      if (field === "options" && optionIndex !== null) {
        updated.options[optionIndex] = value;
      } else {
        updated[field] = value;
      }
      return updated;
    });
  };

  const updateHindiQuestion = (field, value, optionIndex = null) => {
    setHindiQuestion((prev) => {
      const updated = { ...prev };
      if (field === "options" && optionIndex !== null) {
        updated.options[optionIndex] = value;
      } else {
        updated[field] = value;
      }
      return updated;
    });
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const questionsToSubmit = [];
      const showEnglish = languageMode === "english" || languageMode === "both";
      const showHindi = languageMode === "hindi" || languageMode === "both";

      if (showEnglish) {
        const englishPayload = {
          language: languageMode === "english" ? (englishQuestion.language || "English") : "English",
          text: englishQuestion.text.trim(),
          options: englishQuestion.options.map((opt) => opt.trim()),
          correct_option: englishQuestion.correct_option + 1,
        };
        if (englishQuestion.solution.trim()) {
          englishPayload.solution = englishQuestion.solution.trim();
        }
        questionsToSubmit.push(englishPayload);
      }

      if (showHindi) {
        const hindiPayload = {
          language: "Hindi",
          text: hindiQuestion.text.trim(),
          options: hindiQuestion.options.map((opt) => opt.trim()),
          correct_option: hindiQuestion.correct_option + 1,
        };
        if (hindiQuestion.solution.trim()) {
          hindiPayload.solution = hindiQuestion.solution.trim();
        }
        questionsToSubmit.push(hindiPayload);
      }

      const payload = {
        exam: parseInt(examId),
        questions: questionsToSubmit,
      };

      const response = await createNewQuestion(payload);

      if (response) {
        const msgs = {
          english: "English question added successfully!",
          hindi: "Hindi question added successfully!",
          both: "Questions added in both languages!",
        };
        toast.success(msgs[languageMode]);
        navigate(-1);
      } else {
        throw new Error("Failed to create questions");
      }
    } catch (error) {
      const errorData = error.response?.data;
      if (errorData && typeof errorData === 'object') {
        const msgs = [];
        if (errorData.hindi_errors) msgs.push(`Hindi: ${errorData.hindi_errors}`);
        if (errorData.english_errors) msgs.push(`English: ${errorData.english_errors}`);
        if (errorData.error) msgs.push(errorData.error);
        if (errorData.message) msgs.push(errorData.message);
        if (msgs.length > 0) {
          msgs.forEach(m => toast.error(m));
        } else {
          toast.error("Failed to add questions");
        }
      } else {
        toast.error(error.response?.data?.message || "Failed to add questions");
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  const checkDuplicateContent = () => {
    if (languageMode !== "both") return false;
    if (!englishQuestion.text.trim() || !hindiQuestion.text.trim()) {
      setDuplicateError(null);
      return false;
    }
    if (
      englishQuestion.text.trim().toLowerCase() ===
      hindiQuestion.text.trim().toLowerCase()
    ) {
      setDuplicateError(
        "The English and Hindi question texts are identical. Please make them unique.",
      );
      return true;
    }
    const englishOptions = englishQuestion.options
      .map((o) => o.trim().toLowerCase())
      .filter((o) => o);
    const uniqueEnglishOptions = new Set(englishOptions);
    if (uniqueEnglishOptions.size !== englishOptions.length) {
      setDuplicateError("English options must be unique.");
      return true;
    }
    const hindiOptions = hindiQuestion.options
      .map((o) => o.trim().toLowerCase())
      .filter((o) => o);
    const uniqueHindiOptions = new Set(hindiOptions);
    if (uniqueHindiOptions.size !== hindiOptions.length) {
      setDuplicateError("Hindi options must be unique.");
      return true;
    }
    if (
      englishQuestion.solution.trim() &&
      hindiQuestion.solution.trim() &&
      englishQuestion.solution.trim().toLowerCase() ===
        hindiQuestion.solution.trim().toLowerCase()
    ) {
      setDuplicateError(
        "The solutions are identical in both languages. Please make them unique.",
      );
      return true;
    }
    setDuplicateError(null);
    return false;
  };
  useEffect(() => {
    const duplicateCheckTimer = setTimeout(() => {
      checkDuplicateContent();
    }, 500);

    return () => clearTimeout(duplicateCheckTimer);
  }, [
    englishQuestion.text,
    hindiQuestion.text,
    englishQuestion.options.join(),
    hindiQuestion.options.join(),
    englishQuestion.solution,
    hindiQuestion.solution,
  ]);
  const [fieldErrors, setFieldErrors] = useState({
    english: {
      text: false,
      options: [false, false, false, false],
      solution: false,
    },
    hindi: {
      text: false,
      options: [false, false, false, false],
      solution: false,
    },
  });
  const validateForm = () => {
    if (checkDuplicateContent()) {
      return false;
    }
    const showEnglish = languageMode === "english" || languageMode === "both";
    const showHindi = languageMode === "hindi" || languageMode === "both";
    const newFieldErrors = {
      english: {
        text: false,
        options: [false, false, false, false],
        solution: false,
      },
      hindi: {
        text: false,
        options: [false, false, false, false],
        solution: false,
      },
    };

    let hasError = false;

    // Validate English if shown
    if (showEnglish) {
      if (!englishQuestion.text.trim()) {
        newFieldErrors.english.text = true;
        hasError = true;
      }
      englishQuestion.options.forEach((opt, idx) => {
        if (!opt.trim()) {
          newFieldErrors.english.options[idx] = true;
          hasError = true;
        }
      });
      const englishOptions = englishQuestion.options.map((o) =>
        o.trim().toLowerCase(),
      );
      const uniqueEnglishOptions = new Set(englishOptions);
      if (uniqueEnglishOptions.size !== englishOptions.length) {
        toast.error("English options must be unique.");
        return false;
      }
    }

    // Validate Hindi if shown
    if (showHindi) {
      if (!hindiQuestion.text.trim()) {
        newFieldErrors.hindi.text = true;
        hasError = true;
      }
      hindiQuestion.options.forEach((opt, idx) => {
        if (!opt.trim()) {
          newFieldErrors.hindi.options[idx] = true;
          hasError = true;
        }
      });
      const hindiOptions = hindiQuestion.options.map((o) =>
        o.trim().toLowerCase(),
      );
      const uniqueHindiOptions = new Set(hindiOptions);
      if (uniqueHindiOptions.size !== hindiOptions.length) {
        toast.error("Hindi options must be unique.");
        return false;
      }
    }

    setFieldErrors(newFieldErrors);
    if (hasError) {
      const modeLabel = languageMode === "both" ? "English and Hindi" : languageMode === "english" ? "English" : "Hindi";
      toast.error(`Please complete all required ${modeLabel} fields.`);
      return false;
    }

    return true;
  };

  const handleKeyUp = async (e, field, value, optionIndex = null) => {
    updateEnglishQuestion(field, value, optionIndex);

    if ((e.key === " " || e.key === "Enter") && value.trim()) {
      if (languageMode !== "both") return;
      setIsTranslating(true);
      try {
        const response = await translatePreservingLatex(value);
        if (field === "options" && optionIndex !== null) {
          setHindiQuestion((prev) => {
            const updated = { ...prev };
            updated.options[optionIndex] = response;
            return updated;
          });
        } else {
          setHindiQuestion((prev) => ({
            ...prev,
            [field]: response,
          }));
        }
        toast.success("Translation completed (LaTeX preserved)");
      } catch (error) {
        const errorMsg = error.response?.data?.message || error.message || "Failed to save exam set";
        toast.error(errorMsg);
      } finally {
        setIsTranslating(false);
      }
    }
  };
  const handleHindiKeyUp = async (e, field, value, optionIndex = null) => {
    updateHindiQuestion(field, value, optionIndex);

    if ((e.key === " " || e.key === "Enter") && value.trim()) {
      if (isLanguageSubject()) return;
      
      // Split by whitespace but keep the whitespace segments to preserve them
      const segments = value.split(/(\s+)/);
      let updatedSegments = [...segments];
      let hasTranslation = false;

      setIsTranslating(true);

      try {
        for (let i = 0; i < segments.length; i++) {
          const segment = segments[i];
          // Skip whitespace/empty segments
          if (!segment || !/\S/.test(segment)) continue;
          
          if (isLatexToken(segment)) continue;
          if (isEnglishWord(segment)) {
            try {
              const translated = await translateText(segment, "English", "Hindi");
              updatedSegments[i] = translated;
              hasTranslation = true;
            } catch (error) {}
          }
        }

        if (hasTranslation) {
          const updatedText = updatedSegments.join("");

          if (field === "options" && optionIndex !== null) {
            setHindiQuestion((prev) => {
              const updated = { ...prev };
              updated.options[optionIndex] = updatedText;
              return updated;
            });
          } else {
            setHindiQuestion((prev) => ({
              ...prev,
              [field]: updatedText,
            }));
          }
        }
      } catch (error) {
      } finally {
        setIsTranslating(false);
      }
    }
  };
  const extractFirstLatex = (src) => {
    if (!src || typeof src !== "string") return null;
    const regex =
      /(\$\$[\s\S]*?\$\$|\$[^$]*?\$|\\\[[\s\S]*?\\\]|\\\([\s\S]*?\\\)|\\[a-zA-Z]+(?:\s*\{[^}]*\})+)/g;
    const m = regex.exec(src);
    if (!m) return null;
    const match = m[0];
    const index = m.index;
    const length = match.length;
    if (match.startsWith("$$") && match.endsWith("$$")) {
      return {
        match,
        inner: match.slice(2, -2),
        wrapperStart: "$$",
        wrapperEnd: "$$",
        index,
        length,
      };
    }
    if (match.startsWith("$") && match.endsWith("$")) {
      return {
        match,
        inner: match.slice(1, -1),
        wrapperStart: "$",
        wrapperEnd: "$",
        index,
        length,
      };
    }
    if (match.startsWith("\\[") && match.endsWith("\\]")) {
      return {
        match,
        inner: match.slice(2, -2),
        wrapperStart: "\\[",
        wrapperEnd: "\\]",
        index,
        length,
      };
    }
    if (match.startsWith("\\(") && match.endsWith("\\)")) {
      return {
        match,
        inner: match.slice(2, -2),
        wrapperStart: "\\(",
        wrapperEnd: "\\)",
        index,
        length,
      };
    }
    if (match.startsWith("\\")) {
      return {
        match,
        inner: match,
        wrapperStart: "",
        wrapperEnd: "",
        index,
        length,
      };
    }
    return {
      match,
      inner: match,
      wrapperStart: "",
      wrapperEnd: "",
      index,
      length,
    };
  };
  const openEquationEditor = (
    language,
    field,
    optionIndex = null,
    initialValue = "",
  ) => {
    const latexInfo = extractFirstLatex(initialValue || "");
    setEqEditorTarget({
      language,
      field,
      optionIndex,
      originalLatexInfo: latexInfo,
    });
    if (latexInfo) {
      setEqEditorValue(latexInfo.inner ?? latexInfo.match ?? "");
    } else {
      setEqEditorValue((initialValue || "").trim());
    }
    setEqEditorOpen(true);
  };

  const closeEquationEditor = () => {
    setEqEditorOpen(false);
  };

  const saveEquationToField = (latex) => {
    const val = (latex || "").trim();
    const info = eqEditorTarget.originalLatexInfo;
    const replaceInText = (text) => {
      if (!info) {
        // Preserve all existing whitespace, including newlines, when appending
        const appended = (text || "") + (text && !text.endsWith(" ") && !text.endsWith("\n") ? " " : "") + `$${val}$`;
        return appended;
      }
      const before = text.slice(0, info.index);
      const after = text.slice(info.index + info.length);
      const wrapped = `${info.wrapperStart}${val}${info.wrapperEnd}`;
      return before + wrapped + after;
    };
    setIsFromEquationEditor(true);

    if (eqEditorTarget.language === "English") {
      if (eqEditorTarget.field === "options") {
        const curr = englishQuestion.options[eqEditorTarget.optionIndex] ?? "";
        const updated = replaceInText(curr);
        updateEnglishQuestion("options", updated, eqEditorTarget.optionIndex);
      } else {
        const curr = englishQuestion[eqEditorTarget.field] ?? "";
        const updated = replaceInText(curr);
        updateEnglishQuestion(eqEditorTarget.field, updated);
      }
    } else {
      if (eqEditorTarget.field === "options") {
        const curr = hindiQuestion.options[eqEditorTarget.optionIndex] ?? "";
        const updated = replaceInText(curr);
        updateHindiQuestion("options", updated, eqEditorTarget.optionIndex);
      } else {
        const curr = hindiQuestion[eqEditorTarget.field] ?? "";
        const updated = replaceInText(curr);
        updateHindiQuestion(eqEditorTarget.field, updated);
      }
    }
    setEqEditorOpen(false);
  };
  const isEnglishSectionTrulyEmpty = () => {
    return (
      !englishQuestion.text.trim() &&
      !englishQuestion.options.some((opt) => opt.trim()) &&
      !englishQuestion.solution.trim()
    ); // Fixed: added missing solution check
  };
  const isHindiSectionTrulyEmpty = () => {
    return (
      !hindiQuestion.text.trim() &&
      !hindiQuestion.options.some((opt) => opt.trim()) &&
      !hindiQuestion.solution.trim()
    ); // Fixed: added missing solution check
  };
  useEffect(() => {
    setEnglishSectionEmpty(isEnglishSectionTrulyEmpty());
  }, [englishQuestion]);
  useEffect(() => {
    setHindiSectionEmpty(isHindiSectionTrulyEmpty());
  }, [hindiQuestion]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-blue-50 p-6">
      <div className="max-w-8xl mx-auto">
        <div className="rounded-2xl p-5">
          <button
            onClick={() => navigate(-1)}
            className="mb-6 flex items-center text-gray-600 hover:text-teal-600 transition-colors group"
          >
            <FiArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Questions
          </button>

          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Add New Question
            </h1>
            <div className="bg-teal-100 text-teal-800 px-4 py-2 rounded-lg font-medium">
              Exam ID: {examId}
            </div>
          </div>

          {/* Control Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Translation Controls - Show only when both languages are active */}
            {languageMode === "both" && (
              <div className="bg-gradient-to-r from-blue-50 to-teal-50 p-6 rounded-xl border border-blue-100 h-full">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <FiGlobe className="w-6 h-6 text-teal-600" />
                    <div>
                      <span className="text-lg font-semibold text-gray-800 block">
                        Real-time Word Translation
                      </span>
                      <span className="text-sm text-gray-600">
                        Type English words in Hindi fields - each word translates
                        after Space/Enter
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleManualTranslate}
                    disabled={isTranslating}
                    className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                  >
                    {isTranslating ? (
                      <>
                        <FiLoader className="w-4 h-4 animate-spin" />
                        <span>Translating...</span>
                      </>
                    ) : (
                      <>
                        <FiRefreshCw className="w-4 h-4" />
                        <span>Re-translate All</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* LaTeX Controls */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-xl border border-purple-100 flex items-center justify-between h-full">
              <div className="flex items-center space-x-3">
                <div className="bg-purple-100 p-2 rounded-lg">
                  <span className="text-purple-700 font-bold text-lg">∑x</span>
                </div>
                <div>
                  <span className="text-lg font-semibold text-gray-800 block">
                    LaTeX Editor Controls
                  </span>
                  <span className="text-sm text-gray-600">
                    Use LaTeX for mathematical equations and symbols
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <span className={`text-xs font-bold uppercase tracking-wider ${isLatexEnabled ? "text-purple-600" : "text-gray-400"}`}>
                  {isLatexEnabled ? "ON" : "OFF"}
                </span>
                <button
                  type="button"
                  onClick={() => setIsLatexEnabled(!isLatexEnabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                    isLatexEnabled ? "bg-purple-600" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      isLatexEnabled ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Language Mode Toggle */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-gray-700">Question Language</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Choose which language version(s) to create
                </p>
              </div>
              <div className="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-0.5">
                {[
                  { key: "english", label: "🇺🇸 English Only", color: "blue" },
                  { key: "hindi", label: "🇮🇳 Hindi Only", color: "orange" },
                  { key: "both", label: "Both Languages", color: "teal" },
                ].map(({ key, label, color }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setLanguageMode(key)}
                    className={`px-4 py-2 text-xs font-bold rounded-md transition-all whitespace-nowrap ${
                      languageMode === key
                        ? `bg-${color}-600 text-white shadow-sm`
                        : "text-gray-500 hover:text-gray-700 hover:bg-white"
                    }`}
                    style={
                      languageMode === key
                        ? {
                            backgroundColor:
                              color === "blue" ? "#2563eb" :
                              color === "orange" ? "#ea580c" :
                              "#0d9488",
                            color: "#fff",
                          }
                        : {}
                    }
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Submission Info */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-green-800 text-sm">
              <strong>Important:</strong>{" "}
              {languageMode === "both"
                ? "Both English and Hindi versions will be created. Type English words in Hindi fields and press Space/Enter for instant translation."
                : languageMode === "english"
                ? "Only English question will be created. No Hindi version will be generated."
                : "Only Hindi question will be created. No English version will be generated."}
            </p>
          </div>

          {/* Add error banner for duplicate content */}
          {duplicateError && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6 rounded-md">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">
                    <strong className="font-medium">Error:</strong>{" "}
                    {duplicateError}
                  </p>
                  <p className="text-sm text-red-600 mt-1">
                    English and Hindi versions must be different to validate as
                    a bilingual question set.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Side-by-Side Forms */}
          <div
            className={`grid grid-cols-1 ${languageMode === "both" ? "lg:grid-cols-2" : ""} gap-8`}
          >
            {/* English Form */}
            {(languageMode === "english" || languageMode === "both") && (
            <div className="space-y-6">
              <div className="bg-blue-50 p-4 rounded-xl border-2 border-blue-200">
                <h2 className="text-xl font-bold text-blue-800 mb-4 flex items-center">
                  {languageMode === "english" && isLanguageSubject()
                    ? `${subjectName} Question`
                    : "🇺🇸 English Question"}
                  <span className="text-red-500 ml-1">*</span>
                </h2>

                {/* English Question Text */}
                <div className="space-y-3 mb-6">
                  <label className="block text-sm font-semibold text-gray-800">
                    Question Text <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={englishQuestion.text}
                    onChange={(e) =>
                      updateEnglishQuestion("text", e.target.value)
                    }
                    onKeyUp={(e) => handleKeyUp(e, "text", e.target.value)}
                    onBlur={(e) =>
                      handleEnglishFieldBlur("text", e.target.value)
                    }
                    placeholder={`Enter your question in ${isLanguageSubject() ? subjectName : "English"}...`}
                    className={`w-full p-3 border ${
                      fieldErrors.english.text
                        ? "border-red-500 bg-red-50"
                        : "border-gray-200"
                    } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none`}
                    rows="3"
                    required={!englishSectionEmpty}
                  />
                  {fieldErrors.english.text && (
                    <p className="text-red-500 text-xs mt-1">
                      Question text is required
                    </p>
                  )}
                  {/* Add Equation button next to the textarea */}
                  {isLatexEnabled && (
                    <div className="mt-2">
                      <button
                        type="button"
                        onClick={() =>
                          openEquationEditor(
                            "English",
                            "text",
                            null,
                            englishQuestion.text,
                          )
                        }
                        className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-md hover:bg-blue-200"
                      >
                        Equation
                      </button>
                    </div>
                  )}
                </div>

                {/* English Options */}
                <div className="space-y-4 mb-6">
                  <label className="block text-sm font-semibold text-gray-800">
                    Answer Options <span className="text-red-500">*</span>
                  </label>
                  {englishQuestion.options.map((option, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="flex items-center">
                        <input
                          type="radio"
                          name="english_correct"
                          checked={englishQuestion.correct_option === index}
                          onChange={() => {
                            updateEnglishQuestion("correct_option", index);
                            setHindiQuestion((prev) => ({
                              ...prev,
                              correct_option: index,
                            }));
                          }}
                          className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                        />
                      </div>
                      <div className="flex-1 relative">
                        <input
                          type="text"
                          value={option}
                          onChange={(e) =>
                            updateEnglishQuestion(
                              "options",
                              e.target.value,
                              index,
                            )
                          }
                          onKeyUp={(e) =>
                            handleKeyUp(e, "options", e.target.value, index)
                          }
                          onBlur={(e) =>
                            handleEnglishFieldBlur(
                              "options",
                              e.target.value,
                              index,
                            )
                          }
                          placeholder={`Option ${index + 1}`}
                          className={`w-full p-2 border ${
                            fieldErrors.english.options[index]
                              ? "border-red-500 bg-red-50"
                              : "border-gray-200"
                          } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all pr-10`}
                          required={!englishSectionEmpty}
                        />
                        {fieldErrors.english.options[index] && (
                          <p className="text-red-500 text-xs mt-1">
                            Option {index + 1} is required
                          </p>
                        )}
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs font-medium text-gray-500 bg-gray-100 w-5 h-5 rounded-full flex items-center justify-center">
                          {String.fromCharCode(65 + index)}
                        </div>
                      </div>
                      {isLatexEnabled && (
                        <div className="flex items-center space-x-2">
                          <button
                            type="button"
                            onClick={() =>
                              openEquationEditor(
                                "English",
                                "options",
                                index,
                                englishQuestion.options[index],
                              )
                            }
                            className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded"
                          >
                            Eq
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* English Solution */}
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-800">
                    Solution/Explanation{" "}
                    <span className="text-gray-500">(Optional)</span>
                  </label>
                  <textarea
                    value={englishQuestion.solution}
                    onChange={(e) =>
                      updateEnglishQuestion("solution", e.target.value)
                    }
                    onKeyUp={(e) => handleKeyUp(e, "solution", e.target.value)}
                    onBlur={(e) =>
                      handleEnglishFieldBlur("solution", e.target.value)
                    }
                    placeholder={`Provide detailed explanation in ${isLanguageSubject() ? subjectName : "English"} (optional)...`}
                    className={`w-full p-3 border ${
                      fieldErrors.english.solution
                        ? "border-red-500 bg-red-50"
                        : "border-gray-200"
                    } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none`}
                    rows="3"
                  />
                  {/* Remove error message for solution since it's optional */}
                  {isLatexEnabled && (
                    <div className="mt-2">
                      <button
                        type="button"
                        onClick={() =>
                          openEquationEditor(
                            "English",
                            "solution",
                            null,
                            englishQuestion.solution,
                          )
                        }
                        className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-md hover:bg-blue-200"
                      >
                        Equation
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
            )}

            {/* Hindi Form */}
            {(languageMode === "hindi" || languageMode === "both") && (
              <div className="space-y-6">
                <div className="bg-orange-50 p-4 rounded-xl border-2 border-orange-200">
                  <h2 className="text-xl font-bold text-orange-800 mb-4 flex items-center">
                    🇮🇳 हिंदी प्रश्न (Hindi Question){" "}
                    <span className="text-red-500 ml-1">*</span>
                  </h2>

                  {/* Hindi Question Text */}
                  <div className="space-y-3 mb-6">
                    <label className="block text-sm font-semibold text-gray-800">
                      प्रश्न पाठ (Question Text){" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={hindiQuestion.text}
                      onChange={(e) =>
                        updateHindiQuestion("text", e.target.value)
                      }
                      onKeyUp={(e) =>
                        handleHindiKeyUp(e, "text", e.target.value)
                      }
                      placeholder="हिंदी में टाइप करें या English words टाइप करके हर word के बाद Space दबाएं..."
                      className={`w-full p-3 border ${
                        fieldErrors.hindi.text
                          ? "border-red-500 bg-red-50"
                          : "border-gray-200"
                      } rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all resize-none`}
                      rows="3"
                      required={!hindiSectionEmpty}
                    />
                    {fieldErrors.hindi.text && (
                      <p className="text-red-500 text-xs mt-1">
                        प्रश्न पाठ आवश्यक है
                      </p>
                    )}
                    {isLatexEnabled && (
                      <div className="mt-2">
                        <button
                          type="button"
                          onClick={() =>
                            openEquationEditor(
                              "Hindi",
                              "text",
                              null,
                              hindiQuestion.text,
                            )
                          }
                          className="text-sm bg-orange-100 text-orange-800 px-3 py-1 rounded-md hover:bg-orange-200"
                        >
                          Equation
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Hindi Options */}
                  <div className="space-y-4 mb-6">
                    <label className="block text-sm font-semibold text-gray-800">
                      उत्तर विकल्प (Answer Options){" "}
                      <span className="text-red-500">*</span>
                    </label>
                    {hindiQuestion.options.map((option, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <div className="flex items-center">
                          <input
                            type="radio"
                            name="hindi_correct"
                            checked={hindiQuestion.correct_option === index}
                            onChange={() => {
                              updateHindiQuestion("correct_option", index);
                              setEnglishQuestion((prev) => ({
                                ...prev,
                                correct_option: index,
                              }));
                            }}
                            className="w-4 h-4 text-orange-600 focus:ring-orange-500"
                          />
                        </div>
                        <div className="flex-1 relative">
                          <input
                            type="text"
                            value={option}
                            onChange={(e) =>
                              updateHindiQuestion(
                                "options",
                                e.target.value,
                                index,
                              )
                            }
                            onKeyUp={(e) =>
                              handleHindiKeyUp(
                                e,
                                "options",
                                e.target.value,
                                index,
                              )
                            }
                            placeholder={`विकल्प ${
                              index + 1
                            } (English word + Space for translation)`}
                            className={`w-full p-2 border ${
                              fieldErrors.hindi.options[index]
                                ? "border-red-500 bg-red-50"
                                : "border-gray-200"
                            } rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all pr-10`}
                            required={!hindiSectionEmpty}
                          />
                          {fieldErrors.hindi.options[index] && (
                            <p className="text-red-500 text-xs mt-1">
                              विकल्प {index + 1} आवश्यक है
                            </p>
                          )}
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs font-medium text-gray-500 bg-gray-100 w-5 h-5 rounded-full flex items-center justify-center">
                            {String.fromCharCode(65 + index)}
                          </div>
                        </div>
                        {isLatexEnabled && (
                          <div className="flex items-center space-x-2">
                            <button
                              type="button"
                              onClick={() =>
                                openEquationEditor(
                                  "Hindi",
                                  "options",
                                  index,
                                  hindiQuestion.options[index],
                                )
                              }
                              className="text-xs bg-orange-50 text-orange-700 px-2 py-1 rounded"
                            >
                              Eq
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Hindi Solution */}
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-800">
                      समाधान/स्पष्टीकरण (Solution/Explanation){" "}
                      <span className="text-gray-500">(Optional)</span>
                    </label>
                    <textarea
                      value={hindiQuestion.solution}
                      onChange={(e) =>
                        updateHindiQuestion("solution", e.target.value)
                      }
                      onKeyUp={(e) =>
                        handleHindiKeyUp(e, "solution", e.target.value)
                      }
                      placeholder="हिंदी में solution टाइप करें या English words टाइप करके हर word के बाद Space दबाएं (optional)..."
                      className={`w-full p-3 border ${
                        fieldErrors.hindi.solution
                          ? "border-red-500 bg-red-50"
                          : "border-gray-200"
                      } rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all resize-none`}
                      rows="3"
                    />
                    {/* Remove error message for solution since it's optional */}
                    {isLatexEnabled && (
                      <div className="mt-2">
                        <button
                          type="button"
                          onClick={() =>
                            openEquationEditor(
                              "Hindi",
                              "solution",
                              null,
                              hindiQuestion.solution,
                            )
                          }
                          className="text-sm bg-orange-100 text-orange-800 px-3 py-1 rounded-md hover:bg-orange-200"
                        >
                          Equation
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Question Preview */}
          <div
            className={`mt-8 grid grid-cols-1 ${isLanguageSubject() ? "" : "lg:grid-cols-2"} gap-8`}
          >
            <QuestionPreview
              question={englishQuestion}
              activeLanguage={englishQuestion.language || getPrimaryLanguage()}
            />
            {!isLanguageSubject() && (
              <QuestionPreview
                question={hindiQuestion}
                activeLanguage="Hindi"
              />
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end mt-8">
            <button
              onClick={handleSubmit}
              disabled={
                isSubmitting ||
                (duplicateError !== null && !isLanguageSubject())
              }
              className="w-full sm:w-auto bg-teal-600 text-white py-3 px-8 rounded-xl hover:bg-teal-700 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <FiLoader className="w-4 h-4 animate-spin" />
                  <span>Adding Questions...</span>
                </>
              ) : (
                <>
                  <FiPlus className="w-4 h-4" />
                  <span>Add Questions</span>
                </>
              )}
            </button>
          </div>
          {/* Tooltip explaining why button is disabled */}
          {duplicateError !== null && (
            <div className="mt-2 text-center">
              <p className="text-sm text-red-500">
                Please fix the duplicate content issue before submitting
              </p>
            </div>
          )}

          {/* Equation Editor Modal (lazy loaded) */}
          {eqEditorOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
              <div className="bg-white rounded-lg w-full max-w-4xl p-4 shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold">Equation Editor</h3>
                  <button
                    onClick={closeEquationEditor}
                    className="text-sm text-gray-600 hover:text-gray-900"
                  >
                    Close
                  </button>
                </div>

                {/* Add LaTeX Toolbar */}
                <LatexToolbar />

                <Suspense
                  fallback={<div className="p-4">Loading editor...</div>}
                >
                  <EqErrorBoundary
                    fallbackValue={eqEditorValue}
                    onChange={setEqEditorValue}
                    onSave={() => saveEquationToField(eqEditorValue)}
                    onCancel={closeEquationEditor}
                  >
                    {/* Use value/onChange and provide safe autoCommands / autoOperatorNames */}
                    <EditableMathField
                      latex={eqEditorValue}
                      onChange={(mathField) => {
                        setEqEditorValue(mathField.latex());
                      }}
                      config={{
                        autoCommands:
                          "pi theta sqrt sum prod alpha beta gamma rho frac pm",
                        autoOperatorNames: "sin cos tan log ln exp",
                      }}
                      style={{
                        minHeight: 40,
                        border: "1px solid gray",
                        padding: "10px",
                      }}
                    />
                  </EqErrorBoundary>
                </Suspense>

                {/* Alternative: Manual LaTeX Input */}
                <div className="mt-4 border-t border-gray-200 pt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Manual LaTeX Input (if visual editor doesn't work)
                  </label>
                  <textarea
                    value={eqEditorValue}
                    onChange={(e) => setEqEditorValue(e.target.value)}
                    rows={3}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                    placeholder="Type LaTeX here, e.g., \frac{a}{b}, x^{2}, \sqrt{x}"
                  />
                </div>

                <div className="mt-4 flex justify-end space-x-2">
                  <button
                    onClick={() => saveEquationToField(eqEditorValue)}
                    className="bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700"
                  >
                    Save
                  </button>
                  <button
                    onClick={closeEquationEditor}
                    className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </div>
  );
};

export default QuestionForm;
