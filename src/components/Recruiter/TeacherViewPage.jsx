import React, { useEffect, useState, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaGraduationCap, FaBriefcase, FaLightbulb, FaChalkboardTeacher, FaMapMarkerAlt, FaUserCog, FaBuilding, FaStar, FaClock } from "react-icons/fa";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { fetchSingleTeacherById } from "../../services/apiService";

export default function TeacherViewPageFull() {
  const { id } = useParams();
  const navigate = useNavigate();
  console.log('Fetched teacher data:', id);
  const [teacher, setTeacher] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("qualifications");
  const [stickyTabs, setStickyTabs] = useState(false);
  const tabsRef = useRef(null);

  const [openRequestModal, setOpenRequestModal] = useState(false);
  const [classCategories, setClassCategories] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [selectedClassCategory, setSelectedClassCategory] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [modalLoading, setModalLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

 
  const requestTeacher = async (payload) => {
    await new Promise((r) => setTimeout(r, 700));
    return { success: true, job_id: 'JOB-12345' };
  };
  const maskPhoneNumber = (phone) => {
    if (!phone || phone.length < 6) return phone;
    return phone.slice(0, 4) + '****' + phone.slice(-2);
  };
  const maskEmail = (email) => {
    if (!email) return email;
    const [local, domain] = email.split('@');
    if (!domain || local.length <= 2) return email;
    return local.slice(0, 2) + '***@' + domain;
  };

  const formatDate = (value, { dateOnly } = { dateOnly: false }) => {
    if (!value) return '';
    try {
      const d = new Date(value);
      if (isNaN(d)) return String(value);
      if (dateOnly) {
        return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
      }
      return d.toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
    } catch (e) {
      return String(value);
    }
  };
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);
        const data = await fetchSingleTeacherById(id);
        if (!mounted) return;
        const teacherData = data?.teacher ? data.teacher : data;
        const attemptsData = data?.attempts ? data.attempts : [];

        setTeacher(teacherData || {});
        setAttempts(attemptsData || []);
        if (teacherData?.preferences?.length > 0) {
          const pref = teacherData.preferences[0];
          setClassCategories(pref.class_category || []);
          const subjFromCategories = (pref.class_category || [])
            .flatMap((c) => c.subjects || []);
          const prefered = pref.prefered_subject || subjFromCategories;
          setSubjects(prefered || []);
        }
      } catch (err) {
        setError(err?.message || 'Failed to load teacher');
      } finally {
        setLoading(false);
      }
    };

    load();

    const handleScroll = () => {
      if (tabsRef.current) {
        const tabsPosition = tabsRef.current.getBoundingClientRect().top;
        setStickyTabs(tabsPosition <= 0);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => { mounted = false; window.removeEventListener('scroll', handleScroll); };
  }, [id]);
  const handleRequestTeacher = () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      toast.info("Please login to request a teacher");
      navigate("/signin");
      return;
    }
    setOpenRequestModal(true);
  };

  const handleSubmitRequest = async () => {
    if (!selectedClassCategory || !selectedSubject) {
      toast.error('Please select both class category and subject');
      return;
    }
    try {
      setModalLoading(true);
      const payload = { teacher_id: teacher.id, class_category: [parseInt(selectedClassCategory)], subject: [parseInt(selectedSubject)] };
      const res = await requestTeacher(payload);
      if (res?.success) {
        setOpenRequestModal(false);
        setSelectedClassCategory('');
        setSelectedSubject('');
        setSuccess(true);
        toast.success('Teacher request sent successfully!');
      } else {
        throw new Error('Request failed');
      }
    } catch (err) {
      toast.error(`Failed to request teacher: ${err?.message || 'Unknown'}`);
    } finally {
      setModalLoading(false);
    }
  };
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4 p-8">
        <div className="h-8 w-48 bg-gray-200 rounded mx-auto animate-pulse"></div>
        <div className="h-64 w-64 rounded-full bg-gray-200 mx-auto animate-pulse"></div>
        <div className="h-6 w-96 bg-gray-200 rounded mx-auto animate-pulse"></div>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="bg-red-50 text-red-700 p-6 rounded">Error: {error}</div>
    </div>
  );
  const jobLocations = (() => {
    if (!teacher) return [];
    if (teacher.jobpreferencelocation) {
      if (Array.isArray(teacher.jobpreferencelocation) && teacher.jobpreferencelocation.length) {
        return teacher.jobpreferencelocation.filter(loc => !(loc && loc.address_type && ['current', 'permanent'].includes(String(loc.address_type).toLowerCase())));
      }
      return [teacher.jobpreferencelocation];
    }
    const prefLocations = (teacher.preferences || [])
      .flatMap(p => {
        const candidates = [];
        if (p.preferred_job_locations && Array.isArray(p.preferred_job_locations)) candidates.push(...p.preferred_job_locations);
        if (p.job_pref_locations && Array.isArray(p.job_pref_locations)) candidates.push(...p.job_pref_locations);
        if (p.job_pref_location) candidates.push(...(Array.isArray(p.job_pref_location) ? p.job_pref_location : [p.job_pref_location]));
        if (p.job_locations && Array.isArray(p.job_locations)) candidates.push(...p.job_locations);
        if (p.job_location) candidates.push(...(Array.isArray(p.job_location) ? p.job_location : [p.job_location]));
        if (p.preferred_locations && Array.isArray(p.preferred_locations)) candidates.push(...p.preferred_locations);
        if (p.job_preferences && Array.isArray(p.job_preferences)) candidates.push(...p.job_preferences);
        return candidates;
      })
      .filter(Boolean)
      .filter(loc => !(loc && loc.address_type && ['current', 'permanent'].includes(String(loc.address_type).toLowerCase())));

    if (prefLocations.length) return prefLocations;
    if (Array.isArray(teacher.job_locations) && teacher.job_locations.length) {
      return teacher.job_locations.filter(loc => !(loc && loc.address_type && ['current', 'permanent'].includes(String(loc.address_type).toLowerCase())));
    }
    if (Array.isArray(teacher.joblocations) && teacher.joblocations.length) {
      return teacher.joblocations.filter(loc => !(loc && loc.address_type && ['current', 'permanent'].includes(String(loc.address_type).toLowerCase())));
    }
    if (Array.isArray(teacher.teachersaddress) && teacher.teachersaddress.length) {
      const others = teacher.teachersaddress.filter(addr => !(addr && addr.address_type && ['current', 'permanent'].includes(String(addr.address_type).toLowerCase())));
      return others;
    }

    return [];
  })();

  return (
    <div className="min-h-screen bg-background text-text">
      <ToastContainer position="top-right" />
      {/* Top bar / Breadcrumb */}
      <header className="bg-white border-b shadow-sm">
        <div className=" mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/recruiter" className="inline-flex items-center text-primary hover:text-accent">
              <FaArrowLeft className="mr-2" /> Back
            </Link>
            <h1 className="text-lg font-semibold">Teacher Profile</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-sm text-secondary">Logged in as <span className="font-medium">You</span></div>
            {/* action button small */}
            <button onClick={handleRequestTeacher} disabled={success} className="px-3 py-2 rounded-full bg-primary text-white hover:bg-primary/90 disabled:opacity-50">{success ? 'Requested' : 'Request'}</button>
          </div>
        </div>
      </header>
      <main className=" mx-auto mt-5 gap-6">
        {/* Left: Profile card */}
        <section className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-6 flex flex-col md:flex-row items-center md:items-start gap-6">
              <div className="w-36 h-36 md:w-48 md:h-48 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                <img src={teacher.profiles?.profile_picture || '/images/profile.jpg'} alt={`${teacher.Fname} ${teacher.Lname}`} className="w-full h-full object-cover" />
              </div>

              <div className="flex-1 w-full">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">{teacher.Fname} {teacher.Lname}</h2>
                    <p className="text-sm text-secondary mt-1">{teacher.profiles?.bio}</p>

                    {/* <div className="mt-3 flex flex-wrap gap-3 items-center">
                      <div className="flex items-center gap-2 text-sm text-secondary">
                        <FaStar className="" /> <span className="font-semibold">{teacher.ratings || '—'}</span>
                        <span className="text-xs">({teacher.reviews_count || 0} reviews)</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-secondary">
                        <FaClock /> <span className="text-xs">Next slot: {new Date(teacher.availability?.next_available).toLocaleString()}</span>
                      </div>
                    </div> */}

                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-secondary">
                      <div><span className="font-medium">Email: </span>{maskEmail(teacher.email)}</div>
                      <div><span className="font-medium">Phone: </span>{maskPhoneNumber(teacher.profiles?.phone_number)}</div>
                      <div className="col-span-2"><span className="font-medium">Location: </span>{teacher.teachersaddress?.[0] ? `${teacher.teachersaddress[0].area}, ${teacher.teachersaddress[0].district}, ${teacher.teachersaddress[0].state} - ${teacher.teachersaddress[0].pincode}` : '—'}</div>
                    </div>
                  </div>

                  {/* Desktop CTA */}
                  <div className="hidden md:flex flex-col items-end gap-3">
                    <div className="bg-primary/5 text-primary px-4 py-2 rounded-lg font-semibold">Hire: {teacher.apply ? teacher.apply[0]?.salary_expectation : "N/A"}/{(teacher.apply) ? teacher.apply[0]?.salary_type : "N/A"}</div>
                    <button onClick={handleRequestTeacher} disabled={isSubmitting || success} className="px-4 py-2 rounded-full bg-primary text-white hover:bg-primary/95 disabled:opacity-50">
                      {isSubmitting ? 'Submitting...' : success ? 'Requested' : 'Request Teacher'}
                    </button>
                  </div>
                </div>

                {/* Tags (skills) */}
                <div className="mt-4 flex flex-wrap gap-2">
                  {teacher.teacherskill?.length > 0 ? teacher.teacherskill.map(s => (
                    <span key={s.skill.id} className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold">{s.skill.name}</span>
                  )) : <span className="text-secondary italic">No skills listed</span>}
                </div>

              </div>
            </div>

            {/* tabs (mobile sticky) */}
            <div ref={tabsRef} className={`${stickyTabs ? 'sticky top-16 z-30' : ''} bg-white border-t`}> 
              <div className="flex overflow-x-auto scrollbar-hide">
                {[
                  { key: 'qualifications', label: 'Qualifications', icon: <FaGraduationCap /> },
                  { key: 'experience', label: 'Experience', icon: <FaBriefcase /> },
                  { key: 'attempts', label: 'Attempts', icon: <FaStar /> },
                  { key: 'joblocations', label: 'Job Locations', icon: <FaMapMarkerAlt /> },
                  { key: 'skills', label: 'Skills', icon: <FaLightbulb /> },
                  { key: 'preferences', label: 'Preferences', icon: <FaChalkboardTeacher /> },
                  { key: 'addresses', label: 'Addresses', icon: <FaMapMarkerAlt /> },
                  { key: 'jobpreferences', label: 'Job Prefs', icon: <FaBuilding /> }
                ].map(tab => (
                  <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`px-4 py-3 whitespace-nowrap flex items-center gap-2 text-sm font-semibold ${activeTab === tab.key ? 'text-primary border-b-2 border-primary' : 'text-secondary hover:text-text'}`}>
                    {tab.icon}
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* tab canvas */}
            <div className="p-6 border-t bg-background">
              {activeTab === 'qualifications' && (
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold flex items-center gap-2"><FaGraduationCap /> Qualifications</h3>
                  {teacher.teacherqualifications?.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {teacher.teacherqualifications.map((q, i) => (
                        <div key={i} className="p-4 bg-white rounded-lg border">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-semibold">{q.qualification?.name}</h4>
                              <p className="text-sm text-secondary">{q.institution}</p>
                            </div>
                            <div className="text-xs text-secondary">
                              {q.year_of_passing}
                            </div>
                          </div>
                          {q.subjects && (
                            <div className="mt-3 flex flex-wrap gap-2">
                              {q.subjects.map((s, idx) => (
                                <span key={idx} className="px-2 py-1 rounded bg-gray-100 text-gray-700 text-xs">{s.name}: {s.marks}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : <p className="text-secondary italic">No qualification information available</p>}
                </div>
              )}

              {activeTab === 'experience' && (
                <div>
                  <h3 className="text-xl font-semibold flex items-center gap-2"><FaBriefcase /> Experience</h3>
                  {teacher.teacherexperiences?.length > 0 ? (
                    <div className="space-y-3 mt-4">
                      {teacher.teacherexperiences.map((exp, idx) => (
                        <div key={idx} className="p-4 bg-white rounded-lg border">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-semibold">{exp.institution}</h4>
                              <p className="text-sm text-secondary">Role: {exp.role?.jobrole_name}</p>
                            </div>
                            <div className="text-sm text-secondary">{exp.start_date ? formatDate(exp.start_date, { dateOnly: true }) : ''} - {exp.end_date ? formatDate(exp.end_date, { dateOnly: true }) : 'Present'}</div>
                          </div>
                          {exp.achievements && <p className="text-secondary mt-2">{exp.achievements}</p>}
                        </div>
                      ))}
                    </div>
                  ) : <p className="text-secondary italic">No experience available</p>}
                </div>
              )}

              {activeTab === 'attempts' && (
                <div>
                  <h3 className="text-xl font-semibold flex items-center gap-2"><FaStar /> Exam Attempts</h3>
                  {attempts?.length > 0 ? (
                    <div className="mt-4 space-y-4">
                      {attempts.map((a, idx) => (
                        <div key={idx} className="p-4 bg-white rounded-lg border">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-semibold">{a.exam?.name || a.exam_name}</h4>
                              <div className="text-sm text-secondary mt-1">Score: {a.correct_answer}/{a.total_question} • <span></span>%</div>
                              <div className="text-sm text-secondary">Language: {a.language || '—'}</div>
                            </div>
                            <div className="text-sm text-secondary text-right">
                              {a.created_at ? formatDate(a.created_at) : ''}
                            </div>
                          </div>

                          {a.interviews && a.interviews.length > 0 && (
                            <div className="mt-3">
                              <h5 className="font-semibold text-sm">Interviews</h5>
                              <div className="mt-2 space-y-2">
                                {a.interviews
                                  .filter(iv => String(iv.status || '').toLowerCase() === 'fulfilled')
                                  .map((iv) => {
                                    const score = iv.grade;
                                    const total = 10
                                    const percentage = (typeof score === 'number' && typeof total === 'number' && total > 0) ? Math.round((score / total) * 100) : null;
                                    const passed = percentage !== null ? percentage >= 60 : null;

                                    return (
                                      <div key={iv.id} className="p-2 bg-gray-50 rounded flex items-center justify-between">
                                        <div className="text-sm">
                                          <div className="flex items-center gap-3">
                                            <div>Status: <span className="font-medium">{iv.status}</span></div>
                                            <div className="text-xs text-secondary">Attempt: {iv.attempt}</div>
                                          </div>
                                          {percentage !== null && (
                                            <div className="mt-1 text-sm">
                                              <span className="font-medium">Score:</span> {score}/{total} • <span className={`px-2 py-0.5 rounded text-xs ${passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{passed ? `Pass (${percentage}%)` : `Fail (${percentage}%)`}</span>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-secondary italic mt-3">No exam attempts found</p>
                  )}
                </div>
              )}

              {activeTab === 'skills' && (
                <div>
                  <h3 className="text-xl font-semibold flex items-center gap-2"><FaLightbulb /> Skills</h3>
                  <div className="mt-3">
                    {teacher.teacherskill?.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {teacher.teacherskill.map(s => <span key={s.skill.id} className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold">{s.skill.name}</span>)}
                      </div>
                    ) : <p className="text-secondary italic">No skills listed</p>}
                  </div>
                </div>
              )}

              {activeTab === 'preferences' && (
                <div>
                  <h3 className="text-xl font-semibold flex items-center gap-2"><FaChalkboardTeacher /> Teaching Preferences</h3>
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {teacher.preferences?.map((pref, pidx) => (
                      <div key={pidx} className="p-4 bg-white rounded-lg border">
                        <div className="mb-3">
                          <h4 className="font-semibold">Job Roles</h4>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {pref.job_role?.map(r => <span key={r.id} className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm">{r.jobrole_name}</span>)}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold">Class Categories</h4>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {pref.class_category?.map(c => <span key={c.id} className="px-3 py-1 rounded-full bg-accent/10 text-accent text-sm">{c.name}</span>)}
                          </div>
                        </div>

                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'addresses' && (
                <div>
                  <h3 className="text-xl font-semibold flex items-center gap-2"><FaMapMarkerAlt /> Addresses</h3>
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {teacher.teachersaddress?.map((addr, i) => (
                      <div key={i} className="p-4 bg-white rounded-lg border">
                        <h4 className="font-semibold capitalize">{addr.address_type} address</h4>
                        <p className="text-sm text-secondary mt-2">{addr.area}, {addr.district}, {addr.state} - {addr.pincode}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'joblocations' && (
                <div>
                  <h3 className="text-xl font-semibold flex items-center gap-2"><FaMapMarkerAlt /> Job Locations</h3>
                  <div className="mt-4 grid grid-cols-1 gap-4">
                    {jobLocations && jobLocations.length > 0 ? (
                      jobLocations.map((loc, i) => (
                        <div key={i} className="p-4 bg-white rounded-lg border">
                          {/* support both string and object shapes */}
                          {typeof loc === 'string' ? (
                            <p className="text-sm text-secondary">{loc}</p>
                          ) : (
                            <>
                              {loc.address_type && <h4 className="font-semibold capitalize">{loc.address_type} location</h4>}
                              {/* render known fields in a friendly order */}
                              <div className="mt-2 text-sm text-secondary space-y-1">
                                {loc.area && <div><span className="font-bold">Area:</span> {loc.area}</div>}
                                {loc.city && <div><span className="font-medium">City:</span> {loc.city}</div>}
                                {loc.sub_division && <div><span className="font-medium">Sub division:</span> {loc.sub_division}</div>}
                                {loc.block && <div><span className="font-medium">Block:</span> {loc.block}</div>}
                                {loc.post_office && <div><span className="font-medium">Post Office:</span> {loc.post_office}</div>}
                                {loc.district && <div><span className="font-medium">District:</span> {loc.district}</div>}
                                {loc.state && <div><span className="font-medium">State:</span> {loc.state}</div>}
                                {loc.pincode && <div><span className="font-medium">Pincode:</span> {loc.pincode}</div>}
                                {loc.note && <div><span className="font-medium">Note:</span> {loc.note}</div>}
                                {/* render any additional keys not in the known list */}
                                {Object.keys(loc).filter(k => !['area','city','sub_division','block','post_office','district','state','pincode','address_type','note'].includes(k)).map((k) => (
                                  <div key={k}><span className="font-medium">{k.replace(/_/g, ' ')}:</span> {String(loc[k])}</div>
                                ))}
                              </div>
                            </>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-secondary italic mt-3">No preferred job locations found</p>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'jobpreferences' && (
                <div>
                  <h3 className="text-xl font-semibold flex items-center gap-2"><FaBuilding /> Job Preferences</h3>
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-white rounded-lg border text-center">
                      <h4 className="text-2xl font-bold">{teacher.total_marks ?? '—'}</h4>
                      <p className="text-sm text-secondary">Total Marks</p>
                    </div>
                    <div className="p-4 bg-white rounded-lg border text-center">
                      <h4 className="text-2xl font-bold">{teacher.total_attempt ?? '—'}</h4>
                      <p className="text-sm text-secondary">Total Attempts</p>
                    </div>
                    <div className="p-4 bg-white rounded-lg border">
                      <h4 className="font-semibold">Profile</h4>
                      <div className="text-sm text-secondary mt-2">
                        {teacher.profiles?.religion && <div><span className="font-medium">Religion:</span> {teacher.profiles.religion}</div>}
                        {teacher.profiles?.marital_status && <div><span className="font-medium">Marital status:</span> {teacher.profiles.marital_status}</div>}
                        {teacher.profiles?.language && <div><span className="font-medium">Language:</span> {teacher.profiles.language}</div>}
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>

         

        </section>

       
      </main>
      {/* Request Modal */}
      {openRequestModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full overflow-y-auto">
            <div className="p-5 border-b flex items-center justify-between">
              <h3 className="font-semibold">Request Teacher: {teacher.Fname} {teacher.Lname}</h3>
              <button onClick={() => setOpenRequestModal(false)} className="text-secondary">✕</button>
            </div>

            <div className="p-5 space-y-4">
              {classCategories.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-secondary">This teacher hasn't set teaching preferences yet.</p>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Class Category</label>
                    <select value={selectedClassCategory} onChange={(e) => { setSelectedClassCategory(e.target.value); setSelectedSubject(''); }} className="w-full mt-2 p-2 border rounded">
                      <option value="">Select class category</option>
                      {classCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Subject</label>
                    <select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)} disabled={!selectedClassCategory} className="w-full mt-2 p-2 border rounded disabled:bg-gray-100">
                      <option value="">{selectedClassCategory ? 'Select subject' : 'Select class category first'}</option>
                      {subjects.filter(s => !selectedClassCategory || s.class_category === parseInt(selectedClassCategory)).map(s => <option key={s.id} value={s.id}>{s.subject_name}</option>)}
                    </select>
                  </div>
                </>
              )}
            </div>

            <div className="p-4 border-t flex items-center justify-end gap-3">
              <button onClick={() => setOpenRequestModal(false)} className="px-4 py-2 rounded bg-gray-100">Cancel</button>
              <button onClick={handleSubmitRequest} disabled={modalLoading || !selectedClassCategory || !selectedSubject || classCategories.length === 0} className="px-4 py-2 rounded bg-primary text-white disabled:opacity-50">
                {modalLoading ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
