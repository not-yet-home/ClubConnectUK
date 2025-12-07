"use client"
import { Teacher } from "@/types/teacher.types"
import { ColumnDef } from "@tanstack/react-table"

export const columns: ColumnDef<Teacher>[] = [
  {
    accessorKey: "first_name",
    header: "First Name",
  },
  {
    accessorKey: "last_name",
    header: "Last Name",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "department",
    header: "Department",
  },
  {
    accessorKey: "phone",
    header: "Phone",
  },
  {
    accessorKey: "school_id",
    header: "School ID",
  },
]