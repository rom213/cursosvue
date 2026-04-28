export {};

declare global {
  interface FacebookLoginStatusResponse {
    authResponse?: { accessToken: string } | null;
    status: string;
  }

  interface FacebookStatic {
    init(params: { appId: string; cookie?: boolean; xfbml?: boolean; version: string }): void;
    login(
      callback: (response: FacebookLoginStatusResponse) => void,
      options: { scope: string; return_scopes?: boolean }
    ): void;
  }

  interface Window {
    FB: FacebookStatic;
    fbAsyncInit?: () => void;
  }
}
