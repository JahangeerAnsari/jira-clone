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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import Link from "next/link";

export const SignInCard = () => {
  const formSchema = z.object({
    email: z.string(),
    name: z.string(),
    password: z.string(),
  });
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  return (
    <Card className="w-full h-full md:w-[487px] border-none shadow-none">
      <CardHeader className="flex items-center justify-center text-center p-7">
        <CardTitle className="text-2xl">Welcome Back...</CardTitle>
        <CardDescription>Card Description</CardDescription>
      </CardHeader>
      <div className="px-7">
        <DottedSeparator />
      </div>
      <CardContent className="p-7">
        <Form {...form}>
          <form className="space-y-4">
            <FormField
              name="email"
              control={form.control}
              render={({ field }) => (
                <Input
                  type="email"
                  value={""}
                  placeholder="enter email address"
                  required
                  disabled={false}
                  onChange={() => {}}
                />
              )}
            />

            <FormField
              name="password"
              control={form.control}
              render={({ field }) => (
                <Input
                  type="password"
                  value={""}
                  placeholder="enter password"
                  required
                  disabled={false}
                  onChange={() => {}}
                  min={8}
                  max={256}
                />
              )}
            />
            <Button disabled={false} size="lg" className="w-full">
              Login
            </Button>
          </form>
        </Form>
      </CardContent>
      <div className="px-7">
        <DottedSeparator />
      </div>
      <CardContent className="p-7 flex flex-col gap-y-4">
        <Button
          disabled={false}
          size="lg"
          variant="secondary"
          className="w-full"
        >
          <FcGoogle className="mr-2 size-5" />
          Login with Google
        </Button>
        <Button
          disabled={false}
          size="lg"
          variant="secondary"
          className="w-full"
        >
          <FaGithub className="mr-2 size-5" />
          Login with Github
        </Button>
      </CardContent>
      <div className="px-7">
            <DottedSeparator/>
      </div>
      <CardContent className="p-7 flex items-center justify-center">
          <p>
          Dont have an account?
          <Link href="/sign-up">
          <span className="text-blue-700"> Signup</span>
          </Link>
          </p>
      </CardContent>
    </Card>
  );
};
