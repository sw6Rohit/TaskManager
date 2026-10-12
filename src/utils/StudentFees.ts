export type FeeInstallment = {
  id: string;
  title: string;
  dueDate: string;
  fees: number;
  concession: number;
  tax: number;
  paid: number;
  fine: number;
};

export const feeBalance = (fee: FeeInstallment) =>
  Math.max(0, fee.fees - fee.concession + fee.tax + fee.fine - fee.paid);

export const feeTotals = (fees: FeeInstallment[]) =>
  fees.reduce(
    (total, fee) => ({
      fees: total.fees + fee.fees,
      concession: total.concession + fee.concession,
      tax: total.tax + fee.tax,
      paid: total.paid + fee.paid,
      fine: total.fine + fee.fine,
      balance: total.balance + feeBalance(fee),
    }),
    {fees: 0, concession: 0, tax: 0, paid: 0, fine: 0, balance: 0},
  );

// Visual reference only. Never use these rows as a student's real ledger.
export const previewInstallments: FeeInstallment[] = [
  {
    id: '01',
    title: 'Tuition Fee',
    dueDate: '2026-04-01',
    fees: 5000,
    concession: 0,
    tax: 0,
    paid: 5000,
    fine: 0,
  },
  {
    id: '02',
    title: 'Tuition Fee',
    dueDate: '2026-04-01',
    fees: 5000,
    concession: 2722,
    tax: 0,
    paid: 1500,
    fine: 0,
  },
];
