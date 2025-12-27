
"use client"

import { useCallback } from "react"
import { useDropzone } from "react-dropzone"
import Papa from "papaparse"
import { UploadCloud } from "lucide-react"
import { toast } from "sonner"

interface CsvUploaderProps {
    onDataParsed: (data: any[], headers: string[]) => void
}

export function CsvUploader({ onDataParsed }: CsvUploaderProps) {
    const onDrop = useCallback((acceptedFiles: File[]) => {
        const file = acceptedFiles[0]
        if (file) {
            Papa.parse(file, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                    if (results.errors.length) {
                        toast.error("Error parsing CSV")
                        console.error(results.errors)
                        return
                    }
                    if (results.data.length === 0) {
                        toast.error("CSV is empty")
                        return
                    }
                    // Type assertion for headers
                    const headers = results.meta.fields || []
                    onDataParsed(results.data, headers)
                    toast.success(`Parsed ${results.data.length} rows`)
                },
                error: (error) => {
                    toast.error(`Error: ${error.message}`)
                }
            })
        }
    }, [onDataParsed])

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'text/csv': ['.csv'],
            'application/vnd.ms-excel': ['.csv']
        },
        maxFiles: 1
    })

    return (
        <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors
        ${isDragActive ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-primary/50'}
      `}
        >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center gap-2">
                <div className="p-4 rounded-full bg-slate-100">
                    <UploadCloud className="w-8 h-8 text-slate-500" />
                </div>
                <div>
                    <p className="text-lg font-medium">Click to upload or drag and drop</p>
                    <p className="text-sm text-muted-foreground">CSV files only</p>
                </div>
            </div>
        </div>
    )
}
