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

// Optional: if google-services.json is stored as an EAS secret base64 string
const googleServicesBase64 = process.env.GOOGLE_SERVICES_JSON_BASE64;
if (googleServicesBase64) {
  try {
    const decoded = Buffer.from(googleServicesBase64, 'base64').toString('utf8');
    fs.writeFileSync('android/app/google-services.json', decoded, { encoding: 'utf8' });
    console.log('Wrote android/app/google-services.json from GOOGLE_SERVICES_JSON_BASE64 secret.');
  } catch (err) {
    console.warn('Could not decode GOOGLE_SERVICES_JSON_BASE64:', err.message);
  }
}