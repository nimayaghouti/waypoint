export interface BalanceData {
  userId: string;
  name: string;
  image: string | null;
  netBalance: number;
  currency: string;
}

export interface SuggestedTransaction {
  fromUser: BalanceData;
  toUser: BalanceData;
  amount: number;
  currency: string;
}

export function calculateOptimalSettlements(
  balances: BalanceData[],
): SuggestedTransaction[] {
  const groupedBalances = balances.reduce(
    (acc, b) => {
      if (!acc[b.currency]) acc[b.currency] = [];
      acc[b.currency].push(b);
      return acc;
    },
    {} as Record<string, BalanceData[]>,
  );

  const allTransactions: SuggestedTransaction[] = [];

  for (const currency in groupedBalances) {
    const currencyBalances = groupedBalances[currency];

    const activeBalances = currencyBalances
      .map(b => ({ ...b }))
      .filter(b => Math.abs(b.netBalance) > 0.01);

    const debtors = activeBalances
      .filter(b => b.netBalance < 0)
      .sort((a, b) => a.netBalance - b.netBalance);
    const creditors = activeBalances
      .filter(b => b.netBalance > 0)
      .sort((a, b) => b.netBalance - a.netBalance);

    let i = 0;
    let j = 0;

    while (i < debtors.length && j < creditors.length) {
      const debtor = debtors[i];
      const creditor = creditors[j];

      const amountToSettle = Math.min(
        Math.abs(debtor.netBalance),
        creditor.netBalance,
      );
      const roundedAmount = Math.round(amountToSettle * 100) / 100;

      if (roundedAmount > 0) {
        allTransactions.push({
          fromUser: debtor,
          toUser: creditor,
          amount: roundedAmount,
          currency,
        });
      }

      debtor.netBalance += amountToSettle;
      creditor.netBalance -= amountToSettle;

      if (Math.abs(debtor.netBalance) < 0.01) i++;
      if (Math.abs(creditor.netBalance) < 0.01) j++;
    }
  }

  return allTransactions;
}
