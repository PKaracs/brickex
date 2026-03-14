const PROD_DEFAULT_APP_URL = "https://app.brickex.co";
const DEV_DEFAULT_APP_URL = "http://app.localhost:3000";

const sanitizeUrl = (url: string) => url.replace(/\/$/, "");

const resolveBaseAppUrl = () => {
  const envUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (envUrl && envUrl.trim().length > 0) {
    return sanitizeUrl(envUrl.trim());
  }

  const defaultUrl =
    process.env.NODE_ENV === "development"
      ? DEV_DEFAULT_APP_URL
      : PROD_DEFAULT_APP_URL;

  return defaultUrl;
};

export const getAppBaseUrl = () => resolveBaseAppUrl();

// Note: Signup and login use the same page
export const getSignupUrl = () => `${getAppBaseUrl()}/login`;

export const getLoginUrl = () => `${getAppBaseUrl()}/login`;

export const getDashboardUrl = () => `${getAppBaseUrl()}/dashboard`;
