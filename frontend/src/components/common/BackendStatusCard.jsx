import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/axios';
import { Activity, Database, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

export const BackendStatusCard = () => {
  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ['systemHealth'],
    queryFn: () => api.get('/health'),
    refetchInterval: 15000 // Refresh every 15 seconds
  });

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-brand-50 rounded-xl text-brand-600">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Live System Diagnostics</h3>
            <p className="text-xs text-slate-500">Backend API & Database connectivity</p>
          </div>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
          title="Refresh Diagnostics"
        >
          <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin text-brand-600' : ''}`} />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* API Server Status */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`w-2.5 h-2.5 rounded-full ${isLoading ? 'bg-amber-400 animate-pulse' : isError ? 'bg-rose-500' : 'bg-campus-500'}`} />
            <div>
              <div className="text-xs font-semibold text-slate-700">REST API Server</div>
              <div className="text-[11px] text-slate-500">Port 5000 / Express</div>
            </div>
          </div>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${
            isLoading ? 'bg-amber-100 text-amber-800' : isError ? 'bg-rose-100 text-rose-700' : 'bg-campus-100 text-campus-800'
          }`}>
            {isLoading ? 'Checking...' : isError ? 'Offline' : 'Online'}
          </span>
        </div>

        {/* Database Status */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Database className="w-4 h-4 text-slate-500" />
            <div>
              <div className="text-xs font-semibold text-slate-700">MongoDB Database</div>
              <div className="text-[11px] text-slate-500">
                {data?.data?.database ? `Status: ${data.data.database}` : 'Connection state'}
              </div>
            </div>
          </div>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${
            data?.data?.database === 'connected'
              ? 'bg-campus-100 text-campus-800'
              : 'bg-amber-100 text-amber-800'
          }`}>
            {data?.data?.database || (isError ? 'Unreachable' : 'Connecting')}
          </span>
        </div>
      </div>

      {isError && (
        <div className="mt-3 p-2.5 bg-rose-50 border border-rose-100 rounded-lg flex items-center gap-2 text-xs text-rose-700">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>Cannot reach backend API. Ensure backend server is running on port 5000.</span>
        </div>
      )}
    </div>
  );
};
