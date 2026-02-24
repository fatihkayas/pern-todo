import { AuthPayload } from "./index";

// Extend Express Request with authenticated customer
declare global {
  namespace Express {
    interface Request {
      customer?: AuthPayload;
    }
  }
}
