import { MoreHorizontal } from 'lucide-react'
import type { Broadcast } from '../types/broadcast.types'
import type { ColumnDef } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'

export const columns: Array<ColumnDef<Broadcast>> = [
    {
        id: 'select',
        header: ({ table }) => (
            <Checkbox
                checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && "indeterminate")
                }
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
                onClick={(event) => event.stopPropagation()}
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: 'subject',
        header: 'Subject',
        cell: ({ row }) => <div className="font-medium">{row.getValue('subject')}</div>,
    },
    {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
            const status = row.getValue('status')
            return (
                <Badge variant={status === 'sent' ? 'default' : 'secondary'} className="capitalize">
                    {status}
                </Badge>
            )
        },
        filterFn: (row, id, value) => {
            return value.includes(row.getValue(id))
        },
    },
    {
        accessorKey: 'sent_date',
        header: 'Sent Date',
        cell: ({ row }) => {
            const date = row.getValue('sent_date')
            if (!date) return <span className="text-muted-foreground">Not sent</span>
            return <div>{new Date(date).toLocaleDateString()}</div>
        },
    },
    {
        accessorKey: 'recipients_count',
        header: 'Recipients',
        cell: ({ row }) => <div className="text-center">{row.getValue('recipients_count') ?? 0}</div>,
    },
    {
        id: 'actions',
        cell: ({ row }) => {
            const broadcast = row.original

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon-sm">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem
                            onClick={() => navigator.clipboard.writeText(broadcast.id)}
                        >
                            Copy Broadcast ID
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem>Duplicate</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    },
]
