declare global {
  namespace Express {
    interface Request {
      identifiedUserId?: string;
    }
  }
}

export {};
