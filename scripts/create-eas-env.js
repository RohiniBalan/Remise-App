const fs = require('fs');

const apiKey = process.env.GOOGLE_AI_API_KEY;

if (!apiKey) {
  console.error('ERROR: GOOGLE_AI_API_KEY is not available in EAS environment.');
  process.exit(1);
}

fs.writeFileSync(
  '.env',
  `GOOGLE_AI_API_KEY=${apiKey}\n`,
  { encoding: 'utf8' }
);

console.log('Created .env for EAS build.');