-- Add activity_logs table for tracking user activities
USE [peer-to-peer];
GO

-- Create activity_logs table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='activity_logs' AND xtype='U')
BEGIN
    CREATE TABLE activity_logs (
        id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        user_id UNIQUEIDENTIFIER NOT NULL,
        action NVARCHAR(100) NOT NULL,
        resource_type NVARCHAR(50),
        resource_id UNIQUEIDENTIFIER,
        details NVARCHAR(MAX),
        ip_address NVARCHAR(45),
        user_agent NVARCHAR(500),
        created_at DATETIME2 DEFAULT GETDATE(),
        
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IX_activity_logs_user_id ON activity_logs(user_id);
    CREATE INDEX IX_activity_logs_action ON activity_logs(action);
    CREATE INDEX IX_activity_logs_created_at ON activity_logs(created_at);
    
    PRINT 'activity_logs table created successfully';
END
ELSE
BEGIN
    PRINT 'activity_logs table already exists';
END
GO

PRINT 'Activity logs setup completed!';
