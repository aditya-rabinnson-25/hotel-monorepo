// apps/web/src/lib/auth.ts
import { PrismaClient } from "@prisma/client";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { organization } from "better-auth/plugins";
import type { NextRequest } from "next/server";
import { createAuthClient } from "better-auth/react";

const prisma = new PrismaClient();

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET!,
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  adapter: prismaAdapter(prisma, { provider: "sqlite" }),

  plugins: [
    organization(), // ✅ keep plugin
  ],

  emailAndPassword: {
    enabled: true,
  },

  // ✅ v2 style events (replace old hooks/session/signUp)
  events: {
  // payload typed as `any` to avoid inference issues from the library typings;
  // this is safe because we only use well-known fields below.
  async onUserSignUp(payload: any) {
    const { user, data /*, ctx */ } = payload;
    const hotelId = data?.metadata?.hotelId as string | undefined;
    const hotelName = data?.metadata?.hotelName as string | undefined;

    let hotel = null;
    if (hotelId) {
      hotel = await prisma.hotel.findUnique({ where: { id: hotelId } });
    } else if (hotelName) {
      hotel = await prisma.hotel.create({
        data: { name: hotelName, kycStatus: "pending" },
      });
    }

    // Ensure we don't overwrite existing fields, only set tenant/role/status
    await prisma.user.update({
      where: { id: user.id },
      data: {
        hotelId: hotel?.id ?? null,
        role: "viewer",
        status: "active",
      },
    });
  },

  async onSessionCreate(payload: any) {
    const { session, user, request } = payload;
    const req = request as Request | undefined; // NextRequest extends Request in runtime
    const ua =
      // NextRequest headers API:
      (req as any)?.headers?.get?.("user-agent") ??
      (typeof globalThis !== "undefined" &&
        // fallback if running in edge or node env where headers differ
        (globalThis as any).navigator?.userAgent) ??
      undefined;

    // Use the header x-forwarded-for / x-real-ip if present
    const ip =
      (req as any)?.headers?.get?.("x-forwarded-for") ??
      (req as any)?.headers?.get?.("x-real-ip") ??
      undefined;

    await prisma.device.upsert({
      where: { id: `${user.id}-${ua ?? "unknown"}`.slice(0, 48) },
      create: {
        id: `${user.id}-${ua ?? "unknown"}`.slice(0, 48),
        userId: user.id,
        name: ua?.slice(0, 64),
        lastSeenAt: new Date(),
      },
      update: { lastSeenAt: new Date(), name: ua?.slice(0, 64) },
    });

    // Optionally persist a server-side session snapshot to your sessions table
    // (only if you still rely on your own `Session` model)
    if (session?.id) {
      await prisma.session.upsert({
        where: { id: session.id },
        create: {
          id: session.id,
          userId: user.id,
          token: session.token ?? session.id,
          hotelId: (user as any).hotelId ?? null,
          expiresAt: session.expiresAt,
          ipAddress: ip ?? null,
          userAgent: ua ?? null,
        },
        update: {
          expiresAt: session.expiresAt,
          ipAddress: ip ?? null,
          userAgent: ua ?? null,
        },
      });
    }
  },
},
});

export type { Session } from "better-auth";
