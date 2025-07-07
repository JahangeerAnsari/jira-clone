"use client";

import { useRef, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { createWorkspaceSchema } from "../schemas";
import { useCreateWorkspace } from "../api/use-create-workspace";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DottedSeparator } from "@/components/dotted-separator";
import { ImageIcon } from "lucide-react";
import Image from "next/image";

interface CreateWorkspaceFormProps {
  onClick?: () => void;
}

export const CreateWorkspaceForm = ({ onClick }: CreateWorkspaceFormProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { mutate, isPending } = useCreateWorkspace();

  const form = useForm<z.infer<typeof createWorkspaceSchema>>({
    resolver: zodResolver(createWorkspaceSchema),
    defaultValues: {
      name: "",
      image: undefined,
    },
  });

  const imageValue = form.watch("image");

  useEffect(() => {
    if (imageValue instanceof File) {
      const url = URL.createObjectURL(imageValue);
      return () => URL.revokeObjectURL(url);
    }
  }, [imageValue]);

  const onSubmit = (values: z.infer<typeof createWorkspaceSchema>) => {
    const finalValue = {
      ...values,
      image: values.image instanceof File ? values.image : "",
    };
    mutate({ form: finalValue });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      form.setValue("image", file);
    }
  };

  return (
    <Card className="w-full h-full border-none shadow-none">
      <CardHeader className="flex p-7">
        <CardTitle className="text-xl font-bold">
          Create a new workspace
        </CardTitle>
      </CardHeader>

      <div className="px-7">
        <DottedSeparator />
      </div>

      <CardContent className="p-7">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-y-4">
              {/* Workspace Name */}
              <FormField
                name="name"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        {...field}
                        type="text"
                        placeholder="e.g. Marketing Team"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Workspace Image Upload */}
              <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <div className="flex flex-col gap-y-2">
                    <div className="flex items-center gap-x-5">
                      {field.value ? (
                        <div className="size-[72px] relative rounded-md overflow-hidden">
                          <Image
                            fill
                            className="object-cover"
                            src={
                              field.value instanceof File
                                ? URL.createObjectURL(field.value)
                                : field.value
                            }
                            alt="workspace icon"
                          />
                        </div>
                      ) : (
                        <Avatar className="size-[72px]">
                          <AvatarFallback>
                            {form.watch("name")?.charAt(0).toUpperCase() || (
                              <ImageIcon className="size-[36px] text-neutral-400" />
                            )}
                          </AvatarFallback>
                        </Avatar>
                      )}

                      <div className="flex flex-col">
                        <p className="text-sm font-medium">Workspace Icon</p>
                        <p className="text-sm text-muted-foreground">
                          Supported formats: JPG, PNG, SVG
                        </p>

                        <input
                          className="hidden"
                          type="file"
                          accept=".jpg,.jpeg,.png,.svg"
                          aria-label="Upload workspace icon"
                          ref={inputRef}
                          onChange={handleImageChange}
                          disabled={isPending}
                        />

                        <Button
                          type="button"
                          disabled={isPending}
                          className="w-fit mt-2"
                          onClick={() => inputRef.current?.click()}
                        >
                          Upload Image
                        </Button>

                        {field.value instanceof File && (
                          <span className="text-xs text-muted-foreground mt-1">
                            {field.value.name} -{" "}
                            {(field.value.size / 1024).toFixed(2)} KB
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              />
            </div>

            <DottedSeparator className="py-7" />

            {/* Action Buttons */}
            <div className="flex items-center justify-between">
              <Button
                type="button"
                size="lg"
                variant="secondary"
                onClick={onClick}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type="submit" size="lg" disabled={isPending}>
                Create Workspace
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
