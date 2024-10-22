import React from 'react';

function Quiz() {
  return (
    <div>
      <header>
        <h1>Quiz</h1>
      </header>
      <div className="box">
        <nav>
          <ul>
            <li><a href="/">Home</a></li> {/* Hier könntest du 'Link' von react-router-dom nutzen */}
          </ul>
        </nav>
      </div>
    </div>
  );
}

export default Quiz;
