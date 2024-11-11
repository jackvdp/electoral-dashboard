import { ColumnDef } from "@tanstack/react-table"
import { Sponsor } from "@prisma/client"
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

interface ColumnConfig {
    title: string
    show: boolean
    type?: 'text' | 'checkbox' | 'email' | 'number'
    sortable?: boolean
}

const COLUMN_CONFIG: Record<keyof Partial<Sponsor>, ColumnConfig> = {
    id: {
        title: 'ID',
        show: false
    },
    name: {
        title: 'Company',
        show: true,
        type: 'text',
        sortable: true
    },
    initialContact: {
        title: 'Initial Contact',
        show: true,
        type: 'checkbox'
    },
    exhibitionSpace: {
        title: 'Exhibition Space',
        show: true,
        type: 'checkbox'
    },
    receivedProgrammeAdvert: {
        title: 'Received Programme Advert',
        show: true,
        type: 'checkbox'
    },
    numberOfAttendees: {
        title: 'Attendees',
        show: true,
        type: 'number',
    },
    flightDetails: {
        title: 'Flight Details',
        show: true,
        type: 'text'
    },
    contactEmail: {
        title: 'Contact Email',
        show: true,
        type: 'email'
    },
    specialRequirments: {
        title: 'Special Requirements',
        show: true,
        type: 'text'
    },
    attendeeNames: {
        title: 'Attendee Names',
        show: false,
        type: 'text'
    },
    createdAt: {
        title: 'Created At',
        show: false,
        type: 'text'
    },
    updatedAt: {
        title: 'Updated At',
        show: false,
        type: 'text'
    }
}

interface CreateColumnsProps {
    updateSponsor: (id: string, updates: Partial<Sponsor>) => Promise<void>
    deleteSponsor: (id: string) => Promise<void>
}

export const createColumns = ({
    updateSponsor,
    deleteSponsor,
}: CreateColumnsProps): ColumnDef<Sponsor>[] => {
    // Start with select column
    const baseColumns: ColumnDef<Sponsor>[] = [
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
        }
    ]

    // Generate columns based on configuration
    const dynamicColumns = Object.entries(COLUMN_CONFIG)
        .filter(([_, config]) => config.show)
        .map(([key, config]): ColumnDef<Sponsor> => {
            const column: ColumnDef<Sponsor> = {
                accessorKey: key,
                header: config.sortable
                    ? ({ column }) => (
                        <Button
                            variant="ghost"
                            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                        >
                            {config.title}
                            <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                    )
                    : config.title
            }

            // Add cell renderer based on type
            switch (config.type) {
                case 'checkbox':
                    column.cell = ({ row }) => (
                        <Checkbox
                            checked={row.getValue(key)}
                            onCheckedChange={(checked) => {
                                updateSponsor(row.original.id, { [key]: !!checked })
                            }}
                            aria-label={`Toggle ${config.title}`}
                        />
                    )
                    break

                case 'email':
                    column.cell = ({ row }) => {
                        const email = row.getValue(key) as string
                        return (
                            <div className="flex items-center space-x-2">
                                <EditableCell
                                    value={email || ''}
                                    row={row}
                                    column={{ id: key }}
                                    onUpdate={(value) => updateSponsor(row.original.id, { [key]: value })}
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
                        )
                    }
                    break

                case 'number':
                    column.cell = ({ row }) => (
                        <EditableCell
                            value={row.getValue(key)?.toString() || '0'}
                            row={row}
                            column={{ id: key }}
                            onUpdate={(value) => updateSponsor(row.original.id, { [key]: parseInt(value, 10) })}
                        />
                    )
                    break

                default: // text
                    column.cell = ({ row }) => (
                        <EditableCell
                            value={row.getValue(key)?.toString() || ''}
                            row={row}
                            column={{ id: key }}
                            onUpdate={(value) => updateSponsor(row.original.id, { [key]: value })}
                        />
                    )
            }

            return column
        })

    // Add actions column
    const actionsColumn: ColumnDef<Sponsor> = {
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
        }
    }

    return [...baseColumns, ...dynamicColumns, actionsColumn]
}