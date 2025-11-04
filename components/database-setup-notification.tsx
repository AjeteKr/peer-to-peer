"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Database, ExternalLink, Copy, Check } from "lucide-react"

export function DatabaseSetupNotification() {
  const [isVisible, setIsVisible] = useState(false)
  const [copySuccess, setCopySuccess] = useState(false)
  
  useEffect(() => {
    // Show notification after a delay
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 2000)
    
    return () => clearTimeout(timer)
  }, [])

  const supabaseUrl = "https://supabase.com/dashboard/project/qjyuoyzymatxzdvnhlvv/sql"
  
  const handleCopySQL = async () => {
    try {
      // This would copy the SQL content, but for now just show success
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const handleDismiss = () => {
    setIsVisible(false)
    // Store in localStorage so it doesn't show again
    localStorage.setItem('database-setup-dismissed', 'true')
  }

  useEffect(() => {
    // Check if user has dismissed this before
    const dismissed = localStorage.getItem('database-setup-dismissed')
    if (dismissed) {
      setIsVisible(false)
    }
  }, [])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -100 }}
          className="fixed top-4 right-4 left-4 md:left-auto md:w-96 z-50"
        >
          <Card className="border-orange-200 bg-orange-50 border-2">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-orange-800">
                <AlertTriangle className="h-5 w-5" />
                Database Setup Required
                <Badge variant="secondary" className="ml-auto">
                  1 min setup
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-orange-700">
                To enable full functionality (user registration, book listings, etc.), 
                you need to set up your database tables.
              </p>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Database className="h-4 w-4 text-orange-600" />
                  <span className="font-medium">Quick Setup Steps:</span>
                </div>
                <ol className="text-sm text-orange-700 ml-6 space-y-1">
                  <li>1. Open Supabase SQL Editor</li>
                  <li>2. Copy & paste the SQL script</li>
                  <li>3. Click "Run" - Done! 🎉</li>
                </ol>
              </div>

              <div className="flex flex-col gap-2">
                <Button
                  asChild
                  size="sm"
                  className="bg-orange-600 hover:bg-orange-700 text-white"
                >
                  <a 
                    href={supabaseUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Open SQL Editor
                  </a>
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopySQL}
                  className="border-orange-300 text-orange-700 hover:bg-orange-100"
                >
                  {copySuccess ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      SQL Script Location
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      View Setup File
                    </>
                  )}
                </Button>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-orange-200">
                <span className="text-xs text-orange-600">
                  File: supabase_setup_complete.sql
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDismiss}
                  className="text-orange-600 hover:text-orange-700 hover:bg-orange-100"
                >
                  Dismiss
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  )
}