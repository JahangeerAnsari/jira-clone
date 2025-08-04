// schema.ts
import { z } from "zod";

// Full schema (for backend)
export const createProjectSchema = z.object({
  name: z.string().trim().min(1, "Required"),
  image: z
    .union([
      z.instanceof(File),
      z.string().transform((value) => (value === "" ? undefined : value)),
    ])
    .optional(),
  workspaceId: z.string(),
});

// Form schema (omit workspaceId for form-level validation)
export const createProjectFormSchema = createProjectSchema.omit({
  workspaceId: true,
});

export const UpdateProjectSchema = z.object({
  name: z.string().trim().min(1, "Mininum 1 character required").optional(),
  image: z
    .union([
      z.instanceof(File),
      z.string().transform((value) => (value === "" ? undefined : value)),
    ])
    .optional(),
});
