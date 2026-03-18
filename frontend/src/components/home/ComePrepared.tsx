export function ComePrepared() {
  const statements = [
    {
      headline: "Know the program, not just the college name.",
      body: "Representatives answer specific questions. A student who has read the program structure gets a different conversation than one who has not.",
    },
    {
      headline: "Rankings measure research output, not fit.",
      body: "Program structure, faculty research areas, placement data, and campus culture matter more for most students than a global ranking. Ask representatives about outcomes, not reputation.",
    },
    {
      headline: "Admissions is not an entrance exam.",
      body: "There is no single score that determines admission. Statements of purpose are read. Recommendation letters are contacted. Inconsistencies in academic record are noticed and asked about. Professors and admissions officers at this fair can walk students through what a strong application looks like.",
    },
    {
      headline: "Parents make the final decision in most Indian families.",
      body: "Representatives know this. Bring them.",
    },
  ];

  return (
    <section className="py-16 bg-gray-900 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <span className="inline-block mb-3 h-1 w-16 bg-yellow-500" />
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            The fair works better when students come ready
          </h2>
          <p className="text-lg text-gray-400 mt-2 max-w-3xl">
            This is not a general information session. Admissions officers,
            professors, scholarship coordinators, and counsellors are here to
            have specific conversations. The more prepared a student is, the more
            they take away.
          </p>
        </div>

        {/* Statement cards — asymmetric grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* First card — spans 7 cols, large */}
          <div className="md:col-span-7 border border-gray-700 p-8 md:p-10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-20 h-20 bg-yellow-500 opacity-10" />
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-4 leading-tight">
              {statements[0].headline}
            </h3>
            <p className="text-gray-400 leading-relaxed">
              {statements[0].body}
            </p>
          </div>

          {/* Second card — spans 5 cols */}
          <div className="md:col-span-5 border border-gray-700 p-8 md:p-10 relative overflow-hidden">
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-blue-600 opacity-20" />
            <h3 className="text-xl md:text-2xl font-bold text-white mb-4 leading-tight">
              {statements[1].headline}
            </h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              {statements[1].body}
            </p>
          </div>

          {/* Third card — spans 5 cols */}
          <div className="md:col-span-5 border border-gray-700 p-8 md:p-10 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-12 h-12 bg-yellow-500 opacity-10" />
            <h3 className="text-xl md:text-2xl font-bold text-white mb-4 leading-tight">
              {statements[2].headline}
            </h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              {statements[2].body}
            </p>
          </div>

          {/* Fourth card — spans 7 cols, highlighted */}
          <div className="md:col-span-7 bg-yellow-500 p-8 md:p-10 relative overflow-hidden">
            <div className="absolute bottom-0 right-0 w-24 h-24 bg-gray-900 opacity-10" />
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 leading-tight">
              {statements[3].headline}
            </h3>
            <p className="text-gray-800 leading-relaxed text-lg font-medium">
              {statements[3].body}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
