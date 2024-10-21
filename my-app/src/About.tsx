import React from 'react';

function About() {
  return (
    <div>
      <header>
        <h1>Skibidi Toilett</h1>
      </header>
      <div className="box">
        <nav>
          <ul>
            <li><a href="/">Home</a></li>
          </ul>
        </nav>
      </div>
      <main>
        <section>
          <h2>Über mich</h2>
          <p>Medien Informatik Student seit 2023</p>
          {/* Hier könnte später eine Animation eingefügt werden */}
          <p>Java, TypeScript, HTML, CSS, C# Programmierer</p>
          <p>
            Hier ist mein GitHub:{" "}
            <a href="https://github.com/EnesYildiz24?tab=repositories">Meine GitHub Repositories</a>
          </p>
        </section>
      </main>
    </div>
  );
}

export default About;
