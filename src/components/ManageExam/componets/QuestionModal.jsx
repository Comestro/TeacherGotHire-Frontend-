import React, { useState, useEffect, lazy, Suspense } from "react";
import { FiX, FiGlobe, FiRefreshCw, FiLoader } from "react-icons/fi";
import { translateText } from "../../../services/apiService";
import { toast } from "react-toastify";
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
    if (!this.state.hasError) return this.props.children;

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

const QuestionModal = ({
  isOpen,
  onClose,
  onSubmit,
  examId,
  editingQuestion,
}) => {
  const [subjectName, setSubjectName] = useState("");

  const getPrimaryLanguage = () => {
    if (!subjectName) return "English";
    const lowerName = subjectName.toLowerCase();

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

  const isLanguageSubject = () => {
    if (!subjectName) return false;
    const lowerName = subjectName.toLowerCase();
    const languages = [
      "english", "hindi", "urdu", "sanskrit", "bengali", 
      "marathi", "telugu", "tamil", "gujarati", "kannada", 
      "malayalam", "punjabi", "odia", "assamese", "maithili", 
      "santali", "kashmiri", "nepali", "konkani", "sindhi", 
      "dogri", "manipuri", "bodo", "japanese", "french", 
      "german", "spanish"
    ];
    return languages.some((lang) => lowerName.includes(lang));
  };

  const [englishQuestion, setEnglishQuestion] = useState({
    language: "English",
    text: "",
    solution: "",
    options: ["", "", "", ""],
    correct_option: null,
  });

  const [hindiQuestion, setHindiQuestion] = useState({
    language: "Hindi",
    text: "",
    solution: "",
    options: ["", "", "", ""],
    correct_option: null,
  });

  const [isTranslating, setIsTranslating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [textErrors, setTextErrors] = useState({
    english: false,
    hindi: false,
  });
  const [hindiSectionEmpty, setHindiSectionEmpty] = useState(false);
  // Language mode: "english" | "hindi" | "both"
  const [languageMode, setLanguageMode] = useState("both");
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

  const [duplicateError, setDuplicateError] = useState(null);

  useEffect(() => {
    const fetchExamDetails = async () => {
      try {
        const { getExamById } =
          await import("../../../services/adminManageExam");
        const response = await getExamById(examId);
        if (response && response.subject && response.subject.subject_name) {
          const name = response.subject.subject_name;
          setSubjectName(name);
          // Set default language mode based on subject
          const lowerName = name.toLowerCase();
          const langList = ["english","hindi","urdu","sanskrit","bengali","marathi","telugu","tamil","gujarati","kannada","malayalam","punjabi","odia","assamese","maithili","santali","kashmiri","nepali","konkani","sindhi","dogri","manipuri","bodo","japanese","french","german","spanish"];
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

  useEffect(() => {
    const checkDuplicates = () => {
      if (languageMode !== "both") {
        setDuplicateError(null);
        return;
      }

      if (!editingQuestion || editingQuestion.language === "English") {
        const englishOptions = englishQuestion.options
          .map((o) => o.trim().toLowerCase())
          .filter((o) => o);
        const uniqueEnglishOptions = new Set(englishOptions);
        if (uniqueEnglishOptions.size !== englishOptions.length) {
          setDuplicateError("English options must be unique.");
          return;
        }
      }
      if (!editingQuestion || editingQuestion.language === "Hindi") {
        const hindiOptions = hindiQuestion.options
          .map((o) => o.trim().toLowerCase())
          .filter((o) => o);
        const uniqueHindiOptions = new Set(hindiOptions);
        if (uniqueHindiOptions.size !== hindiOptions.length) {
          setDuplicateError("Hindi options must be unique.");
          return;
        }
      }
      if (!editingQuestion) {
        if (
          englishQuestion.text.trim() &&
          hindiQuestion.text.trim() &&
          englishQuestion.text.trim().toLowerCase() ===
            hindiQuestion.text.trim().toLowerCase()
        ) {
          setDuplicateError(
            "The English and Hindi question texts are identical.",
          );
          return;
        }

        if (
          englishQuestion.solution.trim() &&
          hindiQuestion.solution.trim() &&
          englishQuestion.solution.trim().toLowerCase() ===
            hindiQuestion.solution.trim().toLowerCase()
        ) {
          setDuplicateError("The solutions are identical in both languages.");
          return;
        }
      }

      setDuplicateError(null);
    };

    const timer = setTimeout(checkDuplicates, 300);
    return () => clearTimeout(timer);
  }, [englishQuestion, hindiQuestion, editingQuestion]);
  const [eqEditorOpen, setEqEditorOpen] = useState(false);
  const [eqEditorValue, setEqEditorValue] = useState("");
  const [eqModalKey, setEqModalKey] = useState(0);
  const [eqEditorTarget, setEqEditorTarget] = useState({
    language: "English",
    field: "text", // "text" | "solution" | "options"
    optionIndex: null,
    originalLatexInfo: null, // {match, inner, wrapperStart, wrapperEnd, index, length}
  });
  useEffect(() => {
    if (editingQuestion) {
      // Auto-set toggle to match the question being edited
      if (editingQuestion.language === "Hindi") {
        setLanguageMode("hindi");
      } else if (editingQuestion.language === "English") {
        setLanguageMode("english");
      } else {
        setLanguageMode("english"); // fallback
      }

      const findCorrespondingHindiQuestion = async () => {
        try {
          // If it's a language subject, we don't need to look for a "Hindi" version pair in the traditional sense
          // We just load the question as is into the primary slot.
          if (isLanguageSubject()) {
            setEnglishQuestion({
              language: editingQuestion.language || getPrimaryLanguage(),
              text: editingQuestion.text || "",
              solution: editingQuestion.solution || "",
              options: editingQuestion.options?.length
                ? [...editingQuestion.options]
                : ["", "", "", ""],
              correct_option: editingQuestion.correct_option
                ? parseInt(editingQuestion.correct_option) - 1
                : null,
            });
            // Clear secondary question
            setHindiQuestion({
              language: "Hindi",
              text: "",
              solution: "",
              options: ["", "", "", ""],
              correct_option: null,
            });
            return;
          }

          if (editingQuestion.language === "English") {
            setEnglishQuestion({
              language: "English",
              text: editingQuestion.text || "",
              solution: editingQuestion.solution || "",
              options: editingQuestion.options?.length
                ? [...editingQuestion.options]
                : ["", "", "", ""],
              correct_option: editingQuestion.correct_option
                ? parseInt(editingQuestion.correct_option) - 1
                : null,
            });
            setHindiQuestion({
              language: "Hindi",
              text: "",
              solution: "",
              options: ["", "", "", ""],
              correct_option: editingQuestion.correct_option
                ? parseInt(editingQuestion.correct_option) - 1
                : null,
            });
          } else if (editingQuestion.language === "Hindi") {
            setHindiQuestion({
              language: "Hindi",
              text: editingQuestion.text || "",
              solution: editingQuestion.solution || "",
              options: editingQuestion.options?.length
                ? [...editingQuestion.options]
                : ["", "", "", ""],
              correct_option: editingQuestion.correct_option
                ? parseInt(editingQuestion.correct_option) - 1
                : null,
            });
            setEnglishQuestion({
              language: "English",
              text: "",
              solution: "",
              options: ["", "", "", ""],
              correct_option: editingQuestion.correct_option
                ? parseInt(editingQuestion.correct_option) - 1
                : null,
            });
          }
        } catch (error) {}
      };

      findCorrespondingHindiQuestion();
    } else {
      // Reset to default based on subject type when creating new
      const lowerName = (subjectName || "").toLowerCase();
      const langList = ["english","hindi","urdu","sanskrit","bengali","marathi","telugu","tamil","gujarati","kannada","malayalam","punjabi","odia","assamese","maithili","santali","kashmiri","nepali","konkani","sindhi","dogri","manipuri","bodo","japanese","french","german","spanish"];
      const isLang = langList.some((l) => lowerName.includes(l));
      if (isLang) {
        setLanguageMode(lowerName.includes("hindi") ? "hindi" : "english");
      } else {
        setLanguageMode("both");
      }

      setEnglishQuestion({
        language: getPrimaryLanguage(),
        text: "",
        solution: "",
        options: ["", "", "", ""],
        correct_option: null,
      });
    }
  }, [editingQuestion, subjectName]);
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
  const isLatexToken = (token) => {
    if (!token || typeof token !== "string") return false;
    if (/\$/.test(token)) return true;
    if (/^\\[A-Za-z]+/.test(token)) return true;
    if (/[\\^_{}]/.test(token)) return true;
    return false;
  };
  const translatePreservingLatex = async (src) => {
    if (!src || !src.trim()) return "";
    const regex =
      /(\$\$[\s\S]*?\$\$|\$[^$]*?\$|\\\[[\s\S]*?\\\]|\\\([\s\S]*?\\\)|\\[a-zA-Z]+(?:\s*\{[^}]*\})+)/g;

    const promises = [];
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(src)) !== null) {
      if (match.index > lastIndex) {
        const chunk = src.slice(lastIndex, match.index);
        promises.push(
          translateText(chunk, "English", "Hindi").catch(() => chunk),
        );
      }
      promises.push(Promise.resolve(match[0])); // preserve LaTeX
      lastIndex = regex.lastIndex;
    }

    if (lastIndex < src.length) {
      const tail = src.slice(lastIndex);
      promises.push(translateText(tail, "English", "Hindi").catch(() => tail));
    }

    const parts = await Promise.all(promises);
    return parts.join("");
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
  const canSubmitForm = () => {
    if (editingQuestion) {
      if (editingQuestion.language === "English") {
        return (
          englishQuestion.text.trim() &&
          englishQuestion.options.every((opt) => opt.trim()) &&
          englishQuestion.correct_option !== null
        );
      } else {
        return (
          hindiQuestion.text.trim() &&
          hindiQuestion.options.every((opt) => opt.trim()) &&
          hindiQuestion.correct_option !== null
        );
      }
    }
    const isEnglishComplete =
      englishQuestion.text.trim() &&
      englishQuestion.options.every((opt) => opt.trim()) &&
      englishQuestion.correct_option !== null;

    const isHindiComplete =
      hindiQuestion.text.trim() &&
      hindiQuestion.options.every((opt) => opt.trim()) &&
      hindiQuestion.correct_option !== null;
    return isEnglishComplete && isHindiComplete;
  };
  const validateForm = () => {
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
    const newTextErrors = { english: false, hindi: false };
    let hasError = false;

    if (editingQuestion) {
      // When editing, validate only the question being edited
      const isEditingEnglish =
        editingQuestion.language === "English" || languageMode === "english";
      const questionToValidate = isEditingEnglish
        ? englishQuestion
        : hindiQuestion;
      const errorField = isEditingEnglish
        ? newFieldErrors.english
        : newFieldErrors.hindi;
      const langLabel = isEditingEnglish ? "English" : "Hindi";

      if (!questionToValidate.text.trim()) {
        if (isEditingEnglish) {
          newTextErrors.english = true;
        } else {
          newTextErrors.hindi = true;
        }
        errorField.text = true;
        toast.error(`Question text in ${langLabel} is required`);
        hasError = true;
      }
      questionToValidate.options.forEach((option, idx) => {
        if (!option.trim()) {
          errorField.options[idx] = true;
          hasError = true;
        }
      });
      if (errorField.options.some((err) => err)) {
        toast.error(`All options in ${langLabel} are required`);
      }
      if (questionToValidate.correct_option === null) {
        toast.error(`Please select a correct option for ${langLabel}`);
        hasError = true;
      } else {
        const correctOptionText =
          questionToValidate.options[questionToValidate.correct_option];
        if (!correctOptionText || !correctOptionText.trim()) {
          errorField.options[questionToValidate.correct_option] = true;
          toast.error(
            `The selected correct answer for ${langLabel} cannot be empty`,
          );
          hasError = true;
        }
      }

      setFieldErrors(newFieldErrors);
      setTextErrors(newTextErrors);
      return !hasError;
    }

    // New Question Validation — based on languageMode
    if (showEnglish) {
      if (!englishQuestion.text.trim()) {
        newTextErrors.english = true;
        newFieldErrors.english.text = true;
        toast.error("Question text in English is required");
        hasError = true;
      }
      englishQuestion.options.forEach((option, idx) => {
        if (!option.trim()) {
          newFieldErrors.english.options[idx] = true;
          hasError = true;
        }
      });
      if (newFieldErrors.english.options.some((err) => err)) {
        toast.error("All options in English are required");
      }
      if (englishQuestion.correct_option === null) {
        toast.error("Please select a correct option for English");
        hasError = true;
      } else if (!englishQuestion.options[englishQuestion.correct_option]?.trim()) {
        newFieldErrors.english.options[englishQuestion.correct_option] = true;
        toast.error("The selected correct answer for English cannot be empty");
        hasError = true;
      }
    }

    if (showHindi) {
      if (!hindiQuestion.text.trim()) {
        newTextErrors.hindi = true;
        newFieldErrors.hindi.text = true;
        toast.error("Question text in Hindi is required");
        hasError = true;
      }
      hindiQuestion.options.forEach((option, idx) => {
        if (!option.trim()) {
          newFieldErrors.hindi.options[idx] = true;
          hasError = true;
        }
      });
      if (newFieldErrors.hindi.options.some((err) => err)) {
        toast.error("All options in Hindi are required");
      }
      if (hindiQuestion.correct_option === null) {
        toast.error("Please select a correct option for Hindi");
        hasError = true;
      } else if (!hindiQuestion.options[hindiQuestion.correct_option]?.trim()) {
        newFieldErrors.hindi.options[hindiQuestion.correct_option] = true;
        toast.error("The selected correct answer for Hindi cannot be empty");
        hasError = true;
      }
    }

    setFieldErrors(newFieldErrors);
    setTextErrors(newTextErrors);
    return !hasError;
  };
  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const showEnglish = languageMode === "english" || languageMode === "both";
      const showHindi = languageMode === "hindi" || languageMode === "both";

      let formData = {};

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
        formData.english = englishPayload;
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
        formData.hindi = hindiPayload;
      }

      await onSubmit(formData);
    } catch (error) {
      toast.error("Failed to save question");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyUp = async (e, field, value, optionIndex = null) => {
    updateEnglishQuestion(field, value, optionIndex);

    if ((e.key === " " || e.key === "Enter") && value.trim()) {
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
      } catch (error) {
      } finally {
        setIsTranslating(false);
      }
    }
  };
  const handleHindiKeyUp = async (e, field, value, optionIndex = null) => {
    updateHindiQuestion(field, value, optionIndex);

    if ((e.key === " " || e.key === "Enter") && value.trim()) {
      const words = value.trim().split(/\s+/);
      let updatedWords = [...words];
      let hasTranslation = false;

      setIsTranslating(true);

      try {
        for (let i = 0; i < words.length; i++) {
          const word = words[i];
          if (isLatexToken(word)) continue;
          if (isEnglishWord(word)) {
            try {
              const translated = await translateText(word, "English", "Hindi");
              updatedWords[i] = translated;
              hasTranslation = true;
            } catch (error) {}
          }
        }

        if (hasTranslation) {
          const updatedText = updatedWords.join(" ");
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
    setEqModalKey((k) => k + 1);
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
        const appended = (text.trim() ? text + " " : "") + `$${val}$`;
        return appended;
      }
      const before = text.slice(0, info.index);
      const after = text.slice(info.index + info.length);
      const wrapped = `${info.wrapperStart}${val}${info.wrapperEnd}`;
      return before + wrapped + after;
    };

    if (eqEditorTarget.language === "English" || languageMode === "english") {
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
  const extractFirstLatex = (src) => {
    if (!src || typeof src !== "string") return null;
    const regex =
      /(\$\$[\s\S]*?\$\$|\$[^$]*?\$|\\\[[\s\S]*?\\\]|\\\([\s\S]*?\\\]|\\[a-zA-Z]+(?:\s*\{[^}]*\})+)/g;
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-7xl w-full max-h-[95vh] overflow-hidden flex flex-col border border-gray-200">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 shrink-0">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            {editingQuestion ? "Edit Question" : "Add New Question"}
            {editingQuestion && (
              <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                {editingQuestion.language}
              </span>
            )}
          </h2>
          <div className="flex items-center gap-3">
            {isTranslating && (
              <span className="flex items-center gap-1.5 px-2 py-1 bg-teal-50 text-teal-600 rounded-lg text-[10px] font-bold uppercase tracking-wider animate-pulse border border-teal-100">
                <FiRefreshCw className="animate-spin" />
                Translating...
              </span>
            )}
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors text-gray-400 hover:text-gray-600"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          {/* Translation Controls — only when both languages active */}
          {languageMode === "both" && (
            <div className="bg-gradient-to-r from-blue-50 to-teal-50 p-3 sm:p-4 rounded-xl border border-blue-100 mb-4 sm:mb-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-start sm:items-center gap-3">
                  <FiGlobe className="w-5 h-5 text-teal-600 mt-0.5 sm:mt-0" />
                  <div>
                    <span className="text-sm font-semibold text-gray-800 block">
                      Real-time Word Translation
                    </span>
                    <span className="text-[11px] text-gray-600">
                      Type English words in Hindi fields - each word translates
                      after Space/Enter
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleManualTranslate}
                  disabled={
                    isTranslating ||
                    (editingQuestion && editingQuestion.language === "Hindi")
                  }
                  className="bg-teal-600 text-white px-3 py-1.5 rounded-lg hover:bg-teal-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all flex items-center gap-2 text-xs font-bold uppercase tracking-wider shadow-sm w-full sm:w-auto justify-center"
                >
                  {isTranslating ? (
                    <>
                      <FiLoader className="w-3.5 h-3.5 animate-spin" />
                      <span>Translating...</span>
                    </>
                  ) : (
                    <>
                      <FiRefreshCw className="w-3.5 h-3.5" />
                      <span>Re-translate All</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Language Mode Toggle */}
            <div className="bg-white border border-gray-200 rounded-xl p-3 mb-4 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <h3 className="text-xs font-bold text-gray-700">Question Language</h3>
                  <p className="text-[10px] text-gray-500">
                    {editingQuestion ? "Choose which language to edit" : "Choose which version(s) to create"}
                  </p>
                </div>
                <div className="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-0.5">
                  {[
                    { key: "english", label: "🇺🇸 English", color: "#2563eb" },
                    { key: "hindi", label: "🇮🇳 Hindi", color: "#ea580c" },
                    { key: "both", label: "Both", color: "#0d9488" },
                  ].map(({ key, label, color }) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setLanguageMode(key)}
                      className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all whitespace-nowrap ${
                        languageMode === key
                          ? "text-white shadow-sm"
                          : "text-gray-500 hover:text-gray-700 hover:bg-white"
                      }`}
                      style={
                        languageMode === key
                          ? { backgroundColor: color, color: "#fff" }
                          : {}
                      }
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

          {/* Duplicate Error Banner */}
          {duplicateError && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6 rounded-md">
              <div className="flex">
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
                </div>
              </div>
            </div>
          )}

          {/* Side-by-Side Forms */}
          <div
            className={`grid grid-cols-1 ${languageMode === "both" ? "lg:grid-cols-2" : ""} gap-6 sm:gap-8`}
          >
            {/* English Form */}
            {(languageMode === "english" || languageMode === "both") && (
            <div className="space-y-6">
              <div
                className={`bg-blue-50 p-4 rounded-xl border-2 ${
                  editingQuestion && editingQuestion.language === "Hindi"
                    ? "border-gray-200 opacity-60"
                    : "border-blue-200"
                }`}
              >
                <h2 className="text-lg sm:text-xl font-bold text-blue-800 mb-4 flex items-center">
                  <span className="mr-2 text-xl">
                    {englishQuestion.language === "English" ? "🇺🇸" : "📝"}
                  </span>
                  {getPrimaryLanguage()} Question{" "}
                  {!editingQuestion && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                  {editingQuestion &&
                    editingQuestion.language === "Hindi" &&
                    languageMode === "both" && (
                      <span className="ml-2 text-xs sm:text-sm font-normal text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
                        View Only
                      </span>
                    )}
                </h2>

                {/* English Question Text */}
                <div className="space-y-3 mb-6">
                  <label className="block text-sm font-medium text-gray-800">
                    Question Text <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={englishQuestion.text}
                    onChange={(e) =>
                      updateEnglishQuestion("text", e.target.value)
                    }
                    onKeyUp={(e) => handleKeyUp(e, "text", e.target.value)}
                    placeholder="Enter your question in English..."
                    className={`w-full p-3 border ${
                      fieldErrors.english.text || textErrors.english
                        ? "border-red-500 bg-red-50"
                        : "border-gray-200"
                    } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none`}
                    rows="3"
                    disabled={
                      editingQuestion && editingQuestion.language === "Hindi"
                    }
                    required={
                      !editingQuestion || editingQuestion.language === "English"
                    }
                  />
                  {(textErrors.english || fieldErrors.english.text) && (
                    <p className="text-red-500 text-xs mt-1">
                      Question text is required
                    </p>
                  )}
                </div>
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

                {/* English Options */}
                <div className="space-y-3 mb-6">
                  <label className="block text-sm font-medium text-gray-800">
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
                            if (
                              !editingQuestion ||
                              editingQuestion.language === "English"
                            ) {
                              setHindiQuestion((prev) => ({
                                ...prev,
                                correct_option: index,
                              }));
                            }
                          }}
                          className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                          disabled={
                            editingQuestion &&
                            editingQuestion.language === "Hindi"
                          }
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
                          placeholder={`Option ${index + 1}`}
                          className={`w-full p-2 border ${
                            fieldErrors.english.options[index]
                              ? "border-red-500 bg-red-50"
                              : "border-gray-200"
                          } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all pr-10`}
                          disabled={
                            editingQuestion &&
                            editingQuestion.language === "Hindi"
                          }
                          required={
                            !editingQuestion ||
                            editingQuestion.language === "English"
                          }
                        />
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs font-medium text-gray-500 bg-gray-100 w-5 h-5 rounded-full flex items-center justify-center">
                          {String.fromCharCode(65 + index)}
                        </div>
                      </div>
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
                    </div>
                  ))}
                </div>

                {/* English Solution - update to show it's optional */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-800">
                    Solution/Explanation{" "}
                    <span className="text-gray-500">(Optional)</span>
                  </label>
                  <textarea
                    value={englishQuestion.solution}
                    onChange={(e) =>
                      updateEnglishQuestion("solution", e.target.value)
                    }
                    onKeyUp={(e) => handleKeyUp(e, "solution", e.target.value)}
                    placeholder="Provide detailed explanation in English (optional)..."
                    className={`w-full p-3 border ${
                      fieldErrors.english.solution
                        ? "border-red-500 bg-red-50"
                        : "border-gray-200"
                    } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none`}
                    rows="3"
                    disabled={
                      editingQuestion && editingQuestion.language === "Hindi"
                    }
                  />
                </div>
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
              </div>
            </div>

            )}

            {/* Hindi Form */}
            {(languageMode === "hindi" || languageMode === "both") && (
              <div className="space-y-6">
                <div
                  className={`bg-orange-50 p-4 rounded-xl border-2 ${
                    (editingQuestion &&
                      editingQuestion.language === "English") ||
                    hindiSectionEmpty
                      ? "border-gray-200 opacity-60"
                      : "border-orange-200"
                  }`}
                >
                  <h2 className="text-lg sm:text-xl font-bold text-orange-800 mb-4 flex items-center">
                    🇮🇳 हिंदी प्रश्न (Hindi Question){" "}
                    {!editingQuestion && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                    {editingQuestion &&
                      editingQuestion.language === "English" && (
                        <span className="ml-2 text-xs sm:text-sm font-normal text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full">
                          View Only
                        </span>
                      )}
                    {!editingQuestion && hindiSectionEmpty && (
                      <span className="ml-2 text-xs sm:text-sm font-normal text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full">
                        Empty Section
                      </span>
                    )}
                  </h2>

                  {/* Hindi Question Text */}
                  <div className="space-y-3 mb-6">
                    <label className="block text-sm font-medium text-gray-800">
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
                        fieldErrors.hindi.text || textErrors.hindi
                          ? "border-red-500 bg-red-50"
                          : "border-gray-200"
                      } rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all resize-none`}
                      rows="3"
                      disabled={
                        editingQuestion &&
                        editingQuestion.language === "English"
                      }
                      required={
                        !editingQuestion || editingQuestion.language === "Hindi"
                      }
                    />
                    {(textErrors.hindi || fieldErrors.hindi.text) && (
                      <p className="text-red-500 text-xs mt-1">
                        प्रश्न पाठ आवश्यक है
                      </p>
                    )}
                  </div>
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

                  {/* Hindi Options */}
                  <div className="space-y-3 mb-6">
                    <label className="block text-sm font-medium text-gray-800">
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
                              if (
                                !editingQuestion ||
                                editingQuestion.language === "Hindi"
                              ) {
                                setEnglishQuestion((prev) => ({
                                  ...prev,
                                  correct_option: index,
                                }));
                              }
                            }}
                            className="w-4 h-4 text-orange-600 focus:ring-orange-500"
                            disabled={
                              editingQuestion &&
                              editingQuestion.language === "English"
                            }
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
                            disabled={
                              editingQuestion &&
                              editingQuestion.language === "English"
                            }
                            required={
                              !editingQuestion ||
                              editingQuestion.language === "Hindi"
                            }
                          />
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs font-medium text-gray-500 bg-gray-100 w-5 h-5 rounded-full flex items-center justify-center">
                            {String.fromCharCode(65 + index)}
                          </div>
                        </div>
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
                      </div>
                    ))}
                  </div>

                  {/* Hindi Solution - update to show it's optional */}
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-800">
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
                      disabled={
                        editingQuestion &&
                        editingQuestion.language === "English"
                      }
                    />
                  </div>
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
                </div>
              </div>
            )}
          </div>

          {/* Question Preview */}
          <div
            className={`mt-8 grid grid-cols-1 ${languageMode === "both" ? "lg:grid-cols-2" : ""} gap-8`}
          >
            <QuestionPreview
              question={englishQuestion}
              activeLanguage={englishQuestion.language || getPrimaryLanguage()}
            />
            {(languageMode === "hindi" || languageMode === "both") && (
              <QuestionPreview
                question={hindiQuestion}
                activeLanguage="Hindi"
              />
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end mt-6 sm:mt-8 gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 sm:px-6 sm:py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={
                isSubmitting || !canSubmitForm() || duplicateError !== null
              }
              className="px-4 py-2 sm:px-6 sm:py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-75 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <FiLoader className="w-4 h-4 sm:w-5 sm:h-5 animate-spin mr-2" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>
                  {editingQuestion ? "Update Question" : "Add Question"}
                </span>
              )}
            </button>
          </div>
          {/* Error message when form cannot be submitted - Updated message */}
          {!isSubmitting && !canSubmitForm() && !editingQuestion && (
            <div className="mt-2 text-center">
              <p className="text-sm text-red-500">
                Please complete both English and Hindi questions with all
                required fields
              </p>
            </div>
          )}
        </div>
      </div>

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

            <LatexToolbar />

            <Suspense fallback={<div className="p-4">Loading editor...</div>}>
              <EqErrorBoundary
                key={`eqb-${eqModalKey}`}
                fallbackValue={eqEditorValue}
                onChange={setEqEditorValue}
                onSave={() => saveEquationToField(eqEditorValue)}
                onCancel={closeEquationEditor}
              >
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
  );
};

export default QuestionModal;
