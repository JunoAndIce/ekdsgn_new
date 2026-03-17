import React from 'react';
import '../assets/css/portfolio.css';
import Footer from '../components/Footer/Footer';
import Navbar from '../components/Navbar/Navbar';

const bioParagraphs = [
  'Ekemini Ekwere is a multidisciplinary creative director with 10 years of graphic design experience. Through design, video, and art direction, he builds work that hits. Campaigns, concepts, and visuals that move people and mean something to the brands behind them.',
  'He is the founder of hwy6, a Houston-based creative collective he built from the ground up. From Powerade to Bottega Desires, his projects live at the intersection of sports, music, and entertainment, the spaces where culture actually gets made.',
  'Ek leads with intention. Every project he touches is rooted in a clear vision and executed with the kind of detail that turns good ideas into lasting work.',
];

const Contact = () => {
  return (
    <>
      <Navbar />
      <main className="main about-page">
        <section className="about-hero">
          <div className="about-hero-content">
            <div className="emoji-badge">✦ About</div>
            <div className="about-kicker">Creative Director</div>
            <h1 className="about-title">Ekemini Ekwere</h1>
            <p className="about-subtitle">
              Design, direction, and storytelling built to move culture.
            </p>
          </div>
        </section>

        <section className="about-shell">
          <div className="about-layout">
            <section className="project-card about-card">
              <div className="project-card-kicker">Profile</div>
              <h2 className="project-card-title">Biography</h2>
              {bioParagraphs.map((paragraph) => (
                <p key={paragraph} className="project-copy about-copy">
                  {paragraph}
                </p>
              ))}
            </section>

            <aside className="about-rail">
              <section className="project-card about-card">
                <div className="project-card-kicker">Role</div>
                <h2 className="project-card-title">Multidisciplinary Creative Director</h2>
                <p className="project-copy">10 years of graphic design experience across design, video, and art direction.</p>
              </section>

              <section className="project-card about-card">
                <div className="project-card-kicker">Founder</div>
                <h2 className="project-card-title">hwy6</h2>
                <p className="project-copy">Houston-based creative collective built from the ground up for work in sports, music, and entertainment.</p>
              </section>
            </aside>
          </div>
        </section>

        <Footer />
      </main>
    </>
  );
};

export default Contact;