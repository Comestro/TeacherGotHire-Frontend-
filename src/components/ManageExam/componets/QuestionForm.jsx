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
  const [duplicateError, setDuplicateError] = useState(null);
  // Add missing state for englishSectionEmpty
  const [englishSectionEmpty, setEnglishSectionEmpty] = useState(false);
  const [hindiSectionEmpty, setHindiSectionEmpty] = useState(false);

  // New: equation editor modal state
  const [eqEditorOpen, setEqEditorOpen] = useState(false);
  const [eqEditorValue, setEqEditorValue] = useState("");
  const [eqEditorTarget, setEqEditorTarget] = useState({
    language: "English",
    field: "text", // "text" | "solution" | "options"
    optionIndex: null,
    originalLatexInfo: null, // {match, inner, wrapperStart, wrapperEnd, index, length}
  });

  // Track if content was just updated from equation editor to avoid auto-conversion
  const [isFromEquationEditor, setIsFromEquationEditor] = useState(false);

  // New: helper to insert LaTeX command at cursor or append
  const insertLatexCommand = (command) => {
    setEqEditorValue((prev) => prev + command);
  };

  // New: LaTeX toolbar component
  const LatexToolbar = () => {
    const toolbarItems = [
      // Basic symbols
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
      // Fractions and structures
      { label: "x/y", command: "\\frac{}{} ", insert: "\\frac{" },
      { label: "x²", command: "^{} ", insert: "^{" },
      { label: "x₁", command: "_{} ", insert: "_{" },
      { label: "∑ᵢ", command: "\\sum_{i=1}^{n} " },
      { label: "∫ᵃᵇ", command: "\\int_{a}^{b} " },
      { label: "lim", command: "\\lim_{x \\to \\infty} " },
      // Functions
      { label: "sin", command: "\\sin " },
      { label: "cos", command: "\\cos " },
      { label: "tan", command: "\\tan " },
      { label: "log", command: "\\log " },
      { label: "ln", command: "\\ln " },
      // Brackets
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
              onClick={() =>
                insertLatexCommand(item.insert || item.command)
              }
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
    // Skip auto-conversion if content just came from equation editor
    if (isFromEquationEditor) {
      setIsFromEquationEditor(false);
      return;
    }
    
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
      // Now we expect both questions to be complete
      const englishPayload = {
        language: englishQuestion.language,
        text: englishQuestion.text.trim(),
        options: englishQuestion.options.map((opt) => opt.trim()),
        correct_option: englishQuestion.correct_option + 1
      };

      // Only add solution if it exists
      if (englishQuestion.solution.trim()) {
        englishPayload.solution = englishQuestion.solution.trim();
      }

      const hindiPayload = {
        language: hindiQuestion.language,
        text: hindiQuestion.text.trim(),
        options: hindiQuestion.options.map((opt) => opt.trim()),
        correct_option: hindiQuestion.correct_option + 1
      };

      // Only add solution if it exists
      if (hindiQuestion.solution.trim()) {
        hindiPayload.solution = hindiQuestion.solution.trim();
      }

      // Both questions are required now
      const questionsToSubmit = [englishPayload, hindiPayload];

      const payload = {
        exam: parseInt(examId),
        questions: questionsToSubmit,
      };

      console.log("Prepared payload for submission:", payload);

      const response = await createNewQuestion(payload);

      if (response) {
        toast.success("Questions added successfully in both languages!");
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

  // Function to check if English and Hindi questions have duplicate content
  const checkDuplicateContent = () => {
    // Skip check if either form is empty
    if (!englishQuestion.text.trim() || !hindiQuestion.text.trim()) {
      setDuplicateError(null);
      return false;
    }

    // Check for duplicate text (ignoring case and whitespace)
    if (englishQuestion.text.trim().toLowerCase() === hindiQuestion.text.trim().toLowerCase()) {
      setDuplicateError("The English and Hindi question texts are identical. Please make them unique.");
      return true;
    }

    // // Check for duplicate options
    // const duplicateOptions = englishQuestion.options.some((option, index) => {
    //   return option.trim().toLowerCase() === hindiQuestion.options[index].trim().toLowerCase() && option.trim() !== "";
    // });

    // if (duplicateOptions) {
    //   setDuplicateError("Some options are identical in both languages. Please make all options unique.");
    //   return true;
    // }

    // Check for duplicate solution if both have content
    if (englishQuestion.solution.trim() && hindiQuestion.solution.trim() && 
        englishQuestion.solution.trim().toLowerCase() === hindiQuestion.solution.trim().toLowerCase()) {
      setDuplicateError("The solutions are identical in both languages. Please make them unique.");
      return true;
    }

    // No duplicates found
    setDuplicateError(null);
    return false;
  };

  // Effect to check for duplicates whenever questions change
  useEffect(() => {
    // Debounced duplicate check to avoid checking on every keystroke
    const duplicateCheckTimer = setTimeout(() => {
      checkDuplicateContent();
    }, 500);

    return () => clearTimeout(duplicateCheckTimer);
  }, [englishQuestion.text, hindiQuestion.text, 
     englishQuestion.options.join(), hindiQuestion.options.join(),
     englishQuestion.solution, hindiQuestion.solution]);

  // Add state for field-level validation errors
  const [fieldErrors, setFieldErrors] = useState({
    english: {
      text: false,
      options: [false, false, false, false],
      solution: false
    },
    hindi: {
      text: false,
      options: [false, false, false, false],
      solution: false
    }
  });

  // Update validateForm with more strict field validation
  const validateForm = () => {
    // Check for duplicate content first
    if (checkDuplicateContent()) {
      return false;
    }
    
    // Create a copy of field errors to update
    const newFieldErrors = {
      english: {
        text: false,
        options: [false, false, false, false],
        solution: false
      },
      hindi: {
        text: false,
        options: [false, false, false, false],
        solution: false
      }
    };
    
    let hasError = false;

    // English validation - required regardless of emptiness
    // Question text is required
    if (!englishQuestion.text.trim()) {
      newFieldErrors.english.text = true;
      hasError = true;
    }

    // Each option is required
    englishQuestion.options.forEach((opt, idx) => {
      if (!opt.trim()) {
        newFieldErrors.english.options[idx] = true;
        hasError = true;
      }
    });

    // Solution is NOT required - remove this check
    // if (!englishQuestion.solution.trim()) {
    //   newFieldErrors.english.solution = true;
    //   hasError = true;
    // }

    // Hindi validation - required regardless of emptiness
    // Question text is required
    if (!hindiQuestion.text.trim()) {
      newFieldErrors.hindi.text = true;
      hasError = true;
    }

    // Each option is required
    hindiQuestion.options.forEach((opt, idx) => {
      if (!opt.trim()) {
        newFieldErrors.hindi.options[idx] = true;
        hasError = true;
      }
    });

    // Solution is NOT required - remove this check
    // if (!hindiQuestion.solution.trim()) {
    //   newFieldErrors.hindi.solution = true;
    //   hasError = true;
    // }

    // Update error state
    setFieldErrors(newFieldErrors);

    // If there are errors, show a toast notification
    if (hasError) {
      toast.error("Both English and Hindi questions must be complete. Please fill in all required fields.");
      return false;
    }

    // Ensure that both languages have complete information
    const isEnglishComplete = englishQuestion.text.trim() && 
                             englishQuestion.options.every(opt => opt.trim());
                             // Solution is optional now

    const isHindiComplete = hindiQuestion.text.trim() && 
                           hindiQuestion.options.every(opt => opt.trim());
                           // Solution is optional now

    if (!isEnglishComplete || !isHindiComplete) {
      toast.error("Both English and Hindi questions must have text and all options filled");
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

  // Find first LaTeX fragment and return structured info.
  const extractFirstLatex = (src) => {
    if (!src || typeof src !== "string") return null;
    const regex = /(\$\$[\s\S]*?\$\$|\$[^$]*?\$|\\\[[\s\S]*?\\\]|\\\([\s\S]*?\\\)|\\[a-zA-Z]+(?:\s*\{[^}]*\})+)/g;
    const m = regex.exec(src);
    if (!m) return null;
    const match = m[0];
    const index = m.index;
    const length = match.length;

    // Determine wrappers and inner content
    if (match.startsWith("$$") && match.endsWith("$$")) {
      return { match, inner: match.slice(2, -2), wrapperStart: "$$", wrapperEnd: "$$", index, length };
    }
    if (match.startsWith("$") && match.endsWith("$")) {
      return { match, inner: match.slice(1, -1), wrapperStart: "$", wrapperEnd: "$", index, length };
    }
    if (match.startsWith("\\[") && match.endsWith("\\]")) {
      return { match, inner: match.slice(2, -2), wrapperStart: "\\[", wrapperEnd: "\\]", index, length };
    }
    if (match.startsWith("\\(") && match.endsWith("\\)")) {
      return { match, inner: match.slice(2, -2), wrapperStart: "\\(", wrapperEnd: "\\)", index, length };
    }
    // Command-like (e.g. \cfrac{...}{...}) — pass whole match as inner (don't strip)
    if (match.startsWith("\\")) {
      return { match, inner: match, wrapperStart: "", wrapperEnd: "", index, length };
    }
    return { match, inner: match, wrapperStart: "", wrapperEnd: "", index, length };
  };

  // New: open editor for a specific target field
  const openEquationEditor = (language, field, optionIndex = null, initialValue = "") => {
    // detect first LaTeX fragment and present it in editor (without wrappers)
    const latexInfo = extractFirstLatex(initialValue || "");
    setEqEditorTarget({ language, field, optionIndex, originalLatexInfo: latexInfo });
    if (latexInfo) {
      setEqEditorValue(latexInfo.inner ?? latexInfo.match ?? "");
    } else {
      // no latex found — open with raw full text (or empty)
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
    // Helper to perform replacement for a given text
    const replaceInText = (text) => {
      if (!info) {
        // append as inline math by default
        const appended = (text.trim() ? text + " " : "") + `$${val}$`;
        return appended;
      }
      // replace exact original match at stored index
      const before = text.slice(0, info.index);
      const after = text.slice(info.index + info.length);
      const wrapped = `${info.wrapperStart}${val}${info.wrapperEnd}`;
      return before + wrapped + after;
    };

    // Mark that content is coming from equation editor to prevent auto-conversion
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

  // Check if English section is actually empty (completely)
  const isEnglishSectionTrulyEmpty = () => {
    return !englishQuestion.text.trim() && 
           !englishQuestion.options.some(opt => opt.trim()) &&
           !englishQuestion.solution.trim(); // Fixed: added missing solution check
  };

  // Check if Hindi section is actually empty (completely)
  const isHindiSectionTrulyEmpty = () => {
    return !hindiQuestion.text.trim() && 
           !hindiQuestion.options.some(opt => opt.trim()) &&
           !hindiQuestion.solution.trim(); // Fixed: added missing solution check
  };

  // Add effect to check English section emptiness
  useEffect(() => {
    setEnglishSectionEmpty(isEnglishSectionTrulyEmpty());
  }, [englishQuestion]);

  // Add effect to check Hindi section emptiness 
  useEffect(() => {
    setHindiSectionEmpty(isHindiSectionTrulyEmpty());
  }, [hindiQuestion]);

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
              <strong>Important:</strong> Both English and Hindi versions are required. 
              Type English words in Hindi fields and press Space/Enter after each word for instant
              translation. All fields marked with <span className="text-red-500">*</span> must be filled.
            </p>
          </div>

          {/* Add error banner for duplicate content */}
          {duplicateError && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6 rounded-md">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">
                    <strong className="font-medium">Error:</strong> {duplicateError}
                  </p>
                  <p className="text-sm text-red-600 mt-1">
                    English and Hindi versions must be different to validate as a bilingual question set.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Side-by-Side Forms */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* English Form */}
            <div className="space-y-6">
              <div className="bg-blue-50 p-4 rounded-xl border-2 border-blue-200">
                <h2 className="text-xl font-bold text-blue-800 mb-4 flex items-center">
                  🇺🇸 English Question <span className="text-red-500 ml-1">*</span>
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
                    onBlur={(e) => handleEnglishFieldBlur("text", e.target.value)}
                    placeholder="Enter your question in English..."
                    className={`w-full p-3 border ${fieldErrors.english.text ? 'border-red-500 bg-red-50' : 'border-gray-200'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none`}
                    rows="3"
                    required={!englishSectionEmpty}
                  />
                  {fieldErrors.english.text && (
                    <p className="text-red-500 text-xs mt-1">Question text is required</p>
                  )}
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
                              index
                            )
                          }
                          onKeyUp={(e) =>
                            handleKeyUp(e, "options", e.target.value, index)
                          }
                          onBlur={(e) => handleEnglishFieldBlur("options", e.target.value, index)}
                          placeholder={`Option ${index + 1}`}
                          className={`w-full p-2 border ${fieldErrors.english.options[index] ? 'border-red-500 bg-red-50' : 'border-gray-200'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all pr-10`}
                          required={!englishSectionEmpty}
                        />
                        {fieldErrors.english.options[index] && (
                          <p className="text-red-500 text-xs mt-1">Option {index + 1} is required</p>
                        )}
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
                    Solution/Explanation <span className="text-gray-500">(Optional)</span>
                  </label>
                  <textarea
                    value={englishQuestion.solution}
                    onChange={(e) =>
                      updateEnglishQuestion("solution", e.target.value)
                    }
                    onKeyUp={(e) => handleKeyUp(e, "solution", e.target.value)}
                    onBlur={(e) => handleEnglishFieldBlur("solution", e.target.value)}
                    placeholder="Provide detailed explanation in English (optional)..."
                    className={`w-full p-3 border ${fieldErrors.english.solution ? 'border-red-500 bg-red-50' : 'border-gray-200'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none`}
                    rows="3"
                  />
                  {/* Remove error message for solution since it's optional */}
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
                  🇮🇳 हिंदी प्रश्न (Hindi Question) <span className="text-red-500 ml-1">*</span>
                </h2>

                {/* Hindi Question Text */}
                <div className="space-y-3 mb-6">
                  <label className="block text-sm font-semibold text-gray-800">
                    प्रश्न पाठ (Question Text) <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={hindiQuestion.text}
                    onChange={(e) =>
                      updateHindiQuestion("text", e.target.value)
                    }
                    onKeyUp={(e) => handleHindiKeyUp(e, "text", e.target.value)}
                    placeholder="हिंदी में टाइप करें या English words टाइप करके हर word के बाद Space दबाएं..."
                    className={`w-full p-3 border ${fieldErrors.hindi.text ? 'border-red-500 bg-red-50' : 'border-gray-200'} rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all resize-none`}
                    rows="3"
                    required={!hindiSectionEmpty}
                  />
                  {fieldErrors.hindi.text && (
                    <p className="text-red-500 text-xs mt-1">प्रश्न पाठ आवश्यक है</p>
                  )}
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
                    उत्तर विकल्प (Answer Options) <span className="text-red-500">*</span>
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
                          className={`w-full p-2 border ${fieldErrors.hindi.options[index] ? 'border-red-500 bg-red-50' : 'border-gray-200'} rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all pr-10`}
                          required={!hindiSectionEmpty}
                        />
                        {fieldErrors.hindi.options[index] && (
                          <p className="text-red-500 text-xs mt-1">विकल्प {index + 1} आवश्यक है</p>
                        )}
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
                    समाधान/स्पष्टीकरण (Solution/Explanation) <span className="text-gray-500">(Optional)</span>
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
                    className={`w-full p-3 border ${fieldErrors.hindi.solution ? 'border-red-500 bg-red-50' : 'border-gray-200'} rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all resize-none`}
                    rows="3"
                  />
                  {/* Remove error message for solution since it's optional */}
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
              disabled={isSubmitting || duplicateError !== null}
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
    </div>
  );
};

export default QuestionForm;
