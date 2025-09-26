import React, { useState, useEffect, lazy, Suspense } from 'react';
import { FiX, FiGlobe, FiRefreshCw, FiLoader } from 'react-icons/fi';
import { translateText } from '../../../services/apiService';
import { toast } from 'react-toastify';
import QuestionPreview from './QuestionPreview';

// Lazy-load equation editor
const EquationEditor = lazy(() => import("equation-editor-react"));

// New small error boundary + editable fallback for the equation editor
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

const QuestionModal = ({ isOpen, onClose, onSubmit, examId, editingQuestion }) => {
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
  const [textErrors, setTextErrors] = useState({
    english: false,
    hindi: false
  });
  const [hindiSectionEmpty, setHindiSectionEmpty] = useState(false);

  // Add fieldErrors state that was missing
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

  // New: equation editor modal state
  const [eqEditorOpen, setEqEditorOpen] = useState(false);
  const [eqEditorValue, setEqEditorValue] = useState("");
  // modal key forces remount of boundary/editor so they initialize with eqEditorValue
  const [eqModalKey, setEqModalKey] = useState(0);
  const [eqEditorTarget, setEqEditorTarget] = useState({
     language: "English",
     field: "text", // "text" | "solution" | "options"
     optionIndex: null,
    originalLatexInfo: null, // {match, inner, wrapperStart, wrapperEnd, index, length}
   });

  // Initialize form with editing question data if available
  useEffect(() => {
    if (editingQuestion) {
      // Find the Hindi version by checking if there's a parallel question with same order
      const findCorrespondingHindiQuestion = async () => {
        try {
          // If current question is English, try to find its Hindi counterpart
          if (editingQuestion.language === 'English') {
            setEnglishQuestion({
              language: 'English',
              text: editingQuestion.text || '',
              solution: editingQuestion.solution || '',
              options: editingQuestion.options?.length ? 
                [...editingQuestion.options] : ['', '', '', ''],
              correct_option: editingQuestion.correct_option ? 
                parseInt(editingQuestion.correct_option) - 1 : 0
            });
            
            // We would need to fetch the Hindi version here, but for now just initialize empty
            setHindiQuestion({
              language: "Hindi",
              text: "",
              solution: "",
              options: ["", "", "", ""],
              correct_option: editingQuestion.correct_option ? 
                parseInt(editingQuestion.correct_option) - 1 : 0
            });
          } 
          // If current question is Hindi, try to find its English counterpart
          else if (editingQuestion.language === 'Hindi') {
            setHindiQuestion({
              language: 'Hindi',
              text: editingQuestion.text || '',
              solution: editingQuestion.solution || '',
              options: editingQuestion.options?.length ? 
                [...editingQuestion.options] : ['', '', '', ''],
              correct_option: editingQuestion.correct_option ? 
                parseInt(editingQuestion.correct_option) - 1 : 0
            });
            
            // We would need to fetch the English version here, but for now just initialize empty
            setEnglishQuestion({
              language: "English",
              text: "",
              solution: "",
              options: ["", "", "", ""],
              correct_option: editingQuestion.correct_option ? 
                parseInt(editingQuestion.correct_option) - 1 : 0
            });
          }
        } catch (error) {
          console.error("Error finding corresponding question:", error);
        }
      };

      findCorrespondingHindiQuestion();
    } else {
      // Reset form when not editing
      setEnglishQuestion({
        language: "English",
        text: "",
        solution: "",
        options: ["", "", "", ""],
        correct_option: 0,
      });
      
      setHindiQuestion({
        language: "Hindi",
        text: "",
        solution: "",
        options: ["", "", "", ""],
        correct_option: 0,
      });
    }
  }, [editingQuestion]);

  // Function to detect if a word is in English
  const isEnglishWord = (word) => {
    if (!word || word.trim().length === 0) return false;
    const englishChars = word.match(/[A-Za-z]/g);
    const totalChars = word.replace(/[^A-Za-z0-9]/g, "").length;
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

  // New helper: detect LaTeX-like tokens (used in Hindi real-time translation)
  const isLatexToken = (token) => {
    if (!token || typeof token !== "string") return false;
    if (/\$/.test(token)) return true;
    if (/^\\[A-Za-z]+/.test(token)) return true;
    if (/[\\^_{}]/.test(token)) return true;
    return false;
  };

  // New: translatePreservingLatex - translate only non-latex segments
  const translatePreservingLatex = async (src) => {
    if (!src || !src.trim()) return "";
    // regex matches $...$, $$...$$, \[...\], \(...\), or commands with one-or-more {...} groups
    const regex = /(\$\$[\s\S]*?\$\$|\$[^$]*?\$|\\\[[\s\S]*?\\\]|\\\([\s\S]*?\\\)|\\[a-zA-Z]+(?:\s*\{[^}]*\})+)/g;

    const promises = [];
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(src)) !== null) {
      if (match.index > lastIndex) {
        const chunk = src.slice(lastIndex, match.index);
        promises.push(translateText(chunk, "English", "Hindi").catch(() => chunk));
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
          option.trim() ? translatePreservingLatex(option) : Promise.resolve("")
        ),
      ];

      const [translatedText, translatedSolution, ...translatedOptions] = await Promise.all(translationPromises);

      setHindiQuestion((prev) => ({
        ...prev,
        text: translatedText || "",
        solution: translatedSolution || "",
        options: translatedOptions.map((opt) => opt || ""),
        correct_option: englishQuestion.correct_option,
      }));

      toast.success("Successfully translated to Hindi (LaTeX preserved)");
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

  // Update canSubmitForm to make solution optional
  const canSubmitForm = () => {
    // If we're editing, we only need to check the language being edited
    if (editingQuestion) {
      if (editingQuestion.language === 'English') {
        return englishQuestion.text.trim() && 
               englishQuestion.options.every(opt => opt.trim());
               // Solution is now optional
      } else {
        return hindiQuestion.text.trim() && 
               hindiQuestion.options.every(opt => opt.trim());
               // Solution is now optional
      }
    }
    
    // For new questions, check if BOTH language sections are complete
    const isEnglishComplete = 
      englishQuestion.text.trim() && 
      englishQuestion.options.every(opt => opt.trim());
      // Solution is now optional
    
    const isHindiComplete = 
      hindiQuestion.text.trim() && 
      hindiQuestion.options.every(opt => opt.trim());
      // Solution is now optional
    
    // Now require both languages to be complete
    return isEnglishComplete && isHindiComplete;
  };

  // Update validateForm to make solution optional
  const validateForm = () => {
    // Reset field errors
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
    
    // Reset text errors
    const newTextErrors = { english: false, hindi: false };
    let hasError = false;
    
    // If editing, validate only the language being edited
    if (editingQuestion) {
      const isEditingEnglish = editingQuestion.language === 'English';
      const questionToValidate = isEditingEnglish ? englishQuestion : hindiQuestion;
      const errorField = isEditingEnglish ? newFieldErrors.english : newFieldErrors.hindi;
      
      // Text is required
      if (!questionToValidate.text.trim()) {
        if (isEditingEnglish) {
          newTextErrors.english = true;
          errorField.text = true;
        } else {
          newTextErrors.hindi = true;
          errorField.text = true;
        }
        toast.error(`Question text in ${isEditingEnglish ? 'English' : 'Hindi'} is required`);
        hasError = true;
      }
      
      // Each option is required
      questionToValidate.options.forEach((option, idx) => {
        if (!option.trim()) {
          errorField.options[idx] = true;
          hasError = true;
        }
      });
      
      // If any option is empty, show an error
      if (errorField.options.some(err => err)) {
        toast.error(`All options in ${isEditingEnglish ? 'English' : 'Hindi'} are required`);
      }
      
      // Solution is now optional - remove this check
      // if (!questionToValidate.solution.trim()) {
      //   errorField.solution = true;
      //   toast.error(`Solution in ${isEditingEnglish ? 'English' : 'Hindi'} is required`);
      //   hasError = true;
      // }
      
      // Correct option must have content
      const correctOptionText = questionToValidate.options[questionToValidate.correct_option];
      if (!correctOptionText || !correctOptionText.trim()) {
        errorField.options[questionToValidate.correct_option] = true;
        toast.error(`The selected correct answer for ${isEditingEnglish ? 'English' : 'Hindi'} cannot be empty`);
        hasError = true;
      }
      
      setFieldErrors(newFieldErrors);
      setTextErrors(newTextErrors);
      return !hasError;
    }
    
    // For new questions, validate BOTH languages (they're both required now)
    
    // English validation
    if (!englishQuestion.text.trim()) {
      newTextErrors.english = true;
      newFieldErrors.english.text = true;
      toast.error("Question text in English is required");
      hasError = true;
    }
    
    // Each English option is required
    englishQuestion.options.forEach((option, idx) => {
      if (!option.trim()) {
        newFieldErrors.english.options[idx] = true;
        hasError = true;
      }
    });
    
    // If any English option is empty, show an error
    if (newFieldErrors.english.options.some(err => err)) {
      toast.error("All options in English are required");
    }
    
    // Solution is now optional - remove this check
    // if (!englishQuestion.solution.trim()) {
    //   newFieldErrors.english.solution = true;
    //   toast.error("Solution in English is required");
    //   hasError = true;
    // }
    
    // English correct option must have content
    if (!englishQuestion.options[englishQuestion.correct_option]?.trim()) {
      newFieldErrors.english.options[englishQuestion.correct_option] = true;
      toast.error("The selected correct answer for English cannot be empty");
      hasError = true;
    }
    
    // Hindi validation
    if (!hindiQuestion.text.trim()) {
      newTextErrors.hindi = true;
      newFieldErrors.hindi.text = true;
      toast.error("Question text in Hindi is required");
      hasError = true;
    }
    
    // Each Hindi option is required
    hindiQuestion.options.forEach((option, idx) => {
      if (!option.trim()) {
        newFieldErrors.hindi.options[idx] = true;
        hasError = true;
      }
    });
    
    // If any Hindi option is empty, show an error
    if (newFieldErrors.hindi.options.some(err => err)) {
      toast.error("All options in Hindi are required");
    }
    
    // Solution is now optional - remove this check
    // if (!hindiQuestion.solution.trim()) {
    //   newFieldErrors.hindi.solution = true;
    //   toast.error("Solution in Hindi is required");
    //   hasError = true;
    // }
    
    // Hindi correct option must have content
    if (!hindiQuestion.options[hindiQuestion.correct_option]?.trim()) {
      newFieldErrors.hindi.options[hindiQuestion.correct_option] = true;
      toast.error("The selected correct answer for Hindi cannot be empty");
      hasError = true;
    }
    
    // Update error states
    setFieldErrors(newFieldErrors);
    setTextErrors(newTextErrors);
    
    if (hasError) {
      return false;
    }
    
    return true;
  };

  // Update handleSubmit to make solution optional
  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      // Create structured form data for both languages
      const formData = {
        english: {
          language: "English",
          text: englishQuestion.text.trim(),
          options: englishQuestion.options.map(opt => opt.trim()),
          correct_option: englishQuestion.correct_option + 1
        },
        hindi: {
          language: "Hindi",
          text: hindiQuestion.text.trim(),
          options: hindiQuestion.options.map(opt => opt.trim()),
          correct_option: hindiQuestion.correct_option + 1
        }
      };
      
      // Only add solutions if they exist
      if (englishQuestion.solution.trim()) {
        formData.english.solution = englishQuestion.solution.trim();
      }
      
      if (hindiQuestion.solution.trim()) {
        formData.hindi.solution = hindiQuestion.solution.trim();
      }

      // If editing, handle single language edits
      if (editingQuestion) {
        // Keep only the language being edited if we're in edit mode
        if (editingQuestion.language === 'English') {
          delete formData.hindi;
        } else if (editingQuestion.language === 'Hindi') {
          delete formData.english;
        }
      }

      await onSubmit(formData);
      
    } catch (error) {
      console.error("Submission failed:", error);
      toast.error("Failed to save question");
    } finally {
      setIsSubmitting(false);
    }
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
      } catch (error) {
        console.error("Translation failed:", error);
      } finally {
        setIsTranslating(false);
      }
    }
  };

  // Hindi word-by-word handler: skip latex tokens
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

  // New: open/close/save eq editor
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
    // bump modal key and open modal so boundary/editor remount with current value
    setEqModalKey((k) => k + 1);
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

  // Find first LaTeX fragment and return structured info.
  const extractFirstLatex = (src) => {
    if (!src || typeof src !== "string") return null;
    const regex = /(\$\$[\s\S]*?\$\$|\$[^$]*?\$|\\\[[\s\S]*?\\\]|\\\([\s\S]*?\\\]|\\[a-zA-Z]+(?:\s*\{[^}]*\})+)/g;
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

  // New: helper to insert LaTeX command at cursor or append
  const insertLatexCommand = (command) => {
    setEqEditorValue(prev => prev + command);
  };

  // New: LaTeX toolbar component
  const LatexToolbar = () => {
    const toolbarItems = [
      // Basic symbols
      { label: 'α', command: '\\alpha ' },
      { label: 'β', command: '\\beta ' },
      { label: 'γ', command: '\\gamma ' },
      { label: 'θ', command: '\\theta ' },
      { label: 'π', command: '\\pi ' },
      { label: 'Σ', command: '\\sum ' },
      { label: '∫', command: '\\int ' },
      { label: '∞', command: '\\infty ' },
      { label: '±', command: '\\pm ' },
      { label: '≤', command: '\\leq ' },
      { label: '≥', command: '\\geq ' },
      { label: '≠', command: '\\neq ' },
      { label: '→', command: '\\rightarrow ' },
      { label: '√', command: '\\sqrt{} ', insert: '\\sqrt{' },
      // Fractions and structures
      { label: 'x/y', command: '\\frac{}{} ', insert: '\\frac{' },
      { label: 'x²', command: '^{} ', insert: '^{' },
      { label: 'x₁', command: '_{} ', insert: '_{' },
      { label: '∑ᵢ', command: '\\sum_{i=1}^{n} ' },
      { label: '∫ᵃᵇ', command: '\\int_{a}^{b} ' },
      { label: 'lim', command: '\\lim_{x \\to \\infty} ' },
      // Functions
      { label: 'sin', command: '\\sin ' },
      { label: 'cos', command: '\\cos ' },
      { label: 'tan', command: '\\tan ' },
      { label: 'log', command: '\\log ' },
      { label: 'ln', command: '\\ln ' },
      // Brackets
      { label: '()', command: '\\left( \\right) ', insert: '\\left(' },
      { label: '[]', command: '\\left[ \\right] ', insert: '\\left[' },
      { label: '{}', command: '\\left\\{ \\right\\} ', insert: '\\left\\{' },
    ];

    return (
      <div className="border-b border-gray-200 p-3 bg-gray-50">
        <div className="text-xs font-medium text-gray-700 mb-2">LaTeX Toolbar</div>
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
          Click symbols to insert LaTeX code. You can also type directly in the editor.
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-7xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
              {editingQuestion ? 'Edit Question' : 'Add New Question'}
              {editingQuestion && (
                <span className="ml-2 text-sm font-normal text-gray-500">
                  (Editing {editingQuestion.language} Version)
                </span>
              )}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FiX className="w-6 h-6" />
            </button>
          </div>

          {/* Translation Controls */}
          <div className="bg-gradient-to-r from-blue-50 to-teal-50 p-4 sm:p-6 rounded-xl border border-blue-100 mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
              <div className="flex items-start sm:items-center gap-3">
                <FiGlobe className="w-5 h-5 sm:w-6 sm:h-6 text-teal-600 mt-1 sm:mt-0" />
                <div>
                  <span className="text-base sm:text-lg font-semibold text-gray-800 block">
                    Real-time Word Translation
                  </span>
                  <span className="text-xs sm:text-sm text-gray-600">
                    Type English words in Hindi fields - each word translates after Space/Enter
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleManualTranslate}
                disabled={isTranslating || (editingQuestion && editingQuestion.language === 'Hindi')}
                className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center space-x-2 text-sm sm:text-base w-full sm:w-auto justify-center"
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

          {/* Add notice that both languages are required when not in edit mode */}
          {!editingQuestion && (
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-700">
                    <strong>Important:</strong> Both English and Hindi versions are required for new questions. All fields marked with <span className="text-red-500">*</span> must be filled.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Side-by-Side Forms */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            {/* English Form - Updated to always be required when not editing */}
            <div className="space-y-6">
              <div className={`bg-blue-50 p-4 rounded-xl border-2 ${editingQuestion && editingQuestion.language === 'Hindi' ? 'border-gray-200 opacity-60' : 'border-blue-200'}`}>
                <h2 className="text-lg sm:text-xl font-bold text-blue-800 mb-4 flex items-center">
                  🇺🇸 English Question {!editingQuestion && <span className="text-red-500 ml-1">*</span>}
                  {editingQuestion && editingQuestion.language === 'Hindi' && (
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
                    onChange={(e) => updateEnglishQuestion("text", e.target.value)}
                    onKeyUp={(e) => handleKeyUp(e, "text", e.target.value)}
                    placeholder="Enter your question in English..."
                    className={`w-full p-3 border ${fieldErrors.english.text || textErrors.english ? 'border-red-500 bg-red-50' : 'border-gray-200'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none`}
                    rows="3"
                    disabled={editingQuestion && editingQuestion.language === 'Hindi'}
                    required={!editingQuestion || editingQuestion.language === 'English'}
                  />
                  {(textErrors.english || fieldErrors.english.text) && (
                    <p className="text-red-500 text-xs mt-1">Question text is required</p>
                  )}
                </div>
                <div className="mt-2">
                  <button
                    type="button"
                    onClick={() => openEquationEditor("English", "text", null, englishQuestion.text)}
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
                            if (!editingQuestion || editingQuestion.language === 'English') {
                              setHindiQuestion((prev) => ({
                                ...prev,
                                correct_option: index,
                              }));
                            }
                          }}
                          className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                          disabled={editingQuestion && editingQuestion.language === 'Hindi'}
                        />
                      </div>
                      <div className="flex-1 relative">
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => updateEnglishQuestion("options", e.target.value, index)}
                          onKeyUp={(e) => handleKeyUp(e, "options", e.target.value, index)}
                          placeholder={`Option ${index + 1}`}
                          className={`w-full p-2 border ${fieldErrors.english.options[index] ? 'border-red-500 bg-red-50' : 'border-gray-200'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all pr-10`}
                          disabled={editingQuestion && editingQuestion.language === 'Hindi'}
                          required={!editingQuestion || editingQuestion.language === 'English'}
                        />
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs font-medium text-gray-500 bg-gray-100 w-5 h-5 rounded-full flex items-center justify-center">
                          {String.fromCharCode(65 + index)}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() =>
                            openEquationEditor("English", "options", index, englishQuestion.options[index])
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
                    Solution/Explanation <span className="text-gray-500">(Optional)</span>
                  </label>
                  <textarea
                    value={englishQuestion.solution}
                    onChange={(e) => updateEnglishQuestion("solution", e.target.value)}
                    onKeyUp={(e) => handleKeyUp(e, "solution", e.target.value)}
                    placeholder="Provide detailed explanation in English (optional)..."
                    className={`w-full p-3 border ${fieldErrors.english.solution ? 'border-red-500 bg-red-50' : 'border-gray-200'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none`}
                    rows="3"
                    disabled={editingQuestion && editingQuestion.language === 'Hindi'}
                  />
                </div>
                <div className="mt-2">
                  <button
                    type="button"
                    onClick={() => openEquationEditor("English", "solution", null, englishQuestion.solution)}
                    className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-md hover:bg-blue-200"
                  >
                    Equation
                  </button>
                </div>
              </div>
            </div>

            {/* Hindi Form - Updated to always be required when not editing */}
            <div className="space-y-6">
              <div className={`bg-orange-50 p-4 rounded-xl border-2 ${(editingQuestion && editingQuestion.language === 'English') || hindiSectionEmpty ? 'border-gray-200 opacity-60' : 'border-orange-200'}`}>
                <h2 className="text-lg sm:text-xl font-bold text-orange-800 mb-4 flex items-center">
                  🇮🇳 हिंदी प्रश्न (Hindi Question) {!editingQuestion && <span className="text-red-500 ml-1">*</span>}
                  {editingQuestion && editingQuestion.language === 'English' && (
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
                    प्रश्न पाठ (Question Text) <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={hindiQuestion.text}
                    onChange={(e) => updateHindiQuestion("text", e.target.value)}
                    onKeyUp={(e) => handleHindiKeyUp(e, "text", e.target.value)}
                    placeholder="हिंदी में टाइप करें या English words टाइप करके हर word के बाद Space दबाएं..."
                    className={`w-full p-3 border ${fieldErrors.hindi.text || textErrors.hindi ? 'border-red-500 bg-red-50' : 'border-gray-200'} rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all resize-none`}
                    rows="3"
                    disabled={editingQuestion && editingQuestion.language === 'English'}
                    required={!editingQuestion || editingQuestion.language === 'Hindi'}
                  />
                  {(textErrors.hindi || fieldErrors.hindi.text) && (
                    <p className="text-red-500 text-xs mt-1">प्रश्न पाठ आवश्यक है</p>
                  )}
                </div>
                <div className="mt-2">
                  <button
                    type="button"
                    onClick={() => openEquationEditor("Hindi", "text", null, hindiQuestion.text)}
                    className="text-sm bg-orange-100 text-orange-800 px-3 py-1 rounded-md hover:bg-orange-200"
                  >
                    Equation
                  </button>
                </div>

                {/* Hindi Options */}
                <div className="space-y-3 mb-6">
                  <label className="block text-sm font-medium text-gray-800">
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
                            if (!editingQuestion || editingQuestion.language === 'Hindi') {
                              setEnglishQuestion((prev) => ({
                                ...prev,
                                correct_option: index,
                              }));
                            }
                          }}
                          className="w-4 h-4 text-orange-600 focus:ring-orange-500"
                          disabled={editingQuestion && editingQuestion.language === 'English'}
                        />
                      </div>
                      <div className="flex-1 relative">
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => updateHindiQuestion("options", e.target.value, index)}
                          onKeyUp={(e) => handleHindiKeyUp(e, "options", e.target.value, index)}
                          placeholder={`विकल्प ${index + 1} (English word + Space for translation)`}
                          className={`w-full p-2 border ${fieldErrors.hindi.options[index] ? 'border-red-500 bg-red-50' : 'border-gray-200'} rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all pr-10`}
                          disabled={editingQuestion && editingQuestion.language === 'English'}
                          required={!editingQuestion || editingQuestion.language === 'Hindi'}
                        />
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs font-medium text-gray-500 bg-gray-100 w-5 h-5 rounded-full flex items-center justify-center">
                          {String.fromCharCode(65 + index)}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() =>
                            openEquationEditor("Hindi", "options", index, hindiQuestion.options[index])
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
                    समाधान/स्पष्टीकरण (Solution/Explanation) <span className="text-gray-500">(Optional)</span>
                  </label>
                  <textarea
                    value={hindiQuestion.solution}
                    onChange={(e) => updateHindiQuestion("solution", e.target.value)}
                    onKeyUp={(e) => handleHindiKeyUp(e, "solution", e.target.value)}
                    placeholder="हिंदी में solution टाइप करें या English words टाइप करके हर word के बाद Space दबाएं (optional)..."
                    className={`w-full p-3 border ${fieldErrors.hindi.solution ? 'border-red-500 bg-red-50' : 'border-gray-200'} rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all resize-none`}
                    rows="3"
                    disabled={editingQuestion && editingQuestion.language === 'English'}
                  />
                </div>
                <div className="mt-2">
                  <button
                    type="button"
                    onClick={() => openEquationEditor("Hindi", "solution", null, hindiQuestion.solution)}
                    className="text-sm bg-orange-100 text-orange-800 px-3 py-1 rounded-md hover:bg-orange-200"
                  >
                    Equation
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Question Preview */}
          <div className="mt-6 sm:mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            <QuestionPreview
              question={englishQuestion}
              activeLanguage="English"
            />
            <QuestionPreview question={hindiQuestion} activeLanguage="Hindi" />
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
              disabled={isSubmitting || !canSubmitForm()}
              className="px-4 py-2 sm:px-6 sm:py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-75 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <FiLoader className="w-4 h-4 sm:w-5 sm:h-5 animate-spin mr-2" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>{editingQuestion ? 'Update Question' : 'Add Question'}</span>
              )}
            </button>
          </div>
          {/* Error message when form cannot be submitted - Updated message */}
          {!isSubmitting && !canSubmitForm() && !editingQuestion && (
            <div className="mt-2 text-center">
              <p className="text-sm text-red-500">
                Please complete both English and Hindi questions with all required fields
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

            {/* Add LaTeX Toolbar */}
            <LatexToolbar />

            <Suspense fallback={<div className="p-4">Loading editor...</div>}>
              <EqErrorBoundary
                key={`eqb-${eqModalKey}`}
                fallbackValue={eqEditorValue}
                onChange={setEqEditorValue}
                onSave={() => saveEquationToField(eqEditorValue)}
                onCancel={closeEquationEditor}
              >
                <EquationEditor
                  key={`eq-${eqModalKey}`}
                  value={eqEditorValue}
                  latex={eqEditorValue}
                  onChange={(val) => setEqEditorValue(val)}
                  autoCommands="pi theta sqrt sum prod alpha beta gamma rho frac pm"
                  autoOperatorNames="sin cos tan log ln exp"
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
  );
};

export default QuestionModal;