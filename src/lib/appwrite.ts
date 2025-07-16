import { AUTH_COOKIES } from "@/features/auth/constants";
import { cookies } from "next/headers";
import { Account, Client, Databases, Storage, Users } from "node-appwrite";
export async function createSessionClient(){
     const client = new Client()
          .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
          .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT!);
    
        const session = cookies().get(AUTH_COOKIES);
    
        if (!session?.value) {
           throw new Error("Unauthorized")
    }
     // ✅ Set session value to authenticate the user
        client.setSession(session.value);
    return {
        get account() {
            return new Account(client);
        },
        get databases() {
            return new Databases(client)
        }
      }
}
export async function createAdminClient() {
    const client =new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT!)
    .setKey(process.env.NEXT__APPWRITE_KEY!);

    return {
      get account() {
        return new Account(client);
      },
      get users() {
        return new Users(client);
      },
    };
}