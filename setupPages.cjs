const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, 'src', 'pages');

if (!fs.existsSync(pagesDir)) {
    fs.mkdirSync(pagesDir, { recursive: true });
}

const pages = [
    'Landing', 'Register', 'VerifyOTP', 'Login',
    'Dashboard', 'ProfileUpdate', 'Matches', 'ProfileView'
];

pages.forEach(page => {
    const content = `import React from 'react';

const ${page} = () => {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">${page}</h1>
    </div>
  );
};

export default ${page};
`;
    fs.writeFileSync(path.join(pagesDir, `${page}.jsx`), content);
});

console.log('Pages created successfully.');
