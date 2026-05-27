const Footer = () => (
  <footer className="w-full border-t border-slate-800/50 bg-slate-950/80 backdrop-blur-md py-12 text-zinc-400 text-sm mt-auto">
    <div className="max-w-6xl mx-auto px-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        
        {/* Brand & About */}
        <div className="col-span-1 md:col-span-1">
          <h3 className="font-display text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300 mb-3">
            ELEX Vault
          </h3>
          <p className="text-zinc-500 text-sm leading-relaxed mb-4">
            A collaborative academic platform built for Electronics students to share and access educational resources.
          </p>
          <div className="flex items-center gap-2 mt-4">
            <span className="text-zinc-500 text-xs">Connect:</span>
            <a
              href="https://www.linkedin.com/in/anuj-tripathi-7524913a5"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/50 border border-slate-800 text-zinc-300 hover:bg-slate-800 hover:text-blue-400 hover:border-blue-500/30 transition-all duration-300 shadow-sm text-xs"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 24 24" className="inline-block"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-10h3v10zm-1.5-11.268c-.966 0-1.75-.785-1.75-1.75s.784-1.75 1.75-1.75 1.75.784 1.75 1.75-.784 1.75-1.75 1.75zm15.5 11.268h-3v-5.604c0-1.337-.025-3.063-1.868-3.063-1.868 0-2.154 1.459-2.154 2.967v5.7h-3v-10h2.881v1.367h.041c.401-.761 1.379-1.563 2.838-1.563 3.036 0 3.6 2.001 3.6 4.601v5.595z"/></svg>
              <span className="font-medium">LinkedIn</span>
            </a>
          </div>
        </div>

        {/* Credits & Attribution */}
        <div className="col-span-1">
          <h4 className="font-semibold text-zinc-200 mb-3">Credits & Attribution</h4>
          <p className="text-zinc-500 text-xs leading-relaxed mb-3">
            <strong className="text-zinc-400 font-medium block mb-1">Voluntary Contributions</strong>
            Resources are contributed voluntarily by students and verified through strict moderation.
          </p>
          <p className="text-zinc-500 text-xs leading-relaxed">
            <strong className="text-zinc-400 font-medium block mb-1">School of Electronics</strong>
            Devi Ahilya Vishwavidyalaya, Indore
          </p>
        </div>

        {/* Legal & Privacy */}
        <div className="col-span-1">
          <h4 className="font-semibold text-zinc-200 mb-3">Legal & Privacy</h4>
          <p className="text-zinc-500 text-xs leading-relaxed mb-3">
            <strong className="text-zinc-400 font-medium block mb-1">Privacy Policy</strong>
            Contributor names are displayed publicly strictly for academic attribution and verification purposes.
          </p>
          <p className="text-zinc-500 text-xs leading-relaxed">
            <strong className="text-zinc-400 font-medium block mb-1">Copyright</strong>
            Uploaded materials remain the intellectual property of their respective contributors and institutions.
          </p>
        </div>

      </div>

      {/* Bottom Bar */}
      <div className="pt-6 border-t border-slate-800/50 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-zinc-500 text-xs">
          © {new Date().getFullYear()} ELEX Vault. All rights reserved.
        </p>
        <p className="text-zinc-500 text-xs flex items-center gap-1">
          Built by Anuj Tripathi • <a href="https://wa.me/7225008155" className="text-blue-400 hover:text-blue-300 transition-colors">Feedback?</a>
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;
