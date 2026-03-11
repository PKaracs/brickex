"use server";

export interface AddFlexWorthResult {
  success: boolean;
  newTotal?: number;
  error?: string;
}

export async function addFlexWorth(
  amount: number,
  source: string = "flex_game"
): Promise<AddFlexWorthResult> {
  return { success: true, newTotal: amount };
}
