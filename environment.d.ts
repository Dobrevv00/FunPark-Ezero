/**
 * Типове за променливите на средата, които Payload използва.
 * Стойностите идват от .env.local / Vercel и никога не се пишат в кода.
 */
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DATABASE_URL: string;
      PAYLOAD_SECRET: string;
      /**
       * Дълготраен токен за Instagram API (Instagram Login) — за най-новите
       * Reels в „Последвайте ни“. Незадължителен: без него секцията показва
       * статичните карти. Подновява се на ~60 дни от Meta приложението.
       */
      INSTAGRAM_ACCESS_TOKEN?: string;
    }
  }
}

export {};
