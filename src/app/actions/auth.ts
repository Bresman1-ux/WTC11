"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createAuthActions } from "@insforge/sdk/ssr";
import type { InsForgeError } from "@insforge/sdk";

export type AuthActionState = { error: string | null; message?: string } | undefined;

const EMAIL_MAX_LENGTH = 254;
const PASSWORD_MAX_LENGTH = 200;
const NAME_MAX_LENGTH = 100;

function mapAuthError(error: InsForgeError): string {
  switch (error.error) {
    case "AUTH_INVALID_CREDENTIALS":
    case "AUTH_USER_NOT_FOUND":
      return "Incorrect email or password.";
    case "AUTH_NEED_VERIFICATION":
      return "Please verify your email before logging in.";
    case "AUTH_EMAIL_EXISTS":
      return "An account with that email already exists.";
    case "AUTH_WEAK_PASSWORD":
      return "Please choose a stronger password.";
    case "AUTH_SIGNUP_DISABLED":
      return "Sign-up is currently disabled.";
    default:
      return "Something went wrong. Please try again.";
  }
}

export async function signInAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Email and password are required." };
  }
  if (email.length > EMAIL_MAX_LENGTH || password.length > PASSWORD_MAX_LENGTH) {
    return { error: "Email or password is too long." };
  }

  const auth = createAuthActions({ cookies: await cookies() });

  let signInError: InsForgeError | null;
  try {
    ({ error: signInError } = await auth.signInWithPassword({ email, password }));
  } catch {
    return { error: "The service is temporarily unavailable. Please try again." };
  }

  if (signInError) {
    return { error: mapAuthError(signInError) };
  }

  redirect("/dashboard");
}

export async function signUpAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!name || !email || !password) {
    return { error: "Name, email, and password are required." };
  }
  if (name.length > NAME_MAX_LENGTH) {
    return { error: "Name is too long." };
  }
  if (email.length > EMAIL_MAX_LENGTH || password.length > PASSWORD_MAX_LENGTH) {
    return { error: "Email or password is too long." };
  }
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  const auth = createAuthActions({ cookies: await cookies() });

  let signUpResult: Awaited<ReturnType<typeof auth.signUp>>;
  try {
    signUpResult = await auth.signUp({ email, password, name });
  } catch {
    return { error: "The service is temporarily unavailable. Please try again." };
  }
  const { data, error } = signUpResult;

  if (error) {
    return { error: mapAuthError(error) };
  }

  if (data?.user && !data.user.emailVerified) {
    return {
      error: null,
      message: "Account created. Check your email to verify it, then log in.",
    };
  }

  redirect("/dashboard");
}

export async function signOutAction(): Promise<void> {
  const auth = createAuthActions({ cookies: await cookies() });
  try {
    await auth.signOut();
  } catch {
    // Even if the sign-out call itself fails (e.g. provider unavailable),
    // still send the user to the login page rather than leaving them stuck.
  }
  redirect("/login");
}
