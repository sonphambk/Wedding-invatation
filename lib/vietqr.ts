export const VN_BANKS: Record<string, string> = {
  VCB: 'Vietcombank',
  TCB: 'Techcombank',
  ACB: 'ACB',
  MB: 'MB Bank',
  VPB: 'VPBank',
  TPB: 'TPBank',
  STB: 'Sacombank',
  BIDV: 'BIDV',
  CTG: 'VietinBank',
  VIB: 'VIB',
};

export function vietqrUrl(bankCode: string, accountNumber: string): string {
  return `https://img.vietqr.io/image/${bankCode}-${accountNumber}-qr_only.jpg`;
}
