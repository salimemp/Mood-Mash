import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import type { SecurityAlert, SecurityAlertType as SecurityAlertTypeEnum } from '../contexts/AuthContext';
import {
  Shield,
  AlertTriangle,
  X,
  Smartphone,
  MapPin,
  Key,
  Fingerprint,
  Clock,
  ChevronRight,
} from 'lucide-react';

interface SecurityAlertProps {
  alert: SecurityAlert;
  onDismiss?: (id: string) => void;
  compact?: boolean;
}

const alertIcons: Record<SecurityAlertTypeEnum, React.ReactNode> = {
  new_device: <Smartphone className="w-5 h-5" />,
  new_location: <MapPin className="w-5 h-5" />,
  suspicious_activity: <AlertTriangle className="w-5 h-5" />,
  password_change: <Key className="w-5 h-5" />,
  two_factor_enabled: <Fingerprint className="w-5 h-5" />,
  two_factor_disabled: <Fingerprint className="w-5 h-5" />,
};

const severityColors: Record<SecurityAlert['severity'], { bg: string; border: string; text: string; icon: string }> = {
  critical: {
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    text: 'text-red-400',
    icon: 'text-red-500',
  },
  high: {
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/30',
    text: 'text-orange-400',
    icon: 'text-orange-500',
  },
  medium: {
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/30',
    text: 'text-yellow-400',
    icon: 'text-yellow-500',
  },
  low: {
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    text: 'text-blue-400',
    icon: 'text-blue-500',
  },
};

const severityBadges: Record<SecurityAlert['severity'], { bg: string; text: string }> = {
  critical: { bg: 'bg-red-500/20', text: 'text-red-400' },
  high: { bg: 'bg-orange-500/20', text: 'text-orange-400' },
  medium: { bg: 'bg-yellow-500/20', text: 'text-yellow-400' },
  low: { bg: 'bg-blue-500/20', text: 'text-blue-400' },
};

