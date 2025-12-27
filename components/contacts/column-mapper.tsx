
"use client"

import { useState } from "react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"

interface ColumnMapperProps {
    data: any[]
    headers: string[]
    onImport: (mapping: any) => void
    isUploading: boolean
}

export function ColumnMapper({ data, headers, onImport, isUploading }: ColumnMapperProps) {
    const [phoneCol, setPhoneCol] = useState<string>("")
    const [nameCol, setNameCol] = useState<string>("")
    const [tagCol, setTagCol] = useState<string>("")
    // attributes: array of selected columns to include in JSONB
    const [attrCols, setAttrCols] = useState<string[]>([])

    const previewData = data.slice(0, 3)

    const handleImport = () => {
        if (!phoneCol) return
        onImport({
            phone: phoneCol,
            name: nameCol,
            tag: tagCol,
            attributes: attrCols
        })
    }

    const toggleAttr = (header: string) => {
        setAttrCols(prev =>
            prev.includes(header) ? prev.filter(h => h !== header) : [...prev, header]
        )
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                    <Label>Phone Column (Required)</Label>
                    <Select onValueChange={setPhoneCol} value={phoneCol}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select column" />
                        </SelectTrigger>
                        <SelectContent>
                            {headers.map(h => (
                                <SelectItem key={h} value={h}>{h}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label>Name Column</Label>
                    <Select onValueChange={setNameCol} value={nameCol}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select column" />
                        </SelectTrigger>
                        <SelectContent>
                            {headers.map(h => (
                                <SelectItem key={h} value={h}>{h}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label>Tags Column</Label>
                    <Select onValueChange={setTagCol} value={tagCol}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select column" />
                        </SelectTrigger>
                        <SelectContent>
                            {headers.map(h => (
                                <SelectItem key={h} value={h}>{h}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="border rounded-lg p-4 bg-slate-50">
                <Label className="mb-2 block">Attribute Columns (included in JSON)</Label>
                <div className="flex flex-wrap gap-4">
                    {headers.map(h => (
                        <div key={h} className="flex items-center space-x-2">
                            <Checkbox
                                id={`attr-${h}`}
                                checked={attrCols.includes(h)}
                                onCheckedChange={() => toggleAttr(h)}
                            />
                            <label htmlFor={`attr-${h}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                {h}
                            </label>
                        </div>
                    ))}
                </div>
            </div>

            <div className="border rounded-lg overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            {headers.map((header) => (
                                <TableHead key={header}>{header}</TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {previewData.map((row, i) => (
                            <TableRow key={i}>
                                {headers.map((header) => (
                                    <TableCell key={`${i}-${header}`}>{row[header]}</TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <div className="flex justify-end">
                <Button onClick={handleImport} disabled={!phoneCol || isUploading}>
                    {isUploading ? "Importing..." : "Import Contacts"}
                </Button>
            </div>
        </div>
    )
}
