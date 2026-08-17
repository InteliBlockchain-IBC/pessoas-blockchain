import 'express';

declare module 'express' {
  interface Request {
    user?: {
      id: string;
      role: string;
      status: string;
      name: string | null;
      email: string;
      image: string | null;
    };
  }
}
