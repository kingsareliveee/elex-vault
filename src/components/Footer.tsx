const Footer = () => (
    <footer className="w-full border-t border-slate-800 bg-slate-950 py-8 text-center text-zinc-400 text-sm">
    <div className="max-w-6xl mx-auto text-center">
      <h3 className="font-display text-xl font-bold text-primary-foreground mb-2">
        ELEX DAVV – School of Electronics
      </h3>
      <p className="text-primary-foreground/60 text-sm mb-4">
        Devi Ahilya Vishwavidyalaya, Indore
      </p>
      <div className="border-t border-primary-foreground/10 pt-4 mt-4">
        <p className="text-primary-foreground/40 text-xs mb-2">
          Created by Anuj Tripathi
        </p>
        <p className="text-primary-foreground/40 text-xs">
          Any suggestion? <a href="https://wa.me/7225008155" className="text-primary-foreground underline hover:text-primary-foreground/80">Contact Me</a>
        </p>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-zinc-400">Connect With</span>
            <a
              href="https://www.linkedin.com/in/anuj-tripathi-7524913a5"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-900/70 border border-slate-700/60 text-zinc-200 hover:bg-slate-800/90 hover:text-blue-400 transition-colors duration-150 shadow-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 24 24" className="inline-block align-middle text-blue-400"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-10h3v10zm-1.5-11.268c-.966 0-1.75-.785-1.75-1.75s.784-1.75 1.75-1.75 1.75.784 1.75 1.75-.784 1.75-1.75 1.75zm15.5 11.268h-3v-5.604c0-1.337-.025-3.063-1.868-3.063-1.868 0-2.154 1.459-2.154 2.967v5.7h-3v-10h2.881v1.367h.041c.401-.761 1.379-1.563 2.838-1.563 3.036 0 3.6 2.001 3.6 4.601v5.595z"/></svg>
              <span className="font-medium">LinkedIn</span>
            </a>
          </div>
      </div>
    </div>
  </footer>
);

export default Footer;
