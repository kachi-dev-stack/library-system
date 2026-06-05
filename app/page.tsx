import {
  BookOpen,
  Users,
  BookMarked,
  Sparkles,
  AlertTriangle,
  BarChart3,
  Shield,
  ClipboardList,
  GraduationCap,
  Check,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-8 py-5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900 text-lg">Libra</span>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/login"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition"
            >
              Sign In
            </a>
            <a
              href="/signup"
              className="text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
            >
              Get Started
            </a>
          </div>
        </div>
      </nav>
      {/* Hero */}
      <section className="max-w-5xl mx-auto px-8 pt-24 pb-20 text-center">
        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
          <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
          Intelligent Library Management
        </div>

        <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 leading-tight mb-6">
          The smarter way to
          <span className="text-blue-600"> run a library</span>
        </h1>

        <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
          A complete library operations system with AI-powered book
          recommendations, overdue risk detection, and real-time book tracking —
          built for modern libraries.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href="/signup"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3.5 rounded-xl transition text-sm"
          >
            Create Member Account
          </a>
          <a
            href="/login"
            className="border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold px-8 py-3.5 rounded-xl transition text-sm"
          >
            Sign In
          </a>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="border-y border-gray-100 bg-gray-50">
        <div className="max-w-5xl mx-auto px-8 py-10 grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
          <div>
            <p className="text-3xl font-bold text-gray-900">3</p>
            <p className="text-sm text-gray-500 mt-1">User Roles</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-blue-600">AI</p>
            <p className="text-sm text-gray-500 mt-1">Powered Insights</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-gray-900">Auto</p>
            <p className="text-sm text-gray-500 mt-1">Fine Calculation</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-gray-900">Live</p>
            <p className="text-sm text-gray-500 mt-1">Book Tracking</p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-8 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Everything a library needs
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            From daily operations to intelligent analytics — one system handles
            it all.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <FeatureCard
            icon={<BookMarked className="w-6 h-6" />}
            title="Book Management"
            description="Add, edit and track every book in your catalogue with real-time availability across all copies."
          />
          <FeatureCard
            icon={<Users className="w-6 h-6" />}
            title="Member Management"
            description="Register members, manage accounts, and control access with suspend and activate controls."
          />
          <FeatureCard
            icon={<BookOpen className="w-6 h-6" />}
            title="Borrow & Return"
            description="Issue books to members, track due dates, and process returns with automatic fine calculation."
          />
          <FeatureCard
            icon={<Sparkles className="w-6 h-6" />}
            title="AI Recommendations"
            description="The system analyses each member's borrowing history and recommends books they'll love."
            highlight
          />
          <FeatureCard
            icon={<AlertTriangle className="w-6 h-6" />}
            title="Risk Detection"
            description="Automatically flags members likely to return books late based on their past behaviour."
            highlight
          />
          <FeatureCard
            icon={<BarChart3 className="w-6 h-6" />}
            title="Reports & Analytics"
            description="Track borrowing trends, overdue books, fines collected, and most popular titles."
          />
        </div>
      </section>

      {/* Roles Section */}
      <section className="bg-gray-50 border-t border-gray-100">
        <div className="max-w-5xl mx-auto px-8 py-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Built for every role
            </h2>
            <p className="text-gray-500">
              Three dashboards, each designed for how that person actually
              works.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <RoleCard
              role="Admin"
              colorClass="bg-blue-600"
              lightClass="bg-blue-50 text-blue-700"
              icon={<Shield className="w-6 h-6 text-white" />}
              perks={[
                "Full system access",
                "Member management",
                "AI reports & analytics",
                "Librarian oversight",
              ]}
            />
            <RoleCard
              role="Librarian"
              colorClass="bg-green-600"
              lightClass="bg-green-50 text-green-700"
              icon={<ClipboardList className="w-6 h-6 text-white" />}
              perks={[
                "Issue & return books",
                "Manage book catalogue",
                "View overdue loans",
                "Access reports",
              ]}
            />
            <RoleCard
              role="Member"
              colorClass="bg-purple-600"
              lightClass="bg-purple-50 text-purple-700"
              icon={<GraduationCap className="w-6 h-6 text-white" />}
              perks={[
                "View borrowed books",
                "AI book recommendations",
                "Reserve unavailable books",
                "Track due dates",
              ]}
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-5xl mx-auto px-8 py-24 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Ready to get started?
        </h2>
        <p className="text-gray-500 mb-8">
          Create a member account or sign in to your existing account.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href="/signup"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3.5 rounded-xl transition text-sm"
          >
            Create Account
          </a>
          <a
            href="/login"
            className="border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold px-8 py-3.5 rounded-xl transition text-sm"
          >
            Sign In
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 px-8 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-600 rounded-md flex items-center justify-center">
              <BookOpen className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm font-semibold text-gray-700">
              LibraryIQ
            </span>
          </div>
          <p className="text-xs text-gray-400">
            Intelligent Library Operations and Book Tracking System
          </p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  highlight,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`p-6 rounded-2xl border ${highlight ? "border-purple-200 bg-purple-50" : "border-gray-200 bg-white"}`}
    >
      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${highlight ? "bg-purple-100 text-purple-600" : "bg-gray-100 text-gray-600"}`}
      >
        {icon}
      </div>
      <div className="flex items-center gap-2 mb-2">
        <h3 className="font-semibold text-gray-900">{title}</h3>
        {highlight && (
          <span className="text-xs bg-purple-200 text-purple-700 px-1.5 py-0.5 rounded-full font-medium">
            AI
          </span>
        )}
      </div>
      <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
    </div>
  );
}

function RoleCard({
  role,
  colorClass,
  lightClass,
  icon,
  perks,
}: {
  role: string;
  colorClass: string;
  lightClass: string;
  icon: React.ReactNode;
  perks: string[];
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${colorClass}`}
      >
        {icon}
      </div>
      <span
        className={`text-xs font-semibold px-2 py-1 rounded-full ${lightClass}`}
      >
        {role}
      </span>
      <h3 className="font-bold text-gray-900 text-lg mt-3 mb-4">
        {role} Dashboard
      </h3>
      <ul className="space-y-2">
        {perks.map((perk, i) => (
          <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
            <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
            {perk}
          </li>
        ))}
      </ul>
    </div>
  );
}
