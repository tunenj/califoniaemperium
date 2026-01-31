// types/global.d.ts
declare global {
  interface Global {
    __lastOTP?: string;
    __lastEmail?: string;
    __lastPhoneOTP?: string;
    __lastPhone?: string;
    __otpStore?: Record<string, string>;
  }
  
  // Declare these as properties on globalThis
  var __lastOTP: string | undefined;
  var __lastEmail: string | undefined;
  var __lastPhoneOTP: string | undefined;
  var __lastPhone: string | undefined;
  var __otpStore: Record<string, string> | undefined;
}
export {};