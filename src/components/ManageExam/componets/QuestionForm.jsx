import React, { useEffect, useState } from "react";
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

  const handleManualTranslate = async () => {
    setIsTranslating(true);

    try {
      if (!englishQuestion.text.trim()) {
        toast.error("Please enter the question text in English first");
        return;
      }

      console.log("Starting manual translation...");
      console.log("Source English Question:", englishQuestion);

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

      console.log("Translation Results:", {
        translatedText,
        translatedSolution,
        translatedOptions,
      });

      // Update Hindi question with all translated content
      setHindiQuestion((prev) => ({
        ...prev,
        text: translatedText || "",
        solution: translatedSolution || englishQuestion.correct_option,
        options: translatedOptions.map((opt) => opt || ""),
        correct_option: englishQuestion.correct_option,
      }));

      toast.success("Successfully translated to Hindi");
      console.log("Manual translation completed successfully");
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
        toast.success("Translation completed");
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
    // First update the field with current value
    updateHindiQuestion(field, value, optionIndex);

    // Check if space or enter was pressed
    if ((e.key === " " || e.key === "Enter") && value.trim()) {
      const lastWord = getLastWord(value);

      // Check if the last word is in English and needs translation
      if (lastWord && isEnglishWord(lastWord)) {
        setIsTranslating(true);

        try {
          // Translate only the last word
          const translatedWord = await translateText(
            lastWord,
            "English",
            "Hindi"
          );

          // Replace the last English word with Hindi translation
          const updatedText = replaceLastWord(value, translatedWord);

          // Update the field with the translated word
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

          // Show subtle success feedback (optional)
          console.log(`Translated: ${lastWord} → ${translatedWord}`);
        } catch (error) {
          console.error("Word translation failed:", error);
          // Don't show error toast for individual word failures to avoid spam
          console.log("Failed to translate word:", lastWord);
        } finally {
          setIsTranslating(false);
        }
      }
    }
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
                    placeholder="Enter your question in English..."
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                    rows="3"
                  />
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
                          placeholder={`Option ${index + 1}`}
                          className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all pr-10"
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
                  <label className="block text-sm font-semibold text-gray-800">
                    Solution/Explanation
                  </label>
                  <textarea
                    value={englishQuestion.solution}
                    onChange={(e) =>
                      updateEnglishQuestion("solution", e.target.value)
                    }
                    onKeyUp={(e) => handleKeyUp(e, "solution", e.target.value)}
                    placeholder="Provide detailed explanation in English..."
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                    rows="3"
                  />
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
    </div>
  );
};

export default QuestionForm;
