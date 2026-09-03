import { Link } from "react-router-dom";

const DOWNLOAD_URL = "https://github.com/Desmond689/konex-app/releases/latest/download/app-release.apk";
const features = [
  ["🎮", "Discover Gamers", "Find people who play the games you love and connect with players from different communities."],
  ["🤝", "Find Your Squad", "Connect with teammates and build a squad that feels like yours."],
  ["🌐", "Join Communities", "Discover communities built around games, interests, and the things players care about."],
  ["📸", "Share Your Moments", "Post your gaming experiences, achievements, thoughts, and memorable moments."],
  ["✨", "Share Stories", "Share moments that disappear after a short time and keep your profile personal."],
  ["💬", "Stay Connected", "Have conversations and build real connections within the community."],
];

export default function About() {
  return <div className="public-page about-page">
    <header className="public-nav"><Link to="/home" className="public-brand"><span className="brand-mark">K</span> KONEX</Link><nav><Link to="/home">Home</Link><a href="#what">What you can do</a></nav><a className="btn btn-primary btn-small" href={DOWNLOAD_URL}>Download app</a></header>
    <main className="about-content">
      <section className="about-hero"><span className="eyebrow">ABOUT KONEX</span><h1>Where gamers<br /><em>connect.</em></h1><p>Konex is a social platform built for gamers — a place to connect with other players, discover communities, share your gaming moments, find teammates, and build your identity beyond the game.</p></section>
      <section className="about-section split"><div><span className="section-number">01</span><h2>Why we built Konex</h2></div><div><p>Gaming has always been about more than just playing. It’s about the people you meet, the teams you build, the communities you join, and the moments you remember.</p><p>Finding all of that can feel scattered. <strong>Konex was built to make gaming social.</strong></p></div></section>
      <section className="about-section" id="what"><span className="section-number">02</span><h2>What you can do on Konex</h2><div className="feature-grid">{features.map(([icon, title, text]) => <article key={title}><span className="feature-icon">{icon}</span><h3>{title}</h3><p>{text}</p></article>)}</div></section>
      <section className="vision"><span className="eyebrow">OUR VISION</span><h2>Gaming is better<br />when people experience it <em>together.</em></h2><p>Connect, communicate, create, discover, and belong. Konex isn’t just about the games you play. <strong>It’s about the people you play them with.</strong></p></section>
      <section className="founder about-section split"><div><span className="section-number">03</span><h2>Built by a gamer,<br />built for gamers</h2></div><div><h3>Tenkou Desmond</h3><p className="muted-copy">Founder & Developer of Konex</p><p>Konex was created with the goal of building a modern social experience designed around the gaming community. The journey is just beginning.</p></div></section>
      <section className="about-cta"><h2>Connect. Create. Belong.</h2><p>Your gaming community is waiting.</p><a className="btn btn-primary" href={DOWNLOAD_URL}>Join Konex <span>→</span></a></section>
    </main>
    <footer className="public-footer"><span>© 2026 Konex</span><Link to="/home">Back home</Link></footer>
  </div>;
}
