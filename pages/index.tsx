import React from 'react';
import Link from 'next/link';

const HomePage: React.FC = () => {
  return (
    <div>
      <h1>Welcome to My App</h1>
      <nav>
        <ul>
          <li>
            <Link href="/feedback">Feedback</Link>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default HomePage;