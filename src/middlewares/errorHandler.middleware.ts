import { NextFunction, Request, Response } from "express";

import { ZodError } from "zod";
import { ErrorCodes, Status } from "../types";
import { BadRequestError, ForbiddenError, InternalServerError, NotFoundError, UnauthorizedError } from "../error-handling/Errors";
import { TokenExpiredError } from "jsonwebtoken";

// For invalid routes and methods
export const invalidRouteHandler = (req: Request, res: Response) => {
  res.status(Status.NotFound).json({ error: ErrorCodes.ERR_004, method: req.method, url: req.url });
};

export const globalErrorHandler = (error: any, req: Request, res: Response, next: NextFunction) => {
  if (error instanceof SyntaxError && "body" in error) {
    res.status(Status.BadRequest).json();
    return;
  }

  if (error instanceof ZodError) {
    res.status(Status.BadRequest).json({ error: error.flatten() });
    return;
  }

  if (error.message.includes("Failed query")) {
    res.status(Status.InternalServerError).json({ error: error.message });
    return;
  }

  if (error instanceof BadRequestError) {
    res.status(Status.BadRequest).json({ error: error.message });
    return;
  }

  if (error instanceof UnauthorizedError) {
    res.status(Status.Unauthorized).json({ error: error.message });
    return;
  }
  if (error instanceof ForbiddenError) {
    res.status(Status.Forbidden).json({ error: error.message });
    return;
  }

  if (error instanceof NotFoundError) {
    res.status(Status.NotFound).json({ error: error.message });
    return;
  }
  if (error instanceof InternalServerError) {
    res.status(Status.InternalServerError).json({ error: error.message });
    return;
  }
  if (error instanceof TokenExpiredError) {
    res.status(Status.Unauthorized).json({ errorCode: "ERR_012", error: ErrorCodes.ERR_012 });
    return;
  }

  console.error("Unhandled error -", error);
  res.status(Status.InternalServerError).json({ error: ErrorCodes.ERR_005 });
};