function formatTimestamp(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function SecurityAlert({ alert, onDismiss, compact = false }: SecurityAlertProps) {
  const colors = severityColors[alert.severity];
  const badge = severityBadges[alert.severity];
  const icon = alertIcons[alert.type];
  const [isExpanded, setIsExpanded] = useState(!alert.read && !compact);

  useEffect(() => {
    if (!alert.read && compact) {
      setIsExpanded(false);
    }
  }, [alert.read, compact]);

  const severityLabel = alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1);

  if (compact && !isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className={`w-full flex items-center gap-3 p-3 rounded-xl border ${colors.bg} ${colors.border} hover:opacity-80 transition-all text-left`}
      >
        <div className={`${colors.icon}`}>{icon}</div>
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium ${colors.text} truncate`}>{alert.message}</p>
          <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
            <Clock className="w-3 h-3" />
            {formatTimestamp(alert.timestamp)}
          </p>
        </div>
        <ChevronRight className="w-4 h-4 text-slate-400" />
      </button>
    );
  }

  return (
    <div
      className={`relative p-4 rounded-xl border transition-all ${
        alert.read ? 'bg-slate-800/30 border-slate-700/30 opacity-60' : `${colors.bg} ${colors.border}`
      } ${compact ? 'hover:shadow-lg' : ''}`}
    >
      <div className="flex items-start gap-4">
        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${colors.bg} ${colors.icon}`}>
          {icon}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${badge?.bg ?? 'bg-slate-500/20'} ${badge?.text ?? 'text-slate-400'}`}>
              {severityLabel}
            </span>
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatTimestamp(alert.timestamp)}
            </span>
            {!alert.read && (
              <span className="w-2 h-2 rounded-full bg-violet-500" />
            )}
          </div>

          <p className={`text-sm font-medium ${alert.read ? 'text-slate-400' : 'text-white'}`}>
            {alert.message}
          </p>

          {alert.metadata && Object.keys(alert.metadata).length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {Object.entries(alert.metadata).map(([key, value]) => (
                <span
                  key={key}
                  className="text-xs px-2 py-1 rounded-lg bg-slate-700/50 text-slate-300"
                >
                  {key}: {value}
                </span>
              ))}
            </div>
          )}
        </div>

        {onDismiss && (
          <button
            onClick={() => onDismiss(alert.id)}
            className="flex-shrink-0 p-1 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

interface SecurityAlertListProps {
  maxAlerts?: number;
  showEmpty?: boolean;
  compact?: boolean;
}

export function SecurityAlertList({ maxAlerts = 5, showEmpty = true, compact = false }: SecurityAlertListProps) {
  const { securityAlerts, unreadAlertCount, markAlertAsRead, markAllAlertsAsRead, clearSecurityAlerts } = useAuth();
  const displayedAlerts = securityAlerts.slice(0, maxAlerts);
  const hasAlerts = securityAlerts.length > 0;

  if (!hasAlerts && showEmpty) {
    return (
      <div className="text-center py-8">
        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-emerald-500/10 flex items-center justify-center">
          <Shield className="w-6 h-6 text-emerald-400" />
        </div>
        <p className="text-slate-400 text-sm">No security alerts</p>
        <p className="text-slate-500 text-xs mt-1">Your account is secure</p>
      </div>
    );
  }

  if (!hasAlerts) {
    return null;
  }

  return (
    <div className="space-y-3">
      {unreadAlertCount > 0 && (
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-slate-400">
            {unreadAlertCount} unread alert{unreadAlertCount !== 1 ? 's' : ''}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={markAllAlertsAsRead}
              className="text-xs text-violet-400 hover:text-violet-300 transition-colors"
            >
              Mark all read
            </button>
            <span className="text-slate-600">|</span>
            <button
              onClick={clearSecurityAlerts}
              className="text-xs text-slate-400 hover:text-slate-300 transition-colors"
            >
              Clear all
            </button>
          </div>
        </div>
      )}

      <div className={`space-y-2 ${compact ? 'max-h-64 overflow-y-auto pr-2' : ''}`}>
        {displayedAlerts.map((alert) => (
          <SecurityAlert
            key={alert.id}
            alert={alert}
            onDismiss={compact ? markAlertAsRead : undefined}
            compact={compact}
          />
        ))}
      </div>

      {securityAlerts.length > maxAlerts && (
        <button className="w-full py-2 text-sm text-violet-400 hover:text-violet-300 transition-colors">
          View all {securityAlerts.length} alerts
        </button>
      )}
    </div>
  );
}

interface SecurityAlertBannerProps {
  onDismiss?: () => void;
}

export function SecurityAlertBanner({ onDismiss }: SecurityAlertBannerProps) {
  const { securityAlerts, markAllAlertsAsRead } = useAuth();
  const unreadAlerts = securityAlerts.filter((alert) => !alert.read);

  if (unreadAlerts.length === 0) {
    return null;
  }

  const criticalAlert = unreadAlerts.find((alert) => alert.severity === 'critical');
  const highAlert = unreadAlerts.find((alert) => alert.severity === 'high');
  const displayAlert = criticalAlert || highAlert || unreadAlerts[0]!;
  const colors = severityColors[displayAlert.severity];
  const icon = alertIcons[displayAlert.type];

  return (
    <div className={`relative p-4 rounded-xl border ${colors.bg} ${colors.border}`}>
      <div className="flex items-center gap-4">
        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${colors.bg} ${colors.icon}`}>
          {icon}
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs font-bold uppercase tracking-wide ${colors.text}`}>
              Security Alert
            </span>
            {displayAlert.severity !== 'low' && (
              <span className={`text-xs px-2 py-0.5 rounded-full ${severityBadges[displayAlert.severity]?.bg ?? 'bg-slate-500/20'} ${severityBadges[displayAlert.severity]?.text ?? 'text-slate-400'}`}>
                {displayAlert.severity}
              </span>
            )}
          </div>

          <p className="text-sm text-white font-medium">{displayAlert.message}</p>
          <p className="text-xs text-slate-400 mt-1">
            {unreadAlerts.length === 1
              ? '1 unread alert'
              : `${unreadAlerts.length} unread alerts`}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={markAllAlertsAsRead}
            className="px-3 py-1.5 text-sm font-medium bg-slate-700/50 hover:bg-slate-700 text-white rounded-lg transition-colors"
          >
            Dismiss All
          </button>
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="p-1.5 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
