
"use client"

import { useState } from "react"
import { CsvUploader } from "@/components/contacts/csv-uploader"
import { ColumnMapper } from "@/components/contacts/column-mapper"
import { importContacts } from "./actions"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function ContactsPage() {
    const [csvData, setCsvData] = useState<any[]>([])
    const [headers, setHeaders] = useState<string[]>([])
    const [isUploading, setIsUploading] = useState(false)

    const handleDataParsed = (data: any[], headers: string[]) => {
        setCsvData(data)
        setHeaders(headers)
    }

    const handleImport = async (mapping: any) => {
        setIsUploading(true)
        try {
            const result = await importContacts(csvData, mapping)
            toast.success(`Successfully imported ${result.count} contacts`)
            setCsvData([])
            setHeaders([])
        } catch (error) {
            toast.error("Import failed")
            console.error(error)
        } finally {
            setIsUploading(false)
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Contacts</h2>
                <p className="text-muted-foreground mt-1">Manage your audience.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Import Contacts</CardTitle>
                </CardHeader>
                <CardContent>
                    {csvData.length === 0 ? (
                        <CsvUploader onDataParsed={handleDataParsed} />
                    ) : (
                        <ColumnMapper
                            data={csvData}
                            headers={headers}
                            onImport={handleImport}
                            isUploading={isUploading}
                        />
                    )}
                </CardContent>
            </Card>

            {/* Placeholder for contacts list below */}
            <div className="mt-8 text-center text-gray-500">
                <p>Recent contacts will appear here (Not implemented in MVP view)</p>
            </div>
        </div>
    )
}
