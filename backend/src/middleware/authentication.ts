import type { Request, Response, NextFunction } from "express";
import { fromNodeHeaders } from "better-auth/node";
import type { Session, User } from "better-auth";
import { auth } from "../lib/auth.js";

export type AuthenticatedUser = User & { role?: string | null };
export type AuthenticatedSession = Session;

export type AuthenticatedLocals = {
  user: AuthenticatedUser;
  session: AuthenticatedSession;
};

export const requireAuthentication = async (
  req: Request,
  res: Response<unknown, Partial<AuthenticatedLocals>>,
  next: NextFunction,
) => {
  try {
    const sessionData = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!sessionData) {
      return res.status(401).json({
        success: false,
        message: "Authentification requise.",
      });
    }

    res.locals.user = sessionData.user as AuthenticatedUser;
    res.locals.session = sessionData.session;
    return next();
  } catch (error) {
    console.error("Erreur vérification session :", error);
    return res.status(401).json({
      success: false,
      message: "Session invalide ou expirée.",
    });
  }
};

export const requireRole = (...allowedRoles: string[]) => (
  _req: Request,
  res: Response<unknown, Partial<AuthenticatedLocals>>,
  next: NextFunction,
) => {
  const user = res.locals.user;
  if (!user) {
    return res.status(401).json({
      success: false,
      message: "Authentification requise.",
    });
  }

  const roles = String(user.role ?? "patient").split(",").map((role) => role.trim());
  if (roles.includes("superadmin") || roles.some((role) => allowedRoles.includes(role))) {
    return next();
  }

  return res.status(403).json({
    success: false,
    message: "Vous n'avez pas les droits nécessaires pour effectuer cette action.",
  });
};
