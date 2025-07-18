import React, { useState, useEffect } from 'react';
import { FiX, FiGlobe, FiRefreshCw, FiLoader } from 'react-icons/fi';
import { translateText } from '../../../services/apiService';
import { toast } from 'react-toastify';
import QuestionPreview from './QuestionPreview';

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

  const handleManualTranslate = async () => {
    setIsTranslating(true);

    try {
      if (!englishQuestion.text.trim()) {
        toast.error("Please enter the question text in English first");
        return;
      }

      // Prepare translation requests for all fields
      const translationPromises = [
        translateText(englishQuestion.text, "English", "Hindi"),
        englishQuestion.solution.trim()
          ? translateText(englishQuestion.solution, "English", "Hindi")
          : Promise.resolve(""),
        ...englishQuestion.options.map((option) =>
          option.trim()
            ? translateText(option, "English", "Hindi")
            : Promise.resolve("")
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

      toast.success("Successfully translated to Hindi");
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
      // Create structured form data for both languages
      const formData = {
        english: {
          language: "English",
          text: englishQuestion.text.trim(),
          solution: englishQuestion.solution.trim(),
          options: englishQuestion.options.map(opt => opt.trim()),
          correct_option: englishQuestion.correct_option + 1
        },
        hindi: {
          language: "Hindi",
          text: hindiQuestion.text.trim(),
          solution: hindiQuestion.solution.trim(),
          options: hindiQuestion.options.map(opt => opt.trim()),
          correct_option: hindiQuestion.correct_option + 1
        }
      };

      // If editing, handle single language edits
      if (editingQuestion) {
        // Keep only the language being edited if we're in edit mode
        if (editingQuestion.language === 'English') {
          delete formData.hindi;
        } else if (editingQuestion.language === 'Hindi') {
          delete formData.english;
        }
      } else {
        // For new questions, filter out empty languages
        if (!formData.english.text.trim() || !formData.english.options.some(opt => opt.trim())) {
          delete formData.english;
        }
        if (!formData.hindi.text.trim() || !formData.hindi.options.some(opt => opt.trim())) {
          delete formData.hindi;
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

  const validateForm = () => {
    // If editing, validate only the language being edited
    if (editingQuestion) {
      const isEditingEnglish = editingQuestion.language === 'English';
      const questionToValidate = isEditingEnglish ? englishQuestion : hindiQuestion;
      
      if (!questionToValidate.text.trim()) {
        toast.error(`Please enter the question text in ${isEditingEnglish ? 'English' : 'Hindi'}`);
        return false;
      }
      
      if (!questionToValidate.options.some(opt => opt.trim())) {
        toast.error(`Please enter at least one option in ${isEditingEnglish ? 'English' : 'Hindi'}`);
        return false;
      }
      
      const correctOptionText = questionToValidate.options[questionToValidate.correct_option];
      if (!correctOptionText || !correctOptionText.trim()) {
        toast.error(`The selected correct answer for ${isEditingEnglish ? 'English' : 'Hindi'} question cannot be empty`);
        return false;
      }
      
      return true;
    }
    
    // For new questions, validate that at least one language is complete
    const hasEnglishContent = englishQuestion.text.trim() && 
      englishQuestion.options.some(opt => opt.trim());
    
    const hasHindiContent = hindiQuestion.text.trim() && 
      hindiQuestion.options.some(opt => opt.trim());
    
    if (!hasEnglishContent && !hasHindiContent) {
      toast.error("Please fill at least one complete question (English or Hindi)");
      return false;
    }
    
    // If English content exists, validate the correct option
    if (hasEnglishContent) {
      const correctOption = englishQuestion.options[englishQuestion.correct_option];
      if (!correctOption || !correctOption.trim()) {
        toast.error("The selected correct answer for English question cannot be empty");
        return false;
      }
    }
    
    // If Hindi content exists, validate the correct option
    if (hasHindiContent) {
      const correctOption = hindiQuestion.options[hindiQuestion.correct_option];
      if (!correctOption || !correctOption.trim()) {
        toast.error("The selected correct answer for Hindi question cannot be empty");
        return false;
      }
    }
    
    return true;
  };

  const handleKeyUp = async (e, field, value, optionIndex = null) => {
    // First update English question without translation
    updateEnglishQuestion(field, value, optionIndex);

    if ((e.key === " " || e.key === "Enter") && value.trim()) {
      setIsTranslating(true);
      try {
        const response = await translateText(value, "English", "Hindi");

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

  // Handle Hindi field real-time word-by-word translation
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

          {/* Side-by-Side Forms */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            {/* English Form */}
            <div className="space-y-6">
              <div className={`bg-blue-50 p-4 rounded-xl border-2 ${editingQuestion && editingQuestion.language === 'Hindi' ? 'border-gray-200 opacity-60' : 'border-blue-200'}`}>
                <h2 className="text-lg sm:text-xl font-bold text-blue-800 mb-4 flex items-center">
                  🇺🇸 English Question 
                  {editingQuestion && editingQuestion.language === 'Hindi' && (
                    <span className="ml-2 text-xs sm:text-sm font-normal text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
                      View Only
                    </span>
                  )}
                </h2>

                {/* English Question Text */}
                <div className="space-y-3 mb-6">
                  <label className="block text-sm font-medium text-gray-800">
                    Question Text
                  </label>
                  <textarea
                    value={englishQuestion.text}
                    onChange={(e) => updateEnglishQuestion("text", e.target.value)}
                    onKeyUp={(e) => handleKeyUp(e, "text", e.target.value)}
                    placeholder="Enter your question in English..."
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                    rows="3"
                    disabled={editingQuestion && editingQuestion.language === 'Hindi'}
                  />
                </div>

                {/* English Options */}
                <div className="space-y-3 mb-6">
                  <label className="block text-sm font-medium text-gray-800">
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
                          className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all pr-10"
                          disabled={editingQuestion && editingQuestion.language === 'Hindi'}
                        />
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs font-medium text-gray-500 bg-gray-100 w-5 h-5 rounded-full flex items-center justify-center">
                          {String.fromCharCode(65 + index)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* English Solution */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-800">
                    Solution/Explanation
                  </label>
                  <textarea
                    value={englishQuestion.solution}
                    onChange={(e) => updateEnglishQuestion("solution", e.target.value)}
                    onKeyUp={(e) => handleKeyUp(e, "solution", e.target.value)}
                    placeholder="Provide detailed explanation in English..."
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                    rows="3"
                    disabled={editingQuestion && editingQuestion.language === 'Hindi'}
                  />
                </div>
              </div>
            </div>

            {/* Hindi Form */}
            <div className="space-y-6">
              <div className={`bg-orange-50 p-4 rounded-xl border-2 ${editingQuestion && editingQuestion.language === 'English' ? 'border-gray-200 opacity-60' : 'border-orange-200'}`}>
                <h2 className="text-lg sm:text-xl font-bold text-orange-800 mb-4 flex items-center">
                  🇮🇳 हिंदी प्रश्न (Hindi Question)
                  {editingQuestion && editingQuestion.language === 'English' && (
                    <span className="ml-2 text-xs sm:text-sm font-normal text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full">
                      View Only
                    </span>
                  )}
                </h2>

                {/* Hindi Question Text */}
                <div className="space-y-3 mb-6">
                  <label className="block text-sm font-medium text-gray-800">
                    प्रश्न पाठ (Question Text)
                  </label>
                  <textarea
                    value={hindiQuestion.text}
                    onChange={(e) => updateHindiQuestion("text", e.target.value)}
                    onKeyUp={(e) => handleHindiKeyUp(e, "text", e.target.value)}
                    placeholder="हिंदी में टाइप करें या English words टाइप करके हर word के बाद Space दबाएं..."
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all resize-none"
                    rows="3"
                    disabled={editingQuestion && editingQuestion.language === 'English'}
                  />
                </div>

                {/* Hindi Options */}
                <div className="space-y-3 mb-6">
                  <label className="block text-sm font-medium text-gray-800">
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
                          className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all pr-10"
                          disabled={editingQuestion && editingQuestion.language === 'English'}
                        />
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs font-medium text-gray-500 bg-gray-100 w-5 h-5 rounded-full flex items-center justify-center">
                          {String.fromCharCode(65 + index)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Hindi Solution */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-800">
                    समाधान/स्पष्टीकरण (Solution/Explanation)
                  </label>
                  <textarea
                    value={hindiQuestion.solution}
                    onChange={(e) => updateHindiQuestion("solution", e.target.value)}
                    onKeyUp={(e) => handleHindiKeyUp(e, "solution", e.target.value)}
                    placeholder="हिंदी में solution टाइप करें या English words टाइप करके हर word के बाद Space दबाएं..."
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all resize-none"
                    rows="3"
                    disabled={editingQuestion && editingQuestion.language === 'English'}
                  />
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
              disabled={isSubmitting}
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
        </div>
      </div>
    </div>
  );
};

export default QuestionModal;