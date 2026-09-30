import type { Request, Response } from "express";
import { db } from "../db";
import { etablissement } from "../db/schema";

export const createEtablissement = async (req: Request, res: Response) => {
  try {
    const data = {
      ...req.body,
      userId: "NZHcG5uSmp0WDQantJBUcE30eO3kiKcY",
    };

    const newEtablissement = await db
      .insert(etablissement)
      .values(data)
      .returning({
        id: etablissement.id,
      });

    return res.status(201).json({
      success: true,
      message: "Établissement créé avec succès",
      etablissement: newEtablissement[0],
    });
  } catch (error: any) {
    console.error("❌ Erreur création établissement :", error);

    if (error?.cause?.code === "23505") {
      return res.status(409).json({
        success: false,
        message: "Un établissement avec ce nom existe déjà.",
        field: "name",
      });
    }

    return res.status(500).json({
      success: false,
      message:
        "Une erreur est survenue lors de la création de l'établissement.",
    });
  }
};

export const getEtablissements = async (req: Request, res: Response) => {};

export const getEtablissementById = async (req: Request, res: Response) => {};

export const updateEtablissement = async (req: Request, res: Response) => {};

export const deleteEtablissement = async (req: Request, res: Response) => {};
