"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Database, Copy, Check, RefreshCw } from "lucide-react"

export function SqlServerSetupNotification() {
  const [isVisible, setIsVisible] = useState(false)
  const [copySuccess, setCopySuccess] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [isChecking, setIsChecking] = useState(false)
  
  useEffect(() => {
    // Check database connection status
    checkDatabaseConnection()
    
    // Check if user has dismissed this before
    const dismissed = localStorage.getItem('sqlserver-setup-dismissed')
    
    const timer = setTimeout(() => {
      if (!isConnected && !dismissed) {
        setIsVisible(true)
      }
    }, 2000)
    
    return () => clearTimeout(timer)
  }, [isConnected])

  const checkDatabaseConnection = async () => {
    setIsChecking(true)
    try {
      const response = await fetch('/api/test-db')
      if (response.ok) {
        setIsConnected(true)
        setIsVisible(false)
      } else {
        setIsConnected(false)
      }
    } catch (error) {
      console.log('Database connection check failed:', error)
      setIsConnected(false)
    } finally {
      setIsChecking(false)
    }
  }

  const sqlServerSchemaScript = `-- Complete SQL Server Database Setup Script
-- Run this script in SQL Server Management Studio

-- Create database (if needed)
-- CREATE DATABASE [peer_to_peer_books];
-- USE [peer_to_peer_books];

-- Users table
CREATE TABLE users (
    id UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
    email NVARCHAR(255) NOT NULL UNIQUE,
    password_hash NVARCHAR(255) NOT NULL,
    full_name NVARCHAR(255) NOT NULL,
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE(),
    last_active DATETIME2 DEFAULT GETDATE()
);

-- Books table
CREATE TABLE books (
    id UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
    title NVARCHAR(255) NOT NULL,
    author NVARCHAR(255) NOT NULL,
    isbn NVARCHAR(20),
    condition NVARCHAR(50) NOT NULL,
    description NTEXT,
    availability_type NVARCHAR(20) NOT NULL CHECK (availability_type IN ('exchange', 'loan')),
    is_available BIT DEFAULT 1,
    owner_id UNIQUEIDENTIFIER NOT NULL,
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Run the complete database_schema.sql file for all tables and indexes`
  
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(sqlServerSchemaScript)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    } catch (err) {
      console.error('Failed to copy: ', err)
    }
  }

  const handleDismiss = () => {
    setIsVisible(false)
    // Store in localStorage so it doesn't show again
    localStorage.setItem('sqlserver-setup-dismissed', 'true')
  }

  if (!isVisible || isConnected) return null

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
        className="fixed top-4 right-4 z-50 max-w-md"
      >
        <Card className="border-blue-200 bg-blue-50 shadow-lg border-2">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <AlertTriangle className="w-5 h-5" />
              SQL Server Setup Required
              <Badge variant="secondary" className="bg-blue-200 text-blue-800">
                Action Needed
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <Database className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="space-y-2">
                <p className="text-sm text-blue-700">
                  Your SQL Server database tables need to be created. Please run the database schema script in SQL Server Management Studio.
                </p>
                <div className="text-xs text-blue-600 bg-blue-100 p-2 rounded space-y-1">
                  <div>1. Open SQL Server Management Studio</div>
                  <div>2. Connect to your server</div>
                  <div>3. Run the complete database_schema.sql script</div>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={copyToClipboard}
                className="flex items-center gap-2 border-blue-300 text-blue-700 hover:bg-blue-100"
              >
                {copySuccess ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copied Schema!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy Basic Schema
                  </>
                )}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={checkDatabaseConnection}
                disabled={isChecking}
                className="flex items-center gap-2 border-blue-300 text-blue-700 hover:bg-blue-100"
              >
                {isChecking ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Checking...
                  </>
                ) : (
                  <>
                    <Database className="w-4 h-4" />
                    Test Connection
                  </>
                )}
              </Button>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-blue-200">
              <span className="text-xs text-blue-600">
                File: database_schema.sql (complete)
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDismiss}
                className="text-blue-600 hover:bg-blue-100"
              >
                Dismiss
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  )
}