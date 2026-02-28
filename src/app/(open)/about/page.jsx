export const metadata = {
  title: "About eUG Form",
  description:
    "Learn more about eUG Form, a digital platform that simplifies undergraduate form submission at the University of Agriculture",
};

export default function About() {
  return (
    <main
      className="
         flex justify-center items-center px-6 py-14 transition
        bg-yellow-50 dark:bg-[#0b0f14]
      "
    >
      <div
        className="
          max-w-5xl w-full rounded-2xl p-10 transition
          bg-white dark:bg-[#121821]
          shadow-xl border
          border-yellow-200 dark:border-gray-800
        "
      >
        {/* Heading */}
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800 dark:text-gray-100">
          About eUG Form
        </h1>

        {/* Intro */}
        <p className="text-gray-700 dark:text-gray-400 text-lg leading-relaxed mb-8 text-justify">
          <span className="font-semibold text-yellow-600 dark:text-yellow-400">
            eUG Form
          </span>{" "}
          is a modern digital platform built to simplify undergraduate form
          submission at the University of Agriculture, where students previously
          had to deal with paperwork, long queues, manual verification, and
          repeated campus visits
        </p>

        <p className="text-gray-700 dark:text-gray-400 text-lg leading-relaxed mb-10 text-justify">
          This system replaces the traditional process with an efficient,
          paperless workflow that allows students, tutors, and administrators to
          manage everything online with transparency and speed
        </p>

        {/* How it works */}
        <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
          How It Works
        </h2>

        <ul className="list-decimal list-inside space-y-3 text-gray-700 dark:text-gray-400 text-lg mb-10">
          <li>
            Students log in and complete their undergraduate form using a simple
            and user friendly interface
          </li>
          <li>
            The system automatically fetches the official fee voucher from the
            university finance portal
          </li>
          <li>
            After payment, students upload the paid voucher along with bank
            details for verification
          </li>
          <li>
            Tutors and department authorities review and approve forms digitally
            through their dashboards
          </li>
          <li>
            Students receive real time updates and notifications regarding their
            form status
          </li>
        </ul>

        {/* Features */}
        <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
          Key Features
        </h2>

        <ul className="list-disc list-inside space-y-3 text-gray-700 dark:text-gray-400 text-lg mb-12">
          <li>Fully paperless undergraduate form submission process</li>
          <li>Automated fee voucher download and digital verification</li>
          <li>Role based access for students, tutors, and administrators</li>
          <li>Real time form tracking and approval status</li>
          <li>Email and WhatsApp notifications for important updates</li>
        </ul>

        {/* Closing */}
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 text-lg max-w-3xl mx-auto">
            The mission of eUG Form is to save student time, reduce human error,
            and create a smarter enrollment experience through technology and
            automation
          </p>
        </div>
      </div>
    </main>
  );
}
