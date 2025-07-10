"use server";
import { createSessionClient } from "@/lib/appwrite";
export const getCurrent = async () => {
  try {
   
    const { account, databases, } = await createSessionClient();
    return await account.get();
  } catch (error) {
    return null;
  }
};
 