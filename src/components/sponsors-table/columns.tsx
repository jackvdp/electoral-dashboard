import { ColumnDef } from "@tanstack/react-table"
import { Sponsor } from "@/types"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, MoreHorizontal, Mail } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { EditableCell } from "./editable-cell"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface CreateColumnsProps {
    updateSponsor: (id: string, updates: Partial<Sponsor>) => Promise<void>
    deleteSponsor: (id: string) => Promise<void>
}

export const createColumns = ({
    updateSponsor,
    deleteSponsor,
}: CreateColumnsProps): ColumnDef<Sponsor>[] => [
        {
            id: "select",
            header: ({ table }) => (
                <Checkbox
                    checked={table.getIsAllPageRowsSelected()}
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Select all"
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label="Select row"
                />
            ),
        },
        {
            accessorKey: "name",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Company
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
            cell: ({ row }) => (
                <EditableCell
                    value={row.getValue("name")}
                    row={row}
                    column={{ id: "name" }}
                    onUpdate={(value) => updateSponsor(row.original.id, { name: value })}
                />
            ),
        },
        {
            accessorKey: "initialContact",
            header: "Initial Contact",
            cell: ({ row }) => (
                <Checkbox
                    checked={row.getValue("initialContact")}
                    onCheckedChange={(checked) => {
                        updateSponsor(row.original.id, { initialContact: !!checked })
                    }}
                    aria-label="Toggle initial contact"
                />
            ),
        },
        {
            accessorKey: "exhibitionSpace",
            header: "Exhibition Space",
            cell: ({ row }) => (
                <EditableCell
                    value={row.getValue("exhibitionSpace")}
                    row={row}
                    column={{ id: "exhibitionSpace" }}
                    onUpdate={(value) => updateSponsor(row.original.id, { exhibitionSpace: value })}
                />
            ),
        },
        {
            accessorKey: "numberOfAttendees",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Attendees
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
            cell: ({ row }: { row: any }) => (
                <EditableCell
                    value={row.getValue("numberOfAttendees").toString()}
                    row={row}
                    column={{ id: "numberOfAttendees" }}
                    onUpdate={(value) => updateSponsor(row.original.id, { numberOfAttendees: parseInt(value, 10) })}
                />
            ),
        },
        {
            accessorKey: "contactEmail",
            header: "Contact Email",
            cell: ({ row }) => {
                const email = row.getValue("contactEmail") as string;
                return (
                    <div className="flex items-center space-x-2">
                        <EditableCell
                            value={email}
                            row={row}
                            column={{ id: "contactEmail" }}
                            onUpdate={(value) => updateSponsor(row.original.id, { contactEmail: value })}
                        />
                        {email && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => window.location.href = `mailto:${email}`}
                                className="h-8 w-8 p-0"
                            >
                                <Mail className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                );
            },
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => (
                <EditableCell
                    value={row.getValue("status")}
                    row={row}
                    column={{ id: "status" }}
                    onUpdate={(value) => updateSponsor(row.original.id, { status: value as Sponsor['status'] })}
                />
            ),
        },
        {
            id: "actions",
            cell: ({ row }) => {
                const sponsor = row.original

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => deleteSponsor(sponsor.id)}>
                                Delete sponsor
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )
            },
        },
    ]