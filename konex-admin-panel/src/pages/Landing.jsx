import { Link } from "react-router-dom";

const DOWNLOAD_URL = "https://github.com/Desmond689/konex-app/releases/latest/download/app-release.apk";

export default function Landing() {
  return (
    <div className="public-page">
      <header className="public-nav">
        <Link to="/home" className="public-brand"><span className="brand-mark">K</span> KONEX</Link>
        <nav><Link to="/about">About</Link><a href="#features">Features</a></nav>
        <a className="btn btn-primary btn-small" href={DOWNLOAD_URL}>Download app</a>
      </header>
      <main>
        <section className="hero">
          <div className="hero-copy">
            <span className="eyebrow">THE SOCIAL HOME FOR GAMERS</span>
            <h1>Find your people.<br /><em>Play your way.</em></h1>
            <p>Connect with gamers, discover communities, build your squad, and share the moments that make gaming memorable.</p>
            <div className="hero-actions">
              <a className="btn btn-primary" href={DOWNLOAD_URL}>Download Konex <span>↓</span></a>
              <Link className="btn btn-ghost" to="/about">Explore Konex <span>→</span></Link>
            </div>
            <small className="download-note">Free to join · Built for gamers · Android app</small>
          </div>
          <div className="hero-art" aria-hidden="true"><div className="orb orb-one" /><div className="orb orb-two" /><div className="hero-card"><span className="card-k">K</span><strong>Connect.<br />Create.<br />Belong.</strong></div></div>
        </section>
        <section className="feature-strip" id="features">
          <div><span>01</span><h3>Find your squad</h3><p>Meet players who match your energy and games.</p></div>
          <div><span>02</span><h3>Join communities</h3><p>Find your corner of the gaming world.</p></div>
          <div><span>03</span><h3>Share the moment</h3><p>Posts, stories, chats, and memories in one place.</p></div>
        </section>
        <section className="download-banner">
          <div><span className="eyebrow">READY WHEN YOU ARE</span><h2>Your next game starts here.</h2></div>
          <a className="btn btn-light" href={DOWNLOAD_URL}>Get the app <span>→</span></a>
        </section>
      </main>
      <footer className="public-footer"><span>© 2026 Konex</span><Link to="/about">About Konex</Link></footer>
    </div>
  );
}
