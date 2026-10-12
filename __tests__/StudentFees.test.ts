import {
  feeBalance,
  feeTotals,
  previewInstallments,
} from '../src/utils/StudentFees';

test('reconciles the reference ledger after concessions and payments', () => {
  expect(feeTotals(previewInstallments)).toEqual({
    fees: 10000,
    concession: 2722,
    tax: 0,
    paid: 6500,
    fine: 0,
    balance: 778,
  });
  expect(feeBalance(previewInstallments[0])).toBe(0);
  expect(feeBalance(previewInstallments[1])).toBe(778);
});

test('includes tax and fine without making an overpaid installment payable', () => {
  expect(feeBalance({...previewInstallments[1], tax: 50, fine: 100})).toBe(928);
  expect(feeBalance({...previewInstallments[1], paid: 9000})).toBe(0);
  expect(feeTotals([]).balance).toBe(0);
});
