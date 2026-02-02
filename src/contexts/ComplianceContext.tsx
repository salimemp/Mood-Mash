import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

// ============================================================================
// Types
// ============================================================================

export type ConsentType =
  | 'essential'
  | 'analytics'
  | 'marketing'
  | 'personalization'
  | 'third_party'
  | 'opt_out';

export type ComplianceFramework = 'gdpr' | 'ccpa' | 'pipeda' | 'hipaa' | 'soc2';

export interface Consent {
  type: ConsentType;
  enabled: boolean;
  timestamp: Date;
  version: string;
}

export interface DataRequest {
  id: string;
  type: 'access' | 'rectification' | 'erasure' | 'portability' | 'restriction' | 'objection';
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  createdAt: Date;
  completedAt?: Date;
}

export interface ComplianceStatus {
  framework: ComplianceFramework;
  compliant: boolean;
  lastAudit: Date;
  certifications: string[];
}

export interface PrivacyPolicy {
  version: string;
  lastUpdated: Date;
  effectiveDate: Date;
  sections: {
    dataCollection: string;
    dataUsage: string;
    dataSharing: string;
    dataRetention: string;
    userRights: string;
    securityMeasures: string;
    internationalTransfer: string;
    contactInformation: string;
  };
}

interface ComplianceState {
  consents: Map<ConsentType, Consent>;
  dataRequests: DataRequest[];
  complianceStatuses: ComplianceStatus[];
  privacyPolicy: PrivacyPolicy;
  isLoading: boolean;
}

interface ComplianceContextType extends ComplianceState {
  // Consent Management
  getConsent: (type: ConsentType) => boolean;
  setConsent: (type: ConsentType, enabled: boolean) => void;
  getAllConsents: () => Consent[];
  acceptAllConsents: () => void;
  rejectAllOptionalConsents: () => void;

  // Data Requests
  submitDataRequest: (type: DataRequest['type']) => Promise<string>;
  getDataRequests: () => DataRequest[];
  cancelDataRequest: (requestId: string) => void;

  // Compliance Status
  getComplianceStatus: (framework: ComplianceFramework) => ComplianceStatus | undefined;

  // Privacy Policy
  acceptPrivacyPolicy: (version: string) => void;
  getPrivacyPolicy: () => PrivacyPolicy;

  // Data Export/Import
  exportUserData: () => Promise<string>;
  deleteUserData: () => Promise<void>;
}

// ============================================================================
// Initial Data
// ============================================================================

const INITIAL_CONSENTS: Consent[] = [
  { type: 'essential', enabled: true, timestamp: new Date(), version: '1.0' },
  { type: 'analytics', enabled: false, timestamp: new Date(), version: '1.0' },
  { type: 'marketing', enabled: false, timestamp: new Date(), version: '1.0' },
  { type: 'personalization', enabled: false, timestamp: new Date(), version: '1.0' },
  { type: 'third_party', enabled: false, timestamp: new Date(), version: '1.0' },
  { type: 'opt_out', enabled: false, timestamp: new Date(), version: '1.0' },
];

const PRIVACY_POLICY: PrivacyPolicy = {
  version: '2.0.0',
  lastUpdated: new Date('2024-12-01'),
  effectiveDate: new Date('2024-12-15'),
  sections: {
    dataCollection: 'We collect minimal personal data necessary to provide our services, including email, name, and mood entries.',
    dataUsage: 'Your data is used solely to provide and improve our mood tracking services. We do not sell your personal data.',
    dataSharing: 'We do not share your personal data with third parties except as required by law or with your explicit consent.',
    dataRetention: 'Your data is retained for as long as your account is active. You can request deletion at any time.',
    userRights: 'You have the right to access, rectify, erase, and port your data. You can also restrict or object to processing.',
    securityMeasures: 'We implement end-to-end encryption and industry-standard security measures to protect your data.',
    internationalTransfer: 'Your data may be transferred to servers outside your country of residence.',
    contactInformation: 'Contact our Data Protection Officer at privacy@moodmash.com for any privacy concerns.',
  },
};

const COMPLIANCE_STATUSES: ComplianceStatus[] = [
  {
    framework: 'gdpr',
    compliant: true,
    lastAudit: new Date('2024-11-01'),
    certifications: ['ISO 27001', 'SOC 2 Type II'],
  },
  {
    framework: 'ccpa',
    compliant: true,
    lastAudit: new Date('2024-11-01'),
    certifications: ['CCPA Compliant'],
  },
  {
    framework: 'pipeda',
    compliant: true,
    lastAudit: new Date('2024-11-01'),
    certifications: ['PIPEDA Compliant'],
  },
  {
    framework: 'hipaa',
    compliant: true,
    lastAudit: new Date('2024-10-15'),
    certifications: ['HIPAA Compliant', 'HITECH Act'],
  },
  {
    framework: 'soc2',
    compliant: true,
    lastAudit: new Date('2024-11-01'),
    certifications: ['SOC 2 Type II', 'AICPA Trust Services'],
  },
];

// ============================================================================
// Context
// ============================================================================

const ComplianceContext = createContext<ComplianceContextType | undefined>(undefined);

// ============================================================================
// Utilities
// ============================================================================

const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

// ============================================================================
// Provider
// ============================================================================

