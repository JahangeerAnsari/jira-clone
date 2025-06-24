"use server";
import { cookies } from "next/headers";
import { Account, Client } from "node-appwrite";
import { AUTH_COOKIES } from "./constants";

export const getCurrent = async () => {
  try {
    const client = new Client()
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT!);

    const session = cookies().get(AUTH_COOKIES);

    if (!session?.value) {
      return null;
    }

    // ✅ Set session value to authenticate the user
    client.setSession(session.value);

    const account = new Account(client);

    return await account.get();
  } catch (error) {
    return null;
  }
};
