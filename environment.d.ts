/**
 * Типове за променливите на средата, които Payload използва.
 * Стойностите идват от .env.local / Vercel и никога не се пишат в кода.
 */
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DATABASE_URL: string;
      PAYLOAD_SECRET: string;
    }
  }
}

export {};
