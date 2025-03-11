"use client"

import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Plus } from "lucide-react"
import { useSponsors } from "@/hooks/use-sponsors"
import { useEffect } from "react"
import { createColumns } from "./columns"
import { DominicanSponsor as Sponsor } from "@prisma/client"
import NavigationBar from "../navigation-bar"

export function SponsorsTable() {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})

  const {
    sponsors,
    isLoading,
    error,
    addSponsor,
    updateSponsor,
    deleteSponsor,
    fetchSponsors
  } = useSponsors()

  const columns = React.useMemo(
    () => createColumns({ updateSponsor, deleteSponsor }),
    [updateSponsor, deleteSponsor]
  )

  useEffect(() => {
    fetchSponsors()
  }, [fetchSponsors])

  const table = useReactTable<Sponsor>({
    data: sponsors,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })

  const handleAddSponsor = async () => {
    try {
      await addSponsor({
        name: "New Sponsor",
        initialContact: false,
        exhibitionSpace: false,
        receivedProgrammeAdvert: false,
        flightDetails: "",
        numberOfAttendees: 0,
        attendeeNames: "",
        contactEmail: "",
        specialRequirments: "",
      })
    } catch (error) {
      console.error('Failed to add sponsor:', error)
    }
  }

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div className="w-full">
      <Header table={table} handleAddSponsor={handleAddSponsor} />
      <TableDisplay table={table} columns={columns} />
      <TableNavigator
        currentPage={table.getFilteredSelectedRowModel().rows.length}
        totalPages={table.getFilteredRowModel().rows.length}
        previousPageAction={() => table.previousPage()}
        nextPageAction={() => table.nextPage()}
        canGetPreviousPage={table.getCanNextPage()}
        canGetNextPage={table.getCanPreviousPage()}
      />
    </div>
  )
}

function Header({
  table,
  handleAddSponsor
}: {
  table: ReturnType<typeof useReactTable<Sponsor>>,
  handleAddSponsor: () => void
}) {
  return (
    <NavigationBar>
      <div className="flex items-center gap-4">
        <Input
          placeholder="Filter companies..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("name")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        
        <Button onClick={handleAddSponsor} variant="default">
          <Plus className="mr-2 h-4 w-4" /> Add Sponsor
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">Columns</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  className="capitalize"
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) => column.toggleVisibility(!!value)}
                >
                  {column.id}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </NavigationBar>
  )
}

function TableDisplay({
  table, columns
}: {
  table: ReturnType<typeof useReactTable<Sponsor>>, columns: ColumnDef<any, any>[]
}) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                  </TableHead>
                )
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(
                      cell.column.columnDef.cell,
                      cell.getContext()
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="h-24 text-center"
              >
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}

function TableNavigator({
  currentPage, totalPages, previousPageAction, nextPageAction, canGetPreviousPage, canGetNextPage
}: {
  currentPage: number,
  totalPages: number,
  previousPageAction: () => void,
  nextPageAction: () => void,
  canGetPreviousPage: boolean,
  canGetNextPage: boolean
}) {
  return (
    <div className="flex items-center justify-end space-x-2 py-4">
      <div className="flex-1 text-sm text-muted-foreground">
        {currentPage} of {totalPages} row(s) selected.
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={previousPageAction}
        disabled={!canGetPreviousPage}
      >
        Previous
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={nextPageAction}
        disabled={!canGetNextPage}
      >
        Next
      </Button>
    </div>
  )
}