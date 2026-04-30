/**
 * Utility functions for payout period calculations
 */

export interface PayoutPeriod {
  startDate: Date;
  endDate: Date;
  label: string;
  key: string; // Format: "YYYY-MM" for the end month
}

/**
 * Calculate date range for a specific payout period
 * @param endMonth - The month (0-11) for the end date (22nd of that month)
 * @param endYear - The year for the end date
 */
export function calculatePayoutPeriod(endMonth: number, endYear: number): PayoutPeriod {
  // End date: 22nd of the specified month
  const endDate = new Date(endYear, endMonth, 22, 23, 59, 59, 999);

  // Start date: 23rd of the previous month
  const startDate = new Date(endYear, endMonth - 1, 23, 0, 0, 0, 0);

  // Format label: "MMM YYYY, 23 - MMM YYYY, 22"
  const startMonthName = startDate.toLocaleDateString("en-US", { month: "short" });
  const startYear = startDate.getFullYear();
  const endMonthName = endDate.toLocaleDateString("en-US", { month: "short" });
  const endYearStr = endDate.getFullYear();

  const label = `${startMonthName} ${startYear}, 23 - ${endMonthName} ${endYearStr}, 22`;
  const key = `${endYear}-${String(endMonth + 1).padStart(2, "0")}`;

  return { startDate, endDate, label, key };
}

/**
 * Get the current payout period (previous month's 23rd to this month's 22nd)
 */
export function getCurrentPayoutPeriod(): PayoutPeriod {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  return calculatePayoutPeriod(currentMonth, currentYear);
}

/**
 * Get the past N payout periods including the current one
 * @param count - Number of periods to return (default: 3)
 */
export function getPastPayoutPeriods(count: number = 3): PayoutPeriod[] {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const periods: PayoutPeriod[] = [];

  for (let i = 0; i < count; i++) {
    const month = currentMonth - i;
    const year = currentYear;

    // Handle year rollover
    let actualMonth = month;
    let actualYear = year;

    if (actualMonth < 0) {
      actualMonth += 12;
      actualYear -= 1;
    }

    periods.push(calculatePayoutPeriod(actualMonth, actualYear));
  }

  return periods;
}
