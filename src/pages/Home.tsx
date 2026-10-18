import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div>
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-600 to-brand-800 text-white">
        <div className="mx-auto max-w-6xl px-6 py-24 text-center">
          <span className="badge bg-white/20 text-white mb-4">Ethiopian Nurses Association of Texas</span>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            United. Empowered. <span className="text-gold-400">Excellence.</span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-white/80">
            A community of Ethiopian nurses in Texas advancing professional development,
            mentorship, research, and community health.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/register" className="btn-primary bg-gold-500 hover:bg-gold-600 text-brand-900">Become a Member</Link>
            <Link to="/events" className="btn-outline border-white text-white hover:bg-white/10">Upcoming Events</Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl grid gap-6 px-6 py-16 md:grid-cols-3">
        {[
          { title: "Professional Development", desc: "CE workshops, NCLEX prep, and clinical mentorship." },
          { title: "Community Health", desc: "Screening drives and outreach across Texas." },
          { title: "Leadership & Advocacy", desc: "Representing Ethiopian nurses in healthcare policy." },
        ].map((c) => (
          <div key={c.title} className="card p-6">
            <h3 className="text-lg font-semibold text-brand-700">{c.title}</h3>
            <p className="mt-2 text-sm text-slate-600">{c.desc}</p>
          </div>
        ))}
      </section>
    </div>
  );
}