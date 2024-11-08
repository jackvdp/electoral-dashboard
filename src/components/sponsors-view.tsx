// components/sponsors-view.tsx
'use client';

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { EditableCell } from "@/components/editable-cell"
import { Plus, Mail, Settings, ArrowUp, ArrowDown, Eye, EyeOff } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { sponsors as initialSponsors, type Sponsor } from "@/data/sponsors"
import { cn } from "@/lib/utils"

interface Column {
    key: keyof Sponsor;
    title: string;
    width: number; // now represents percentage
    type?: 'text' | 'checkbox' | 'email' | 'number';
    visible?: boolean;
}

const allColumns: Column[] = [
    { key: 'name', title: 'Company', width: 20, visible: true },
    { key: 'initialContact', title: 'Initial Contact', type: 'checkbox', width: 10, visible: true },
    { key: 'initialPhoneCall', title: 'Phone Call', type: 'checkbox', width: 10, visible: true },
    { key: 'exhibitionSpace', title: 'Exhibition Space', width: 15, visible: true },
    { key: 'numberOfAttendees', title: 'Attendees', type: 'number', width: 10, visible: true },
    { key: 'contactEmail', title: 'Contact Email', type: 'email', width: 35, visible: true },
    { key: 'dedicatedSpeakingSlot', title: 'Speaking Slot', width: 15, visible: false },
    { key: 'receivedProgrammeAdvert', title: 'Programme Advert', type: 'checkbox', width: 15, visible: false },
    { key: 'customsSupport', title: 'Customs Support', type: 'checkbox', width: 15, visible: false },
    { key: 'bookedHotel', title: 'Hotel Booked', type: 'checkbox', width: 15, visible: false },
    { key: 'attendeeNames', title: 'Attendee Names', width: 20, visible: false },
];

export function SponsorsView() {
    const [columns, setColumns] = useState<Column[]>(allColumns);
    const [sponsors, setSponsors] = useState<Sponsor[]>(initialSponsors);

    const visibleColumns = columns.filter(col => col.visible);

    const toggleColumn = (key: keyof Sponsor) => {
        setColumns(columns.map(col =>
            col.key === key ? { ...col, visible: !col.visible } : col
        ));
    };

    const moveColumn = (key: keyof Sponsor, direction: 'up' | 'down') => {
        const index = columns.findIndex(col => col.key === key);
        if ((direction === 'up' && index === 0) ||
            (direction === 'down' && index === columns.length - 1)) return;

        const newColumns = [...columns];
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        [newColumns[index], newColumns[newIndex]] = [newColumns[newIndex], newColumns[index]];
        setColumns(newColumns);
    };

    const updateSponsor = (id: number, updates: Partial<Sponsor>) => {
        setSponsors(sponsors.map(sponsor =>
            sponsor.id === id ? { ...sponsor, ...updates } : sponsor
        ));
    };

    const addSponsor = () => {
        const newSponsor: Sponsor = {
            id: Math.max(...sponsors.map(s => s.id)) + 1,
            name: 'New Sponsor',
            initialContact: false,
            initialPhoneCall: false,
            preEventActivities: false,
            dedicatedSpeakingSlot: null,
            exhibitionSpace: '',
            receivedProgrammeAdvert: false,
            customsSupport: false,
            bookedHotel: false,
            numberOfAttendees: 0,
            attendeeNames: '',
            contactEmail: ''
        };
        setSponsors([...sponsors, newSponsor]);
    };

    const stopPropagation = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    return (
        <div className="h-full w-full">
            <Card className="h-full">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Sponsors</CardTitle>
                    <div className="space-x-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button size="sm" variant="outline">
                                    <Settings className="mr-2 h-4 w-4" />
                                    Columns
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuLabel>Manage Columns</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                {columns.map((column) => (
                                    <DropdownMenuItem
                                        key={column.key}
                                        className="flex items-center justify-between"
                                    >
                                        <div className="flex items-center">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-4 w-4 p-0 mr-2"
                                                onClick={() => toggleColumn(column.key)}
                                            >
                                                {column.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                                            </Button>
                                            <span>{column.title}</span>
                                        </div>
                                        <div className="flex items-center space-x-1">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-4 w-4 p-0"
                                                onClick={() => moveColumn(column.key, 'up')}
                                            >
                                                <ArrowUp className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-4 w-4 p-0"
                                                onClick={() => moveColumn(column.key, 'down')}
                                            >
                                                <ArrowDown className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <Button size="sm" variant="default" onClick={addSponsor}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Sponsor
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    {visibleColumns.map((column) => (
                                        <TableHead
                                            key={column.key}
                                            style={{ width: column.width }}
                                        >
                                            {column.title}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {sponsors.map((sponsor, rowIndex) => (
                                    <TableRow
                                        key={sponsor.id}
                                        className={cn(
                                            rowIndex % 2 === 0 ? 'bg-white' : 'bg-slate-50'
                                        )}
                                    >
                                        {visibleColumns.map(column => (
                                            <TableCell
                                                key={column.key}
                                                style={{ width: column.width }}
                                                className="align-top"
                                            >
                                                {column.type === 'checkbox' ? (
                                                    <Checkbox
                                                        checked={sponsor[column.key] as boolean}
                                                        onCheckedChange={(checked) =>
                                                            updateSponsor(sponsor.id, { [column.key]: !!checked })
                                                        }
                                                    />
                                                ) : column.type === 'email' ? (
                                                    <div className="flex items-start gap-2">
                                                        <div className="flex-1 min-w-0">
                                                            {sponsor[column.key as keyof Sponsor]?.toString().split(';').map((email, i) => (
                                                                <div key={i} className="truncate">- {email.trim()}</div>
                                                            ))}
                                                        </div>
                                                        {sponsor.contactEmail && (
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                className="h-8 w-8 p-0 flex-shrink-0"
                                                                onClick={() => window.location.href = `mailto:${sponsor.contactEmail}`}
                                                            >
                                                                <Mail className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <EditableCell
                                                        value={sponsor[column.key]?.toString() || ''}
                                                        onChange={(value) => updateSponsor(sponsor.id, { [column.key]: value })}
                                                    />
                                                )}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}