import React from 'react';
import { AlertTriangle, Info } from 'lucide-react';
import { Card, CardHeader, CardTitle } from '../ui/Card';
import { LogEntry } from './LogEntry';
import type { BotLogEntry } from '../../types/api';

interface LogsTabProps {
  errorLogs: BotLogEntry[];
  generalLogs: BotLogEntry[];
}

export function LogsTab({ errorLogs, generalLogs }: LogsTabProps) {
  const sortedErrorLogs = [...errorLogs].sort((a, b) => b.timestamp - a.timestamp);
  const sortedGeneralLogs = [...generalLogs].sort((a, b) => b.timestamp - a.timestamp);

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Error Logs */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-loss" />
            <CardTitle>Error Logs ({errorLogs.length})</CardTitle>
          </div>
        </CardHeader>
        <div className="max-h-64 overflow-y-auto">
          {sortedErrorLogs.length > 0 ? (
            <div className="space-y-1">
              {sortedErrorLogs.map((log, idx) => (
                <LogEntry key={`error-${idx}`} log={log} type="error" />
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-dark-400">No error logs</div>
          )}
        </div>
      </Card>

      {/* General Logs */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <Info className="w-5 h-5 text-accent-blue" />
            <CardTitle>General Logs ({generalLogs.length})</CardTitle>
          </div>
        </CardHeader>
        <div className="max-h-80 overflow-y-auto">
          {sortedGeneralLogs.length > 0 ? (
            <div className="space-y-1">
              {sortedGeneralLogs.map((log, idx) => (
                <LogEntry key={`general-${idx}`} log={log} type="general" />
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-dark-400">No general logs</div>
          )}
        </div>
      </Card>
    </div>
  );
}

