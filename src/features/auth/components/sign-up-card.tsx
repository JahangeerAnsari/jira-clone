"use client";
import { DottedSeparator } from "@/components/dotted-separator";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import Link from "next/link";
export const SignUpCard = () => {
  return (
    <Card className="w-full h-full md:w-[487px] border-none shadow-none">
      <CardHeader className="flex items-center justify-center text-center p-7">
        <CardTitle className="text-2xl">Sign Up</CardTitle>
        <CardDescription>
          By Signup, you agree to our{" "}
          <Link href="/privacy">
          <span className="text-blue-700">Privacy Policy</span>
          </Link>{" "}
          and{" "}
          <Link href="/terms">
          <span className="text-blue-700">Terms of Service</span>
          </Link>
        </CardDescription>
       
      </CardHeader>
      <div className="px-7">
        <DottedSeparator/>
      </div>
      <CardContent className="p-7">
       <form className="space-y-4">
        <Input
         type="text"
         value={""}
         placeholder="enter name"
         required
         disabled={false}
         onChange={()=>{}}
        />
        <Input
         type="email"
         value={""}
         placeholder="enter email address"
         required
         disabled={false}
         onChange={()=>{}}
        />
         <Input
         type="password"
         value={""}
         placeholder="enter password"
         required
         disabled={false}
         onChange={()=>{}}
         min={8}
         max={256}
        />
        <Button disabled={false} size="lg"  className="w-full">
            Login
        </Button>
       </form>
      </CardContent>
      <div className="px-7">
        <DottedSeparator/>
      </div>
      <CardContent className="p-7 flex flex-col gap-y-4">
        <Button disabled={false} size="lg" variant="secondary" className="w-full">
            <FcGoogle className="mr-2 size-5"/>
            Login with Google
        </Button>
        <Button disabled={false} size="lg" variant="secondary" className="w-full">
             <FaGithub className="mr-2 size-5"/>
            Login with Github
        </Button>
      </CardContent>
    </Card>
  );
};
