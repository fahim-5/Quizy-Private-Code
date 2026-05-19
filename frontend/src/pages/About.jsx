const About = () => {
  return (
    <div className="min-h-screen bg-white text-black">
      <main className="max-w-5xl mx-auto px-6 py-16">
        
        {/* Hero Section */}
        <section className="text-center py-16">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 tracking-tight">
            About Qizy
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            A complete online quiz management system built for the CSE 4165 project.
          </p>
        </section>

        {/* What is Qizy */}
        <section className="py-12 border-t border-gray-200">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-lg text-gray-700 leading-relaxed">
              Qizy enables teachers to create timed assessments and students to take them —
              all in one place. Simple, fast, and effective.
            </p>
          </div>
        </section>

        {/* For Teachers & Students - Two Cards like Home.jsx */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 py-12">
          
          {/* Teacher Card */}
          <div className="border border-black p-6 rounded-md">
            <div className="text-center md:text-left">
              <h3 className="font-bold text-2xl mb-4 text-black">For Teachers</h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-center gap-2">
                  <span className="font-bold text-black">→</span> Create quizzes with multiple questions
                </li>
                <li className="flex items-center gap-2">
                  <span className="font-bold text-black">→</span> Set time limits per quiz
                </li>
                <li className="flex items-center gap-2">
                  <span className="font-bold text-black">→</span> Publish with unique 6-digit code
                </li>
                <li className="flex items-center gap-2">
                  <span className="font-bold text-black">→</span> Monitor live student participation
                </li>
                <li className="flex items-center gap-2">
                  <span className="font-bold text-black">→</span> Download results as CSV
                </li>
                <li className="flex items-center gap-2">
                  <span className="font-bold text-black">→</span> Automatic scoring for MCQs
                </li>
              </ul>
            </div>
          </div>

          {/* Student Card */}
          <div className="border border-black p-6 rounded-md">
            <div className="text-center md:text-left">
              <h3 className="font-bold text-2xl mb-4 text-black">For Students</h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-center gap-2">
                  <span className="font-bold text-black">→</span> Join quizzes with 6-digit code
                </li>
                <li className="flex items-center gap-2">
                  <span className="font-bold text-black">→</span> Take timed quizzes
                </li>
                <li className="flex items-center gap-2">
                  <span className="font-bold text-black">→</span> Question palette shows progress
                </li>
                <li className="flex items-center gap-2">
                  <span className="font-bold text-black">→</span> Auto-save answers
                </li>
                <li className="flex items-center gap-2">
                  <span className="font-bold text-black">→</span> View scores immediately
                </li>
                <li className="flex items-center gap-2">
                  <span className="font-bold text-black">→</span> Review past attempts
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Tech Stack Section */}
        <section className="py-12 border-t border-gray-200">
          <h2 className="text-2xl font-bold text-center mb-8">Technology Stack</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-3xl mx-auto text-center">
            <div className="border border-gray-200 rounded-md p-4 bg-gray-50">
              <div className="font-bold text-black">MongoDB</div>
              <div className="text-sm text-gray-600">Database</div>
            </div>
            <div className="border border-gray-200 rounded-md p-4 bg-gray-50">
              <div className="font-bold text-black">Express.js</div>
              <div className="text-sm text-gray-600">Backend</div>
            </div>
            <div className="border border-gray-200 rounded-md p-4 bg-gray-50">
              <div className="font-bold text-black">React</div>
              <div className="text-sm text-gray-600">Frontend</div>
            </div>
            <div className="border border-gray-200 rounded-md p-4 bg-gray-50">
              <div className="font-bold text-black">Node.js</div>
              <div className="text-sm text-gray-600">Runtime</div>
            </div>
            <div className="border border-gray-200 rounded-md p-4 bg-gray-50">
              <div className="font-bold text-black">Tailwind CSS</div>
              <div className="text-sm text-gray-600">Styling</div>
            </div>
            <div className="border border-gray-200 rounded-md p-4 bg-gray-50">
              <div className="font-bold text-black">JWT + bcrypt</div>
              <div className="text-sm text-gray-600">Authentication</div>
            </div>
          </div>
        </section>

        {/* Getting Started */}
        <section className="py-12 border-t border-gray-200">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-6">Getting Started</h2>
            <div className="bg-gray-50 border border-gray-200 rounded-md p-6">
              <p className="text-gray-700 mb-4">
                To run Qizy locally, clone the repository and install dependencies:
              </p>
              <div className="bg-black text-white p-4 rounded-md font-mono text-sm overflow-x-auto mb-4">
                <pre className="whitespace-pre-wrap">
{`# Clone repository
git clone https://github.com/fahim-5/Online-Quiz-Platform

# Backend setup
cd qizy/backend
npm install
cp .env.example .env
npm run dev

# Frontend setup (new terminal)
cd ../frontend
npm install
npm run dev`}
                </pre>
              </div>
              <p className="text-gray-600 text-sm">
                See the project README for full setup instructions and environment variables.
              </p>
            </div>
          </div>
        </section>

        {/* Guest Note */}
        <section className="text-center py-8 border-t border-gray-200 mt-8">
          <p className="text-gray-500 text-sm">
            You are viewing this page as a guest.
          </p>
          <p className="text-gray-500 text-sm mt-1">
            To create or take quizzes, please login as Teacher or Student.
          </p>
        </section>

      </main>
    </div>
  );
};

export default About;