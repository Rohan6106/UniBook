import admin from 'firebase-admin';

// This guard clause is crucial for good error messages.


const serviceAccount = {
  type: 'service_account',
  project_id: "pro-book-marketplace",
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  // This line will no longer fail
  private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCpiMFiHvj7GJ3T\n3EPJXRqoH1u2V3kAvNTVaF7P1lxyir1HJEfp+Pd+Dwm4p7ZBvCzyv4eR7z7scd62\nlMu5cdFx8yKplKdB6BMbqEPVnrLqsKDNqIBLH/6s7XX+5FdwXLY9VMpVmhk+peeI\nboMKk4RkQYYBl0603ddjmjqOt5Xw+rAnrP3kylbp4qOcmhGeIH0XMFOYoWZuKBkP\n9rsljxDzMq8eXNu3pEqXV5mNxZxviOnV7YWcucMyILkiaTp4xHFodBFJpoSbro2M\nEzk18qbZ44G+pRekN4t/49rMBJb1dLAoZqxTt5B09xJDbJn2McehRs/526d5f7iM\nIlwYju5hAgMBAAECggEAF0n43XdJbF5J1BWRNE4MwDqqjnEUEhoJQhW31zo9xzha\n3wp+BzH9zFHZhoXMyi6aSBsvzvLRhIlHTHKX99jJqlXO6wJyOuIGufO9TyZMCA8N\nJU337cSukhJ+ypiTOxVpWCHX4mGBr/L6IZT40xDyYhQENMoUdFEjP69V9aQE6Nj1\nqZBEPL3I4X8kwzOOvovCC8+vN24yLLf7Mlh9FHF6gSKrRE4YDqpRsoAhO54POxU5\nDxL4TQJKJX3/8JmwkzhHqYoc9kWeA1ZftJAqTxyL/VIGDymSF3BiebsgXvkZyQ9J\nja6s2zpmr3JQrLTEyQzeWLeeCuedu6i7krjJzoQbVwKBgQDmB7G8FIh/27ir8i7E\nuxUHT241CZu2Q52xBlgq2BB/bQIbg+p/mY2sbWe38GGpqF3hd7Ic0tMqnJjXpURP\nJMIAjCcGBjUax59VFXo9275afY5erVcQBWw8/K83nolBK4h7Ps3GmLDOMvdXmlg2\nyaWA1i4RESz7wI1WwxrGUNUcdwKBgQC8rJ2vsCJJk3WX/7dtrfcRt/SvtYks9S++\nAzFDtrHQwILA0QS0/qlCQrzaF2E95788BHhJ3Z0MRn6ytakq8ODIBT1/zNOsccyR\nCXEwpF914o/a3oxqLWwrMAdl/IREF7N/lIkToNINJaJwNgRcCEnPvudSe9dIQIOU\nylUGCiJ55wKBgBnvUiWvdvhbcIXKZ2V85lENrpJCRBEXrIbR/UzPUYTcaHlrtRuv\n115Sc3g0nP5A4lzSXv2K844BW+YsVvhJX6oqIxg1yPT8/sTcCA1DYkHXmB6qkn9W\n7S4vGx49PKJhYyDqIs86VezZqDNzTnDW6VcOTuFTu2ui+QyIMNOdN3nfAoGAJNjV\nRt1wJMxel9vB9/KUoOo7KCGc86HCvColceL5IRqnrn5jm/FsHtunxDPyssNSrqb0\n0wArzpzp237s1c0LKSUU2KOo5zGmUOD2MRi45+3iSE1UQNw0Fs8fcsR5FE9Ip+7b\nQnES9KxX5/A0s8COobrXtF0pMxweVm2ZYz+RchsCgYEAgSAcEOLhilv1fm9wz4+8\nXP2ghb6KBuk1Vwgy3xswfE+5/ZZ+ETy+z/oAPmprm5UGDKUX0UjODIXrpfyb9fNR\nQtrmCHBq08YoGYb3fgie9dr2yOxotpGxDvEgKOIzMIIXwyvlavEFpBZ3JfaT3S3O\nLQEMbxABbOmcDcUn5K0239I=\n-----END PRIVATE KEY-----\n",
  client_email: "firebase-adminsdk-fbsvc@pro-book-marketplace.iam.gserviceaccount.com",
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: 'https://accounts.google.com/o/oauth2/auth',
  token_uri: 'https://oauth2.googleapis.com/token',
  auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
  client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${encodeURIComponent(
    process.env.FIREBASE_CLIENT_EMAIL || ''
  )}`,
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export default admin;