import { buildBrickexAppUrl, normalizeBrickexSiteOrigin } from "@/lib/brickex-url";

const PROD_DEFAULT_SITE_URL = "https://www.brickex.co";
const DEV_DEFAULT_SITE_URL = "http://app.localhost:3000";

const resolveBaseAppUrl = () => {
  const envUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (envUrl && envUrl.trim().length > 0) {
    return normalizeBrickexSiteOrigin(envUrl.trim());
  }

  const defaultUrl =
    process.env.NODE_ENV === "development"
      ? DEV_DEFAULT_SITE_URL
      : PROD_DEFAULT_SITE_URL;

  return defaultUrl;
};

export const getAppBaseUrl = () => buildBrickexAppUrl(resolveBaseAppUrl(), "");

// Note: Signup and login use the same page
export const getSignupUrl = () => buildBrickexAppUrl(resolveBaseAppUrl(), "/login");

export const getLoginUrl = () => buildBrickexAppUrl(resolveBaseAppUrl(), "/login");

export const getDashboardUrl = () =>
  buildBrickexAppUrl(resolveBaseAppUrl(), "/dashboard");
