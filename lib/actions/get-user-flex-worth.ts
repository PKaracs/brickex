"use server";

export type LeaderboardPeriod = "weekly" | "monthly" | "all";

export interface FlexWorthResult {
  totalFlexWorth: number;
  creationCount: number;
}

export interface FlexWorthError {
  error: string;
}

export async function getUserFlexWorth(): Promise<
  FlexWorthResult | FlexWorthError
> {
  return { totalFlexWorth: 0, creationCount: 0 };
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  userName: string | null;
  userImage: string | null;
  totalFlexWorth: number;
  creationCount: number;
}

export interface LeaderboardWithUserData {
  leaderboard: LeaderboardEntry[];
  userRank: number;
  userFlexWorth: number;
  userCreationCount: number;
}

export async function getLeaderboard(
  limit: number = 20,
  period: LeaderboardPeriod = "all"
): Promise<{ leaderboard: LeaderboardEntry[] } | FlexWorthError> {
  return { leaderboard: [] };
}

export async function getLeaderboardWithUserData(
  limit: number = 20,
  period: LeaderboardPeriod = "all"
): Promise<LeaderboardWithUserData | FlexWorthError> {
  return {
    leaderboard: [],
    userRank: 0,
    userFlexWorth: 0,
    userCreationCount: 0,
  };
}

export async function getUserRank(
  period: LeaderboardPeriod = "all"
): Promise<{ rank: number; totalUsers: number } | FlexWorthError> {
  return { rank: 0, totalUsers: 0 };
}

export async function getUserFlexWorthForPeriod(
  period: LeaderboardPeriod
): Promise<FlexWorthResult | FlexWorthError> {
  return { totalFlexWorth: 0, creationCount: 0 };
}
