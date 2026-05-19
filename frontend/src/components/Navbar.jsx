import { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import logo from "../assets/images/logo.png";
import useAuth from "../hooks/useAuth";
import api from "../services/api";
import Avatar from "./Avatar";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth() || {};
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [quizzesCache, setQuizzesCache] = useState([]);
  const [subjectsMap, setSubjectsMap] = useState({});
  const searchRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const userMenuRef = useRef(null);

  // close the menus when clicking outside or pressing Escape
  useEffect(() => {
    let mounted = true;

    // fetch quizzes and subjects for teacher search when user is available
    const fetchForSearch = async () => {
      if (!user || user.role !== "teacher") return;
      try {
        const [qRes, sRes] = await Promise.allSettled([
          api.get("/quizzes?all=true"),
          api.get("/subjects"),
        ]);
        if (!mounted) return;
        const quizzes =
          qRes.status === "fulfilled"
            ? qRes.value.data.quizzes || qRes.value.data || []
            : [];
        const subjects =
          sRes.status === "fulfilled" ? sRes.value.data.subjects || [] : [];
        const map = {};
        subjects.forEach((s) => {
          map[s._id] = s;
        });
        setQuizzesCache(quizzes);
        setSubjectsMap(map);
      } catch (e) {
        // ignore
      }
    };
    fetchForSearch();

    function handleClickOutside(e) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }

    function handleKey(e) {
      if (e.key === "Escape") {
        setUserMenuOpen(false);
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKey);
      mounted = false;
    };
  }, [user]);

  // live filter when searchQuery changes
  useEffect(() => {
    if (!searchQuery) {
      setSearchResults([]);
      return;
    }
    const q = searchQuery.trim().toLowerCase();
    const matches = quizzesCache
      .filter((z) => {
        const title = (z.title || "").toLowerCase();
        const subj = subjectsMap[z.subject]
          ? subjectsMap[z.subject].code || ""
          : "";
        return title.includes(q) || subj.toLowerCase().includes(q);
      })
      .slice(0, 8)
      .map((z) => ({
        ...z,
        subjectCode: subjectsMap[z.subject]
          ? subjectsMap[z.subject].code
          : undefined,
        type: "quiz",
      }));
    setSearchResults(matches);
  }, [searchQuery, quizzesCache, subjectsMap]);

  // perform server-backed search (on Enter or button click)
  const performSearch = async () => {
    const q = (searchQuery || "").trim();
    if (!q) {
      setSearchResults([]);
      searchRef.current && searchRef.current.focus();
      return;
    }
    try {
      const quizUrl =
        user && user.role === "teacher"
          ? `/quizzes?search=${encodeURIComponent(q)}&all=true`
          : `/quizzes?search=${encodeURIComponent(q)}`;
      const subjectUrl = `/subjects?search=${encodeURIComponent(q)}`;
      const [sRes, qRes] = await Promise.allSettled([
        api.get(subjectUrl),
        api.get(quizUrl),
      ]);

      const subjects =
        sRes.status === "fulfilled" ? sRes.value.data.subjects || [] : [];
      const quizzes =
        qRes.status === "fulfilled" ? qRes.value.data.quizzes || [] : [];

      const mappedSubjects = subjects.map((s) => ({
        _id: s._id,
        title: s.name,
        subjectCode: s.code,
        type: "subject",
      }));
      const mappedQuizzes = quizzes.map((z) => ({
        ...z,
        title: z.title || "",
        subjectCode: subjectsMap[z.subject]
          ? subjectsMap[z.subject].code
          : undefined,
        type: "quiz",
      }));

      const merged = [...mappedSubjects, ...mappedQuizzes].slice(0, 8);
      setSearchResults(merged);
    } catch (err) {
      setSearchResults([]);
    }
  };

  // show navigation items only for authenticated users
  const navigation = [];
  if (user) {
    navigation.push({ name: "Dashboard", href: "/dashboard" });
    if (user.role === "teacher") {
      navigation.push({ name: "Your Courses", href: "/teacher/courses" });
    }
    if (user.role === "student") {
      navigation.push({ name: "Your Courses", href: "/courses?enrolled=true" });
    }
  }

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(user ? "/dashboard" : "/login")}
              className="flex-shrink-0 flex items-center"
              aria-label="Home"
            >
              <img src={logo} alt="Qizy logo" className="h-12 mr-2 w-auto" />
            </button>
            <div className="hidden lg:block">
              <div className="relative">
                <input
                  ref={searchRef}
                  type="search"
                  placeholder="Course or quiz name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      performSearch();
                    }
                  }}
                  className="border rounded-md px-3 py-1 text-sm w-64 focus:outline-none focus:ring-1 focus:ring-black text-black bg-white"
                  aria-label="Search courses and quizzes"
                />
                <button
                  onClick={() => performSearch()}
                  className="absolute right-0 top-0 mt-1 mr-1 p-1 text-gray-600 hover:text-black"
                  aria-label="Search"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z"
                    />
                  </svg>
                </button>
                {searchQuery && (
                  <div className="absolute left-0 mt-1 w-64 bg-white border rounded-md shadow-lg z-50 max-h-64 overflow-auto">
                    {searchResults.length > 0 ? (
                      searchResults.map((r) => (
                        <button
                          key={r._id}
                          onClick={() => {
                            setSearchQuery("");
                            setSearchResults([]);
                            if (r.type === "subject") {
                              navigate(`/teacher/courses/${r._id}`);
                            } else {
                              navigate(`/teacher/quiz/${r._id}`);
                            }
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-gray-100 text-sm"
                        >
                          <div className="font-medium text-black">
                            {r.title}{" "}
                            {r.type === "subject" && (
                              <span className="text-xs text-gray-400">
                                (Course)
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-500">
                            {r.subjectCode || "—"}
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="px-3 py-2 text-sm text-gray-500">
                        No results
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-6">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`${
                  location.pathname === item.href
                    ? "text-black border-b-2 border-black"
                    : "text-black hover:text-gray-600"
                } px-3 py-2 text-sm font-medium transition-colors duration-200`}
              >
                {item.name}
              </Link>
            ))}

            {!user ? (
              <div className="flex items-center space-x-2">
                {location.pathname !== "/login" && (
                  <Link
                    to="/login"
                    className="text-sm px-3 py-2 bg-black text-white rounded-md"
                  >
                    Login
                  </Link>
                )}
                {location.pathname !== "/register" && (
                  <Link
                    to="/register"
                    className="text-sm px-3 py-2 bg-black text-white rounded-md hover:bg-gray-800"
                  >
                    Registration
                  </Link>
                )}
              </div>
            ) : (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen((s) => !s)}
                  className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100"
                  aria-haspopup="true"
                  aria-expanded={userMenuOpen}
                >
                  <div>
                    <Avatar user={user} size="h-8 w-8" iconSize="h-5 w-5" />
                  </div>
                  <span className="text-sm text-black">
                    {user.name || "User"}
                  </span>
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-44 bg-white border rounded-md shadow-lg py-1 z-50">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-black hover:bg-gray-100"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      Profile
                    </Link>
                    <Link
                      to="/settings"
                      className="block px-4 py-2 text-sm text-black hover:bg-gray-100"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      Settings
                    </Link>
                    <button
                      onClick={() => {
                        logout && logout();
                        setUserMenuOpen(false);
                        navigate("/");
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-black hover:text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-black"
            >
              <svg
                className="h-6 w-6"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 24 24"
              >
                {isOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {isOpen && (
          <div className="md:hidden" ref={mobileMenuRef}>
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`${
                    location.pathname === item.href
                      ? "bg-gray-100 text-black"
                      : "text-black hover:bg-gray-50 hover:text-gray-600"
                  } block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200`}
                >
                  {item.name}
                </Link>
              ))}

              <div className="mt-2 border-t pt-2">
                {!user ? (
                  <>
                    {location.pathname !== "/login" && (
                      <Link
                        to="/login"
                        onClick={() => setIsOpen(false)}
                        className="block px-3 py-2 text-base text-black text-center"
                      >
                        Login
                      </Link>
                    )}
                    {location.pathname !== "/register" && (
                      <Link
                        to="/register"
                        onClick={() => setIsOpen(false)}
                        className="block mt-1 px-3 py-2 bg-black text-white rounded-md text-base text-center"
                      >
                        Registration
                      </Link>
                    )}
                  </>
                ) : (
                  <>
                    <Link
                      to="/dashboard"
                      onClick={() => setIsOpen(false)}
                      className="block px-3 py-2 text-base text-black"
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={() => {
                        logout && logout();
                        setIsOpen(false);
                      }}
                      className="w-full mt-2 px-3 py-2 text-base text-left text-red-600"
                    >
                      Logout
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
