import { useState, useEffect, useRef } from 'react'
import { FiX, FiBook, FiMapPin, FiCheck } from 'react-icons/fi'

const subjectsList = [
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'English',
  'History',
  'Computer Science',
  'Economics',
]

const TeacherSignupModal = () => {
  const [showModal, setShowModal] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [teacherType, setTeacherType] = useState('')
  const [selectedSubjects, setSelectedSubjects] = useState([])
  const [pincode, setPincode] = useState('')
  const modalRef = useRef(null)

  const teacherTypes = [
    {
      type: 'school',
      title: 'School Teacher',
      description: 'Teaching in a school environment',
    },
    {
      type: 'coaching',
      title: 'Coaching Teacher',
      description: 'Teaching in a coaching institute',
    },
    {
      type: 'personal',
      title: 'Personal Tutor',
      description: 'Private one-on-one tutoring',
    },
  ]

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setShowModal(false)
        resetForm()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const resetForm = () => {
    setCurrentStep(0)
    setTeacherType('')
    setSelectedSubjects([])
    setPincode('')
  }

  const handleSubjectToggle = (subject) => {
    setSelectedSubjects(prev =>
      prev.includes(subject)
        ? prev.filter(s => s !== subject)
        : [...prev, subject]
    )
  }

  const handleSubmit = () => {
    // Handle form submission here
    console.log({
      teacherType,
      selectedSubjects,
      pincode,
    })
    setShowModal(false)
    resetForm()
  }

  const StepIndicator = () => (
    <div className="flex justify-center mb-8">
      {[0, 1, 2].map((step) => (
        <div
          key={step}
          className={`w-3 h-3 rounded-full mx-1 ${
            step === currentStep ? 'bg-teal-500' : 'bg-gray-300'
          }`}
        />
      ))}
    </div>
  )

  return (
    <div>
      <button
        onClick={() => setShowModal(true)}
        className="bg-teal-500 text-white px-6 py-2 rounded-lg hover:bg-teal-600 transition-colors"
      >
        Become a Teacher
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div
            ref={modalRef}
            className="bg-white rounded-xl w-full max-w-lg overflow-hidden"
          >
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-semibold">Teacher Registration</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FiX size={24} />
              </button>
            </div>

            <div className="p-6">
              <StepIndicator />

              <div
                className="flex transition-transform duration-300"
                style={{ transform: `translateX(-${currentStep * 100}%)` }}
              >
                {/* Step 1: Teacher Type Selection */}
                <div className="min-w-full px-4">
                  <h3 className="text-lg font-medium mb-6">
                    Select Your Teaching Type
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {teacherTypes.map((type) => (
                      <button
                        key={type.type}
                        onClick={() => {
                          setTeacherType(type.type)
                          setCurrentStep(1)
                        }}
                        className={`p-4 rounded-lg border-2 ${
                          teacherType === type.type
                            ? 'border-teal-500 bg-teal-50'
                            : 'border-gray-200 hover:border-teal-300'
                        } transition-all`}
                      >
                        <div className="text-teal-500 mb-2">
                          <FiBook size={24} />
                        </div>
                        <h4 className="font-medium mb-1">{type.title}</h4>
                        <p className="text-sm text-gray-600">
                          {type.description}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Step 2: Subject Selection and Pincode */}
                <div className="min-w-full px-4">
                  <h3 className="text-lg font-medium mb-6">
                    Teaching Details
                  </h3>
                  <div className="mb-6">
                    <label className="block text-sm font-medium mb-3">
                      Select Subjects (Multiple)
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {subjectsList.map((subject) => (
                        <button
                          key={subject}
                          onClick={() => handleSubjectToggle(subject)}
                          className={`flex items-center justify-between p-3 rounded-lg border ${
                            selectedSubjects.includes(subject)
                              ? 'border-teal-500 bg-teal-50'
                              : 'border-gray-200 hover:border-teal-300'
                          }`}
                        >
                          <span>{subject}</span>
                          {selectedSubjects.includes(subject) && (
                            <FiCheck className="text-teal-500" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium mb-2">
                      Pincode
                    </label>
                    <input
                      type="text"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      placeholder="Enter your area pincode"
                    />
                  </div>

                  <div className="flex justify-between">
                    <button
                      onClick={() => setCurrentStep(0)}
                      className="text-gray-600 hover:text-gray-800"
                    >
                      Back
                    </button>
                    <button
                      onClick={() => setCurrentStep(2)}
                      className="bg-teal-500 text-white px-6 py-2 rounded-lg hover:bg-teal-600 disabled:bg-gray-300"
                      disabled={!selectedSubjects.length || !pincode}
                    >
                      Continue
                    </button>
                  </div>
                </div>

                {/* Step 3: Confirmation */}
                <div className="min-w-full px-4">
                  <h3 className="text-lg font-medium mb-6">
                    Confirm Your Details
                  </h3>
                  <div className="mb-6 bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center mb-4">
                      <FiBook className="text-teal-500 mr-2" />
                      <span className="capitalize">{teacherType} Teacher</span>
                    </div>
                    <div className="flex items-center mb-4">
                      <FiBook className="text-teal-500 mr-2" />
                      <span>{selectedSubjects.join(', ')}</span>
                    </div>
                    <div className="flex items-center">
                      <FiMapPin className="text-teal-500 mr-2" />
                      <span>{pincode}</span>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <button
                      onClick={() => setCurrentStep(1)}
                      className="text-gray-600 hover:text-gray-800"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleSubmit}
                      className="bg-teal-500 text-white px-6 py-2 rounded-lg hover:bg-teal-600"
                    >
                      Submit Application
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TeacherSignupModal