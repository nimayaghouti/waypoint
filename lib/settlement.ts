export interface BalanceData {
  userId: string;
  name: string;
  image: string | null;
  netBalance: number;
}

export interface SuggestedTransaction {
  fromUser: BalanceData;
  toUser: BalanceData;
  amount: number;
}

export function calculateOptimalSettlements(
  balances: BalanceData[],
): SuggestedTransaction[] {
  const activeBalances = balances
    .map(b => ({ ...b }))
    .filter(b => Math.abs(b.netBalance) > 0.01);

  const debtors = activeBalances
    .filter(b => b.netBalance < 0)
    .sort((a, b) => a.netBalance - b.netBalance);
  const creditors = activeBalances
    .filter(b => b.netBalance > 0)
    .sort((a, b) => b.netBalance - a.netBalance);

  const transactions: SuggestedTransaction[] = [];

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
      transactions.push({
        fromUser: debtor,
        toUser: creditor,
        amount: roundedAmount,
      });
    }

    debtor.netBalance += amountToSettle;
    creditor.netBalance -= amountToSettle;

    if (Math.abs(debtor.netBalance) < 0.01) i++;
    if (Math.abs(creditor.netBalance) < 0.01) j++;
  }

  return transactions;
}
