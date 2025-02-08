const ExamQuestionForm = ({ examSet, question, setQuestion, onSubmit, onBack }) => {
    const handleOptionChange = (index, value) => {
      const newOptions = [...question.options];
      newOptions[index] = value;
      setQuestion({...question, options: newOptions});
    };
  
    return (
      <div>
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">{examSet?.title}</h1>
            <p className="text-gray-500">
              {examSet?.classCategory} | {examSet?.level} | {examSet?.subject}
            </p>
          </div>
          <button
            onClick={onBack}
            className="bg-gray-200 px-4 py-2 rounded-md hover:bg-gray-300"
          >
            Back to Exam Sets
          </button>
        </div>
  
        <form onSubmit={onSubmit} className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold mb-6">Add Question to Exam Set</h2>
  
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Question</label>
            <textarea
              value={question.question}
              onChange={(e) => setQuestion({...question, question: e.target.value})}
              className="w-full p-2 border rounded-md h-24"
              placeholder="Enter your question here..."
              required
            />
          </div>
  
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            {question.options.map((option, index) => (
              <div key={index} className="flex items-center">
                <span className="mr-2 font-medium">{index + 1}.</span>
                <input
                  type="text"
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  className="w-full p-2 border rounded-md"
                  placeholder={`Option ${index + 1}`}
                  required
                />
              </div>
            ))}
          </div>
  
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Correct Answer</label>
            <select
              value={question.correctAnswer}
              onChange={(e) => setQuestion({...question, correctAnswer: e.target.value})}
              className="w-full p-2 border rounded-md"
              required
            >
              <option value="">Select Correct Answer</option>
              {question.options.map((option, index) => (
                <option key={index} value={option} disabled={!option}>
                  Option {index + 1} {!option && '(Please fill option first)'}
                </option>
              ))}
            </select>
          </div>
  
          <div className="mt-6 flex justify-end gap-4">
            <button
              type="button"
              onClick={onBack}
              className="px-4 py-2 border rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Add Question
            </button>
          </div>
        </form>
  
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-6">
            Exam Questions ({examSet?.questions?.length})
          </h2>
          {examSet?.questions?.map((q, index) => (
            <div key={q.id} className="mb-6 border-b pb-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-medium text-lg">Question {index + 1}</h3>
              </div>
              <p className="mb-4">{q.question}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {q?.options?.map((option, i) => (
                  <div
                    key={i}
                    className={`p-2 rounded-md ${
                      option === q.correctAnswer
                        ? 'bg-green-100 border border-green-300'
                        : 'bg-gray-50'
                    }`}
                  >
                    <span className="font-medium mr-2">{i + 1}.</span>
                    {option}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

export default ExamQuestionForm;