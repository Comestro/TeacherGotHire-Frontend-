import React, { useEffect, useState, lazy, Suspense } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiGlobe,
  FiPlus,
  FiLoader,
  FiRefreshCw,
} from "react-icons/fi";
import { toast } from "react-toastify";
import { translateText } from "../../../services/apiService";
import { createNewQuestion } from "../../../services/adminManageExam";
import QuestionPreview from "./QuestionPreview";

// Lazy-load equation editor to avoid runtime errors until package is installed
const EquationEditor = lazy(() => import("equation-editor-react"));

// New: small error boundary to isolate editor failures and provide editable fallback
class EqErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(err, info) {
    console.error("EquationEditor error:", err, info);
  }
  render() {
    // When no error, render children (the real editor)
    if (!this.state.hasError) {
      return this.props.children;
    }

    // Fallback UI: editable textarea using props passed from parent
    // Props expected: fallbackValue, onChange (setter), onSave, onCancel
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

  const [englishQuestion, setEnglishQuestion] = useState({
    language: "English",
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

  // New: equation editor modal state
  const [eqEditorOpen, setEqEditorOpen] = useState(false);
  const [eqEditorValue, setEqEditorValue] = useState("");
  const [eqEditorTarget, setEqEditorTarget] = useState({
    language: "English",
    field: "text", // "text" | "solution" | "options"
    optionIndex: null,
  });

  // Helper: detect LaTeX-like tokens (dollars, backslash commands, braces, caret, underscore)
  const isLatexToken = (token) => {
    if (!token || typeof token !== "string") return false;
    // contains dollar delimiters
    if (/\$/.test(token)) return true;
    // starts with a backslash command like \frac or \alpha
    if (/^\\[A-Za-z]+/.test(token)) return true;
    // contains common TeX characters which translators may mangle
    if (/[\\^_{}]/.test(token)) return true;
    return false;
  };

  // Extract LaTeX fragments and replace with placeholders before sending to translator
  const extractLatexPlaceholders = (input) => {
    const placeholders = [];
    let idx = 0;
    if (!input) return { textWithPlaceholders: input || "", placeholders };
    // match display math $$...$$, inline $...$, \[...\], \(...\),
    // or backslash-commands with one-or-more {...} groups (e.g. \cfrac{...}{...})
    const regex = /(\$\$[\s\S]*?\$\$|\$[^$]*?\$|\\\[[\s\S]*?\\\]|\\\([\s\S]*?\\\)|\\[a-zA-Z]+(?:\s*\{[^}]*\})+)/g;
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
    if (!src || !src.trim()) return "";
    // Split into LaTeX and non-LaTeX segments using the same regex as extractor.
    // Translate only the non-LaTeX segments and keep LaTeX segments unchanged.
    const regex = /(\$\$[\s\S]*?\$\$|\$[^$]*?\$|\\\[[\s\S]*?\\\]|\\\([\s\S]*?\\\)|\\[a-zA-Z]+(?:\s*\{[^}]*\})+)/g;

    const promises = [];
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(src)) !== null) {
      // non-latex chunk before this match
      if (match.index > lastIndex) {
        const chunk = src.slice(lastIndex, match.index);
        // translate the non-latex chunk; fall back to original chunk on error
        promises.push(
          translateText(chunk, "English", "Hindi").catch(() => chunk)
        );
      }
      // latex chunk: preserve as-is
      promises.push(Promise.resolve(match[0]));
      lastIndex = regex.lastIndex;
    }

    // tail chunk after last match
    if (lastIndex < src.length) {
      const tail = src.slice(lastIndex);
      promises.push(
        translateText(tail, "English", "Hindi").catch(() => tail)
      );
    }

    const parts = await Promise.all(promises);
    return parts.join("");
  };

  // Function to detect if a word is in English
  const isEnglishWord = (word) => {
    if (!word || word.trim().length === 0) return false;

    // Check if word contains primarily English characters
    const englishChars = word.match(/[A-Za-z]/g);
    const totalChars = word.replace(/[^A-Za-z0-9]/g, "").length;

    // If more than 70% of alphanumeric characters are English letters, consider it English
    return (
      englishChars && totalChars > 0 && englishChars.length / totalChars > 0.7
    );
  };

  // Function to get the last word from text
  const getLastWord = (text) => {
    const words = text.trim().split(/\s+/);
    return words[words.length - 1];
  };

  // Function to replace last word in text
  const replaceLastWord = (text, newWord) => {
    const words = text.trim().split(/\s+/);
    if (words.length === 0) return newWord;

    words[words.length - 1] = newWord;
    return words.join(" ");
  };

  // Heuristic: detect if a string looks like a math expression (contains ±, √, superscripts, fraction-style '/', =, or parentheses with operators)
  const looksLikeMath = (text) => {
    if (!text || typeof text !== 'string') return false;
    if (/[±√=\^_{}\\]/.test(text)) return true;
    // superscript digits
    if (/[²³¹⁴⁵⁶⁷⁸⁹⁰]/.test(text)) return true;
    // fraction with bracketed numerator "[...] / ..."
    if (/\[[^\]]+\]\s*\/\s*[^\s]+/.test(text)) return true;
    // simple pattern containing operators
    if (/[+\-*\/]=?/.test(text)) return true;
    return false;
  };

  // Convert common plain-math notation into LaTeX. This is intentionally conservative and focuses on patterns like ±, √(...), superscripts, bracketed numerators and simple fractions.
  const convertPlainMathToLatex = (input) => {
    if (!input || typeof input !== 'string') return input;
    let s = input.trim();

    // If already contains dollar delimiters, assume user already wrote LaTeX
    if (/\$.*\$/.test(s) || /\\\[|\\\(|\\begin\{/.test(s)) return s;

    if (!looksLikeMath(s)) return s; // avoid false positives

    // Replace common symbols
    s = s.replace(/±/g, ' \\pm ');

    // Replace unicode superscripts like b² -> b^{2}
    const supMap = { '²':'2','³':'3','¹':'1','⁴':'4','⁵':'5','⁶':'6','⁷':'7','⁸':'8','⁹':'9','⁰':'0' };
    s = s.replace(/([A-Za-z0-9])([²³¹⁴⁵⁶⁷⁸⁹⁰]+)/g, (m, p1, p2) => {
      const nums = p2.split('').map(ch => supMap[ch] || ch).join('');
      return `${p1}^{${nums}}`;
    });

    // sqrt(...) -> \sqrt{...}
    s = s.replace(/√\s*\(([^)]+)\)/g, (m, inner) => `\\sqrt{${inner.trim()}}`);

    // bracketed numerator: [ ... ] / denom  => \frac{...}{denom}
    s = s.replace(/\[([^\]]+)\]\s*\/\s*([^\s,;]+)/g, (m, num, den) => `\\frac{${num.trim()}}{${den.trim()}}`);

    // simple parentheses numerator: ( ... ) / denom
    s = s.replace(/\(([^)]+)\)\s*\/\s*([^\s,;]+)/g, (m, num, den) => `\\frac{${num.trim()}}{${den.trim()}}`);

    // Insert spaces around operators for cleaner LaTeX
    s = s.replace(/\s*([+\-*=\/])\s*/g, ' $1 ');

    // Collapse multiple spaces
    s = s.replace(/\s{2,}/g, ' ').trim();

    // Wrap inline math in $...$
    return `$${s}$`;
  };

  // Called onBlur for English fields to auto-convert plain math to LaTeX for preview
  const handleEnglishFieldBlur = (field, value, optionIndex = null) => {
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

      console.log("Starting manual translation...");
      console.log("Source English Question:", englishQuestion);

      // Prepare translation requests for all fields while preserving LaTeX
      const translationPromises = [
        translatePreservingLatex(englishQuestion.text),
        englishQuestion.solution.trim()
          ? translatePreservingLatex(englishQuestion.solution)
          : Promise.resolve(""),
        ...englishQuestion.options.map((option) =>
          option.trim() ? translatePreservingLatex(option) : Promise.resolve("")
        ),
      ];

      // Translate all content in parallel
      const [translatedText, translatedSolution, ...translatedOptions] =
        await Promise.all(translationPromises);

      // Update Hindi question with all translated content
      setHindiQuestion((prev) => ({
        ...prev,
        text: translatedText || "",
        solution: translatedSolution || "",
        options: translatedOptions.map((opt) => opt || ""),
        correct_option: englishQuestion.correct_option,
      }));

      toast.success("Successfully translated to Hindi (LaTeX preserved)");
      console.log("Manual translation completed successfully (LaTeX preserved)");
    } catch (error) {
      console.error("Manual translation failed:", error);
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
      // Create array of questions to submit
      const questionsToSubmit = [];

      // Add English question if it has content
      if (
        englishQuestion.text.trim() &&
        englishQuestion.options.every((opt) => opt.trim())
      ) {
        const englishPayload = {
          language: englishQuestion.language,
          text: englishQuestion.text.trim(),
          options: englishQuestion.options.map((opt) => opt.trim()),
          correct_option: englishQuestion.correct_option + 1,
        };

        // Only add solution if it exists
        if (englishQuestion.solution.trim()) {
          englishPayload.solution = englishQuestion.solution.trim();
        }

        questionsToSubmit.push(englishPayload);
      }

      // Add Hindi question if it has content
      if (
        hindiQuestion.text.trim() &&
        hindiQuestion.options.every((opt) => opt.trim())
      ) {
        const hindiPayload = {
          language: hindiQuestion.language,
          text: hindiQuestion.text.trim(),
          options: hindiQuestion.options.map((opt) => opt.trim()),
          correct_option: hindiQuestion.correct_option + 1,
        };

        // Only add solution if it exists
        if (hindiQuestion.solution.trim()) {
          hindiPayload.solution = hindiQuestion.solution.trim() || 1;
        }

        questionsToSubmit.push(hindiPayload);
      }

      if (questionsToSubmit.length === 0) {
        toast.error(
          "Please fill at least one complete question (English or Hindi)"
        );
        return;
      }

      const payload = {
        exam: parseInt(examId),
        questions: questionsToSubmit,
      };

      console.log("Prepared payload for submission:", payload);

      const response = await createNewQuestion(payload);

      if (response) {
        toast.success(
          `${questionsToSubmit.length} question(s) added successfully!`
        );
        navigate(-1);
      } else {
        throw new Error("Failed to create questions");
      }
    } catch (error) {
      console.error("Submission failed:", error);
      toast.error(error.response?.data?.message || "Failed to add questions");
    } finally {
      setIsSubmitting(false);
    }
  };

  const validateForm = () => {
    const hasEnglishContent =
      englishQuestion.text.trim() ||
      englishQuestion.solution.trim() &&
      englishQuestion.options.every((opt) => opt.trim());

    const hasHindiContent =
      hindiQuestion.text.trim() ||
      hindiQuestion.solution.trim() &&
      hindiQuestion.options.every((opt) => opt.trim());

    if (!hasEnglishContent && !hasHindiContent) {
      toast.error(
        "Please fill at least one complete question (English or Hindi)"
      );
      return false;
    }

    return true;
  };

  const handleKeyUp = async (e, field, value, optionIndex = null) => {
    // First update English question without translation
    updateEnglishQuestion(field, value, optionIndex);

    if ((e.key === " " || e.key === "Enter") && value.trim()) {
      setIsTranslating(true);
      try {
        const response = await translatePreservingLatex(value);

        // Update Hindi question with translated text from response
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
        console.error("Translation failed:", error);
        toast.error("Failed to translate text");
      } finally {
        setIsTranslating(false);
      }
    }
  };

  // New function to handle Hindi field real-time word-by-word translation
  const handleHindiKeyUp = async (e, field, value, optionIndex = null) => {
  updateHindiQuestion(field, value, optionIndex);

  if ((e.key === " " || e.key === "Enter") && value.trim()) {
    const words = value.trim().split(/\s+/);
    let updatedWords = [...words];
    let hasTranslation = false;

    setIsTranslating(true);

    try {
      // Loop through each word to detect and translate English ones
      for (let i = 0; i < words.length; i++) {
        const word = words[i];
        // Skip tokens that look like LaTeX (preserve math)
        if (isLatexToken(word)) continue;
        if (isEnglishWord(word)) {
          try {
            const translated = await translateText(word, "English", "Hindi");
            updatedWords[i] = translated;
            hasTranslation = true;
          } catch (error) {
            console.warn("Failed to translate:", word);
          }
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
      console.error("Bulk translation failed:", error);
    } finally {
      setIsTranslating(false);
    }
  }
};

  // New: open editor for a specific target field
  const openEquationEditor = (language, field, optionIndex = null, initialValue = "") => {
    setEqEditorTarget({ language, field, optionIndex });
    setEqEditorValue(initialValue || "");
    setEqEditorOpen(true);
  };

  const closeEquationEditor = () => {
    setEqEditorOpen(false);
  };

  const saveEquationToField = (latex) => {
    const val = (latex || "").trim();
    if (eqEditorTarget.language === "English") {
      if (eqEditorTarget.field === "options") {
        updateEnglishQuestion("options", val, eqEditorTarget.optionIndex);
      } else {
        updateEnglishQuestion(eqEditorTarget.field, val);
      }
    } else {
      if (eqEditorTarget.field === "options") {
        updateHindiQuestion("options", val, eqEditorTarget.optionIndex);
      } else {
        updateHindiQuestion(eqEditorTarget.field, val);
      }
    }
    setEqEditorOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
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

          {/* Translation Controls */}
          <div className="bg-gradient-to-r from-blue-50 to-teal-50 p-6 rounded-xl border border-blue-100 mb-8">
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

          {/* Submission Info */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-green-800 text-sm">
              <strong>Real-time Translation:</strong> Type English words in
              Hindi fields and press Space/Enter after each word for instant
              translation. You can submit English only, Hindi only, or both
              questions.
            </p>
          </div>

          {/* Side-by-Side Forms */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* English Form */}
            <div className="space-y-6">
              <div className="bg-blue-50 p-4 rounded-xl border-2 border-blue-200">
                <h2 className="text-xl font-bold text-blue-800 mb-4 flex items-center">
                  🇺🇸 English Question (Optional)
                </h2>

                {/* English Question Text */}
                <div className="space-y-3 mb-6">
                  <label className="block text-sm font-semibold text-gray-800">
                    Question Text
                  </label>
                  <textarea
                    value={englishQuestion.text}
                    onChange={(e) =>
                      updateEnglishQuestion("text", e.target.value)
                    }
                    onKeyUp={(e) => handleKeyUp(e, "text", e.target.value)}
                    onBlur={(e) => handleEnglishFieldBlur("text", e.target.value)}
                    placeholder="Enter your question in English..."
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                    rows="3"
                  />
                  {/* Add Equation button next to the textarea */}
                  <div className="mt-2">
                    <button
                      type="button"
                      onClick={() =>
                        openEquationEditor("English", "text", null, englishQuestion.text)
                      }
                      className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-md hover:bg-blue-200"
                    >
                      Equation
                    </button>
                  </div>
                </div>

                {/* English Options */}
                <div className="space-y-4 mb-6">
                  <label className="block text-sm font-semibold text-gray-800">
                    Answer Options
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
                              index
                            )
                          }
                          onKeyUp={(e) =>
                            handleKeyUp(e, "options", e.target.value, index)
                          }
                          onBlur={(e) => handleEnglishFieldBlur("options", e.target.value, index)}
                          placeholder={`Option ${index + 1}`}
                          className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all pr-10"
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
                              englishQuestion.options[index]
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

                {/* English Solution */}
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-800">
                    Solution/Explanation
                  </label>
                  <textarea
                    value={englishQuestion.solution}
                    onChange={(e) =>
                      updateEnglishQuestion("solution", e.target.value)
                    }
                    onKeyUp={(e) => handleKeyUp(e, "solution", e.target.value)}
                    onBlur={(e) => handleEnglishFieldBlur("solution", e.target.value)}
                    placeholder="Provide detailed explanation in English..."
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                    rows="3"
                  />
                  <div className="mt-2">
                    <button
                      type="button"
                      onClick={() =>
                        openEquationEditor(
                          "English",
                          "solution",
                          null,
                          englishQuestion.solution
                        )
                      }
                      className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-md hover:bg-blue-200"
                    >
                      Equation
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Hindi Form */}
            <div className="space-y-6">
              <div className="bg-orange-50 p-4 rounded-xl border-2 border-orange-200">
                <h2 className="text-xl font-bold text-orange-800 mb-4 flex items-center">
                  🇮🇳 हिंदी प्रश्न (Hindi Question) - Optional
                </h2>

                {/* Hindi Question Text */}
                <div className="space-y-3 mb-6">
                  <label className="block text-sm font-semibold text-gray-800">
                    प्रश्न पाठ (Question Text)
                  </label>
                  <textarea
                    value={hindiQuestion.text}
                    onChange={(e) =>
                      updateHindiQuestion("text", e.target.value)
                    }
                    onKeyUp={(e) => handleHindiKeyUp(e, "text", e.target.value)}
                    placeholder="हिंदी में टाइप करें या English words टाइप करके हर word के बाद Space दबाएं..."
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all resize-none"
                    rows="3"
                  />
                  <div className="mt-2">
                    <button
                      type="button"
                      onClick={() =>
                        openEquationEditor("Hindi", "text", null, hindiQuestion.text)
                      }
                      className="text-sm bg-orange-100 text-orange-800 px-3 py-1 rounded-md hover:bg-orange-200"
                    >
                      Equation
                    </button>
                  </div>
                </div>

                {/* Hindi Options */}
                <div className="space-y-4 mb-6">
                  <label className="block text-sm font-semibold text-gray-800">
                    उत्तर विकल्प (Answer Options)
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
                              index
                            )
                          }
                          onKeyUp={(e) =>
                            handleHindiKeyUp(
                              e,
                              "options",
                              e.target.value,
                              index
                            )
                          }
                          placeholder={`विकल्प ${
                            index + 1
                          } (English word + Space for translation)`}
                          className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all pr-10"
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
                              hindiQuestion.options[index]
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

                {/* Hindi Solution */}
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-800">
                    समाधान/स्पष्टीकरण (Solution/Explanation)
                  </label>
                  <textarea
                    value={hindiQuestion.solution}
                    onChange={(e) =>
                      updateHindiQuestion("solution", e.target.value)
                    }
                    onKeyUp={(e) =>
                      handleHindiKeyUp(e, "solution", e.target.value)
                    }
                    placeholder="हिंदी में solution टाइप करें या English words टाइप करके हर word के बाद Space दबाएं..."
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all resize-none"
                    rows="3"
                  />
                  <div className="mt-2">
                    <button
                      type="button"
                      onClick={() =>
                        openEquationEditor(
                          "Hindi",
                          "solution",
                          null,
                          hindiQuestion.solution
                        )
                      }
                      className="text-sm bg-orange-100 text-orange-800 px-3 py-1 rounded-md hover:bg-orange-200"
                    >
                      Equation
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>


          {/* Question Preview */}
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
            <QuestionPreview
              question={englishQuestion}
              activeLanguage="English"
            />
            <QuestionPreview question={hindiQuestion} activeLanguage="Hindi" />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end mt-8">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
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
        </div>
      </div>

      {/* Equation Editor Modal (lazy loaded) */}
      {eqEditorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
          <div className="bg-white rounded-lg w-full max-w-3xl p-4 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold">Equation Editor</h3>
              <button
                onClick={closeEquationEditor}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Close
              </button>
            </div>

            <Suspense fallback={<div className="p-4">Loading editor...</div>}>
              <EqErrorBoundary
                fallbackValue={eqEditorValue}
                onChange={setEqEditorValue}
                onSave={() => saveEquationToField(eqEditorValue)}
                onCancel={closeEquationEditor}
              >
                {/* Use value/onChange and provide safe autoCommands / autoOperatorNames */}
                <EquationEditor
                  value={eqEditorValue}
                  onChange={(val) => setEqEditorValue(val)}
                  // common commands/operators to avoid internal undefined.split errors
                  autoCommands="pi theta sqrt sum prod alpha beta gamma rho frac pm"
                  autoOperatorNames="sin cos tan log ln exp"
                  // keep config fallback as extra safety
                  config={{ autoCommands: "pi theta sqrt sum prod alpha beta gamma rho frac pm" }}
                  style={{ minHeight: 200 }}
                />
              </EqErrorBoundary>
            </Suspense>

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

export default QuestionForm;
