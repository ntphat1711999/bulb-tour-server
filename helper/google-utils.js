const { google } = require("googleapis");
require("dotenv").config();
const OAuth2 = google.auth.OAuth2;

const googleConfig = {
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  redirect: process.env.GOOGLE_REDIRECT_URL,
};

const defaultScope = [
  "profile",
  "https://www.googleapis.com/auth/userinfo.email",
];

const createConnection = () => {
  return new OAuth2(
    googleConfig.clientId,
    googleConfig.clientSecret,
    googleConfig.redirect
  );
};

const getConnectionUrl = (auth) => {
  return auth.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: defaultScope,
  });
};

const getGooglePeopleApi = (auth) => {
  return google.people({
    version: "v1",
    auth,
  });
};

const urlGoogle = () => {
  const auth = createConnection();
  const url = getConnectionUrl(auth);
  return url;
};

const getGoogleAccountFromCode = async (code) => {
  const fields = ["names", "emailAddresses"];
  const auth = createConnection();
  const data = await auth.getToken(code);
  const tokens = data.tokens;
  auth.setCredentials(tokens);
  const people = getGooglePeopleApi(auth);
  const user = await people.people.get({
    resourceName: "people/me",
    personFields: fields.join(","),
  });
  const userGoogleId = user.data.etag;
  const userGoogleEmail =
    user.data.emailAddresses &&
    user.data.emailAddresses.length &&
    user.data.emailAddresses[0].value;
  const username =
    user.data.names && user.data.names.length && user.data.names[0].displayName;
  return {
    password: userGoogleId,
    email: userGoogleEmail,
    name: username,
  };
};
module.exports = { urlGoogle, getGoogleAccountFromCode };
