"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";


import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { createProjectSchema } from "../schema";
import { useCreateProject } from "../api/use-create-project";
import { FaFileUpload } from "react-icons/fa";

// Omit workspaceId for the form
const createProjectFormSchema = createProjectSchema.omit({ workspaceId: true });
type CreateProjectFormValues = z.infer<typeof createProjectFormSchema>;

export const CreateProjectModal = () => {
  const workspaceId = useWorkspaceId(); // custom hook to get workspaceId

  const form = useForm<CreateProjectFormValues>({
    resolver: zodResolver(createProjectFormSchema),
    defaultValues: {
      name: "",
      image: undefined,
    },
  });

  const { mutate: createProject, isPending } = useCreateProject();

  const onSubmit = (values: CreateProjectFormValues) => {
    if (!workspaceId) return;

    createProject({
      ...values,
      workspaceId, // inject here
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Project Name */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Project name</FormLabel>
              <FormControl>
                <Input
                  disabled={isPending}
                  placeholder="Enter project name"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* File Upload */}
        <FormField
          control={form.control}
          name="image"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Upload an image</FormLabel>
              <FormControl>
                <FaFileUpload
                  endpoint="projectImage"
                  value={field.value}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Submit Button */}
        <Button type="submit" disabled={isPending}>
          Create
        </Button>
      </form>
    </Form>
  );
};