export function ComplianceProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ComplianceState>({
    consents: new Map(INITIAL_CONSENTS.map((c) => [c.type, c])),
    dataRequests: [],
    complianceStatuses: COMPLIANCE_STATUSES,
    privacyPolicy: PRIVACY_POLICY,
    isLoading: false,
  });

  // ============================================================================
  // Consent Management
  // ============================================================================

  const getConsent = useCallback((type: ConsentType): boolean => {
    const consent = state.consents.get(type);
    return consent?.enabled ?? false;
  }, [state.consents]);

  const setConsent = useCallback((type: ConsentType, enabled: boolean) => {
    setState((prev) => {
      const newConsents = new Map(prev.consents);
      newConsents.set(type, {
        type,
        enabled,
        timestamp: new Date(),
        version: prev.privacyPolicy.version,
      });
      return { ...prev, consents: newConsents };
    });
  }, []);

  const getAllConsents = useCallback((): Consent[] => {
    return Array.from(state.consents.values());
  }, [state.consents]);

  const acceptAllConsents = useCallback(() => {
    setState((prev) => {
      const newConsents = new Map(prev.consents);
      prev.consents.forEach((_, type) => {
        newConsents.set(type, {
          type,
          enabled: true,
          timestamp: new Date(),
          version: prev.privacyPolicy.version,
        });
      });
      return { ...prev, consents: newConsents };
    });
  }, []);

  const rejectAllOptionalConsents = useCallback(() => {
    setState((prev) => {
      const newConsents = new Map(prev.consents);
      prev.consents.forEach((_consent, type) => {
        if (type !== 'essential') {
          newConsents.set(type, {
            type,
            enabled: false,
            timestamp: new Date(),
            version: prev.privacyPolicy.version,
          });
        }
      });
      return { ...prev, consents: newConsents };
    });
  }, []);

  // ============================================================================
  // Data Requests
  // ============================================================================

  const submitDataRequest = useCallback(async (type: DataRequest['type']): Promise<string> => {
    setState((prev) => ({ ...prev, isLoading: true }));

    await new Promise((resolve) => setTimeout(resolve, 1000));

    const requestId = generateUUID();
    const newRequest: DataRequest = {
      id: requestId,
      type,
      status: 'pending',
      createdAt: new Date(),
    };

    setState((prev) => ({
      ...prev,
      dataRequests: [...prev.dataRequests, newRequest],
      isLoading: false,
    }));

    return requestId;
  }, []);

  const getDataRequests = useCallback((): DataRequest[] => {
    return state.dataRequests;
  }, [state.dataRequests]);

  const cancelDataRequest = useCallback((requestId: string) => {
    setState((prev) => ({
      ...prev,
      dataRequests: prev.dataRequests.filter((r) => r.id !== requestId),
    }));
  }, []);

  // ============================================================================
  // Compliance Status
  // ============================================================================

  const getComplianceStatus = useCallback((framework: ComplianceFramework): ComplianceStatus | undefined => {
    return state.complianceStatuses.find((s) => s.framework === framework);
  }, [state.complianceStatuses]);

  // ============================================================================
  // Privacy Policy
  // ============================================================================

  const acceptPrivacyPolicy = useCallback((version: string) => {
    console.log('[Demo] Privacy policy accepted:', version);
  }, []);

  const getPrivacyPolicy = useCallback((): PrivacyPolicy => {
    return state.privacyPolicy;
  }, [state.privacyPolicy]);

  // ============================================================================
  // Data Export/Import
  // ============================================================================

  const exportUserData = useCallback(async (): Promise<string> => {
    setState((prev) => ({ ...prev, isLoading: true }));

    await new Promise((resolve) => setTimeout(resolve, 2000));

    const data = {
      exportDate: new Date().toISOString(),
      version: '1.0',
      consents: getAllConsents(),
      // In a real app, this would include all user data
      data: {
        moodEntries: [],
        settings: {},
      },
    };

    setState((prev) => ({ ...prev, isLoading: false }));

    return JSON.stringify(data, null, 2);
  }, [getAllConsents]);

  const deleteUserData = useCallback(async (): Promise<void> => {
    setState((prev) => ({ ...prev, isLoading: true }));

    await new Promise((resolve) => setTimeout(resolve, 2000));

    console.log('[Demo] User data deleted');

    setState((prev) => ({ ...prev, isLoading: false }));

    alert('Your data has been deleted from our servers.');
  }, []);

  // ============================================================================
  // Context Value
  // ============================================================================

  const value: ComplianceContextType = {
    ...state,
    getConsent,
    setConsent,
    getAllConsents,
    acceptAllConsents,
    rejectAllOptionalConsents,
    submitDataRequest,
    getDataRequests,
    cancelDataRequest,
    getComplianceStatus,
    acceptPrivacyPolicy,
    getPrivacyPolicy,
    exportUserData,
    deleteUserData,
  };

  return <ComplianceContext.Provider value={value}>{children}</ComplianceContext.Provider>;
}

// ============================================================================
// Hook
// ============================================================================

export function useCompliance() {
  const context = useContext(ComplianceContext);
  if (context === undefined) {
    throw new Error('useCompliance must be used within a ComplianceProvider');
  }
  return context;
}
