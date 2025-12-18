"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Loader2, ArrowLeft, FileText, Calendar, Stethoscope, CheckCircle } from "lucide-react"
import Link from "next/link"

interface MedicalRecord {
    id: string;
    date: string;
    type: string;
    doctor: string;
    description: string;
    result: string;
    notes: string;
}

export default function HistoryPage() {
    const { token, isLoading: authLoading } = useAuth()
    const [records, setRecords] = useState<MedicalRecord[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    useEffect(() => {
        const fetchRecords = async () => {
            if (!token) return

            try {
                const res = await fetch('http://localhost:5000/api/patients/records', {
                    headers: { 'Authorization': `Bearer ${token}` }
                })

                if (!res.ok) {
                    throw new Error('Failed to fetch records')
                }

                const data = await res.json()
                if (Array.isArray(data)) {
                    setRecords(data)
                } else {
                    setRecords([])
                }
            } catch (err) {
                console.error(err)
                setError("Failed to load medical records")
                setRecords([])
            } finally {
                setLoading(false)
            }
        }

        if (!authLoading) {
            if (token) {
                fetchRecords()
            } else {
                setLoading(false)
            }
        }
    }, [token, authLoading])

    const getResultColor = (result: string) => {
        const lower = result.toLowerCase()
        if (lower.includes('completed') || lower.includes('normal') || lower.includes('good')) {
            return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300'
        }
        if (lower.includes('elevated') || lower.includes('high') || lower.includes('warning')) {
            return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300'
        }
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
    }

    if (loading || authLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <Link href="/dashboard/patient" className="inline-flex items-center text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors mb-2">
                        <ArrowLeft className="h-4 w-4 mr-1" />
                        Back to Dashboard
                    </Link>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Medical History</h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">View your past medical records and consultations</p>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
                    {error}
                </div>
            )}

            {records.length === 0 ? (
                <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                    <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="p-4 rounded-full bg-slate-100 dark:bg-slate-700 mb-4">
                            <FileText className="h-12 w-12 text-slate-400 dark:text-slate-500" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No Medical Records</h3>
                        <p className="text-slate-500 dark:text-slate-400 max-w-sm">
                            Your medical history will appear here after your doctor completes a consultation.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {records.map((record) => (
                        <Card key={record.id} className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow">
                            <CardHeader className="pb-3">
                                <div className="flex justify-between items-start gap-4 flex-wrap">
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 rounded-lg bg-primary/10 mt-1">
                                            <Stethoscope className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-slate-900 dark:text-white text-lg">{record.type}</CardTitle>
                                            <CardDescription className="flex items-center gap-2 mt-1 text-slate-600 dark:text-slate-400">
                                                <Calendar className="h-4 w-4" />
                                                {record.date} • {record.doctor}
                                            </CardDescription>
                                        </div>
                                    </div>
                                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${getResultColor(record.result)}`}>
                                        <CheckCircle className="h-3 w-3 mr-1" />
                                        {record.result}
                                    </span>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-0">
                                <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 space-y-2">
                                    <div>
                                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Description:</span>
                                        <p className="text-slate-900 dark:text-white">{record.description}</p>
                                    </div>
                                    {record.notes && (
                                        <div>
                                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Doctor's Notes:</span>
                                            <p className="text-slate-600 dark:text-slate-400">{record.notes}</p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
