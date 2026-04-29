import { api } from "./client";

export type FileType = "IMAGE" | "DOCUMENT";

export interface FileDto {
  id: number;
  name: string;
  extension: string;
  url: string;
}

export async function uploadFiles(args: {
  files: File[];
  types: FileType[];
}): Promise<FileDto[]> {
  const form = new FormData();

  args.files.forEach((f) => form.append("files", f));
  args.types.forEach((t) => form.append("types", t));

  const res = await api.post<FileDto[]>("/files", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

export async function getFiles(ids: number[]): Promise<FileDto[]> {
  if (ids.length === 0) return [];
  const unique = Array.from(new Set(ids));
  const query = unique.map((id) => `ids=${encodeURIComponent(id)}`).join("&");
  const res = await api.get<FileDto[]>(`/files?${query}`);
  return res.data;
}
