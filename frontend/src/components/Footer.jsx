import { Link } from "react-router-dom";
import {
  FaGithub,
  FaTwitter,
  FaLinkedin,
  FaEnvelope,
  FaArrowRight,
} from "react-icons/fa";
import logo from "../assets/images/logo.png";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-b from-white to-gray-50 text-black border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Newsletter Section */}
        <div className="py-12 border-b border-gray-200">
          <div className="bg-black rounded-3xl px-6 py-10 md:px-12 flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="max-w-xl">
              <h2 className="text-3xl font-bold text-white">
                Stay Updated 🚀
              </h2>
              <p className="text-gray-300 mt-3 text-sm md:text-base">
                Get the latest quizzes, updates, and learning resources directly
                in your inbox.
              </p>
            </div>

            <div className="w-full lg:w-auto">
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="relative w-full sm:w-80">
                  <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-white text-black outline-none focus:ring-2 focus:ring-gray-400"
                  />
                </div>

                <button className="bg-white text-black px-6 py-3 rounded-xl font-medium hover:bg-gray-200 transition-all duration-300 flex items-center gap-2">
                  Subscribe
                  <FaArrowRight size={12} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Footer */}
        <div className="py-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-14">
          {/* Brand */}
          <div>
            <Link to="/" className="inline-block">
              <img src={logo} alt="Quizly logo" className="h-20 w-auto" />
            </Link>

            <p className="text-gray-600 text-sm leading-relaxed mt-4">
              Quizly is a modern online quiz platform for creating, taking, and
              reviewing quizzes with real-time scoring and progress tracking.
            </p>

            <div className="flex items-center gap-4 mt-6">
              {[
                {
                  icon: <FaGithub size={18} />,
                  link: "https://github.com",
                },
                {
                  icon: <FaTwitter size={18} />,
                  link: "https://twitter.com",
                },
                {
                  icon: <FaLinkedin size={18} />,
                  link: "https://linkedin.com",
                },
              ].map((item, index) => (
                <a
                  key={index}
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-black hover:text-white hover:border-black transition-all duration-300"
                >
                  {item.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-lg font-semibold mb-5">Product</h3>

            <ul className="space-y-3">
              {[
                { name: "Home", path: "/" },
                { name: "Take Quiz", path: "/take-quiz" },
                { name: "Dashboard", path: "/dashboard" },
                { name: "About Us", path: "/about" },
              ].map((item, index) => (
                <li key={index}>
                  <Link
                    to={item.path}
                    className="text-gray-600 hover:text-black transition-colors duration-300 text-sm"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-lg font-semibold mb-5">Resources</h3>

            <ul className="space-y-3">
              {[
                { name: "Teacher Panel", path: "/teacher" },
                { name: "All Quizzes", path: "/quizzes" },
                { name: "Documentation", path: "/README.md" },
                { name: "My Results", path: "/results" },
              ].map((item, index) => (
                <li key={index}>
                  <a
                    href={item.path}
                    className="text-gray-600 hover:text-black transition-colors duration-300 text-sm"
                  >
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold mb-5">Support</h3>

            <ul className="space-y-3">
              {[
                { name: "FAQ", path: "/faq" },
                { name: "Contact Us", path: "/contact" },
                { name: "Privacy Policy", path: "/privacy" },
                { name: "Terms of Service", path: "/terms" },
              ].map((item, index) => (
                <li key={index}>
                  <a
                    href={item.path}
                    className="text-gray-600 hover:text-black transition-colors duration-300 text-sm"
                  >
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-200 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500 text-center md:text-left">
            © {new Date().getFullYear()} Quizly. All rights reserved.
          </p>

          <p className="text-sm text-gray-500 text-center md:text-right">
            Built with 🖤 by{" "}
            <a
              href="https://iamfaysal.netlify.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold italic text-black hover:text-gray-700 transition-colors"
            >
              Bafu
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;