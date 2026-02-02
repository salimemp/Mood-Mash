import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

// ============================================================================
// Types
// ============================================================================

export interface EncryptionStatus {
  enabled: boolean;
  algorithm: string;
  keySize: number;
  lastKeyRotation: Date;
  nextKeyRotation: Date;
}

export interface EncryptedData {
  id: string;
  encryptedContent: string;
  iv: string;
  tag: string;
  createdAt: Date;
  updatedAt: Date;
}

interface EncryptionState {
  status: EncryptionStatus;
  isEncrypting: boolean;
  isDecrypting: boolean;
  encryptionKeyId: string | null;
}

interface EncryptionContextType extends EncryptionState {
  // Encryption Operations
  encrypt: (plaintext: string) => Promise<EncryptedData>;
  decrypt: (encryptedData: EncryptedData) => Promise<string>;
  encryptObject: <T>(obj: T) => Promise<EncryptedData[]>;
  decryptObject: <T>(encryptedData: EncryptedData[]) => Promise<T>;

  // Key Management
  generateKey: () => Promise<string>;
  rotateKey: () => Promise<void>;
  exportKey: () => Promise<string>;
  importKey: (keyData: string) => Promise<void>;

  // Status
  getEncryptionStatus: () => EncryptionStatus;
  isDataEncrypted: (data: unknown) => boolean;
}

// ============================================================================
// Context
// ============================================================================

const EncryptionContext = createContext<EncryptionContextType | undefined>(undefined);

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

const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    const byte = bytes[i];
    if (byte !== undefined) {
      binary += String.fromCharCode(byte);
    }
  }
  return btoa(binary);
};

// ============================================================================
// Provider
// ============================================================================

export function EncryptionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<EncryptionState>({
    status: {
      enabled: true,
      algorithm: 'AES-GCM',
      keySize: 256,
      lastKeyRotation: new Date(),
      nextKeyRotation: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
    },
    isEncrypting: false,
    isDecrypting: false,
    encryptionKeyId: null,
  });

  // ============================================================================
  // Encryption Operations (Mock Implementation)
  // ============================================================================

  const encrypt = useCallback(async (plaintext: string): Promise<EncryptedData> => {
    setState((prev) => ({ ...prev, isEncrypting: true }));

    // Simulate encryption delay
    await new Promise((resolve) => setTimeout(resolve, 100));

    // In a real implementation, this would use Web Crypto API
    const mockEncrypted = btoa(plaintext).split('').reverse().join('');
    const mockIv = arrayBufferToBase64(crypto.getRandomValues(new Uint8Array(12)));
    const mockTag = arrayBufferToBase64(crypto.getRandomValues(new Uint8Array(16)));

    const encryptedData: EncryptedData = {
      id: generateUUID(),
      encryptedContent: mockEncrypted,
      iv: mockIv,
      tag: mockTag,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setState((prev) => ({ ...prev, isEncrypting: false }));

    return encryptedData;
  }, []);

  const decrypt = useCallback(async (encryptedData: EncryptedData): Promise<string> => {
    setState((prev) => ({ ...prev, isDecrypting: true }));

    // Simulate decryption delay
    await new Promise((resolve) => setTimeout(resolve, 100));

    // In a real implementation, this would use Web Crypto API
    const decrypted = atob(encryptedData.encryptedContent).split('').reverse().join('');

    setState((prev) => ({ ...prev, isDecrypting: false }));

    return decrypted;
  }, []);

  const encryptObject = useCallback(
    async function <T>(obj: T): Promise<EncryptedData[]> {
      const jsonString = JSON.stringify(obj);
      const encrypted = await encrypt(jsonString);
      return [encrypted];
    },
    [encrypt]
  );

  const decryptObject = useCallback(
    async function <T>(encryptedData: EncryptedData[]): Promise<T> {
      const decryptedStrings = await Promise.all(encryptedData.map((d) => decrypt(d)));
      const jsonString = decryptedStrings.join('');
      return JSON.parse(jsonString) as T;
    },
    [decrypt]
  );

  // ============================================================================
  // Key Management
  // ============================================================================

  const generateKey = useCallback(async (): Promise<string> => {
    await new Promise((resolve) => setTimeout(resolve, 500));

    // In a real implementation, this would generate an AES-GCM key
    const mockKey = arrayBufferToBase64(crypto.getRandomValues(new Uint8Array(32)));
    const keyId = generateUUID();

    setState((prev) => ({
      ...prev,
      encryptionKeyId: keyId,
    }));

    return mockKey;
  }, []);

  const rotateKey = useCallback(async (): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const newKeyId = await generateKey();

    setState((prev) => ({
      ...prev,
      status: {
        ...prev.status,
        lastKeyRotation: new Date(),
        nextKeyRotation: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      },
      encryptionKeyId: newKeyId,
    }));

    console.log('[Demo] Encryption key rotated');
  }, [generateKey]);

  const exportKey = useCallback(async (): Promise<string> => {
    await new Promise((resolve) => setTimeout(resolve, 300));

    // In a real implementation, this would export the actual key
    const mockExportedKey = arrayBufferToBase64(
      crypto.getRandomValues(new Uint8Array(32))
    );

    return JSON.stringify({
      keyId: state.encryptionKeyId,
      exportedKey: mockExportedKey,
      algorithm: state.status.algorithm,
      exportedAt: new Date().toISOString(),
    });
  }, [state.encryptionKeyId, state.status.algorithm]);

  const importKey = useCallback(async (keyData: string): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const parsed = JSON.parse(keyData);

    setState((prev) => ({
      ...prev,
      encryptionKeyId: parsed.keyId,
    }));

    console.log('[Demo] Encryption key imported');
  }, []);

  // ============================================================================
  // Status
  // ============================================================================

  const getEncryptionStatus = useCallback((): EncryptionStatus => {
    return state.status;
  }, [state.status]);

  const isDataEncrypted = useCallback((data: unknown): boolean => {
    if (typeof data !== 'object' || data === null) {
      return false;
    }

    const obj = data as Record<string, unknown>;
    return (
      'encryptedContent' in obj &&
      'iv' in obj &&
      'tag' in obj &&
      typeof obj['encryptedContent'] === 'string' &&
      typeof obj['iv'] === 'string' &&
      typeof obj['tag'] === 'string'
    );
  }, []);

  // ============================================================================
  // Context Value
  // ============================================================================

  const value: EncryptionContextType = {
    ...state,
    encrypt,
    decrypt,
    encryptObject,
    decryptObject,
    generateKey,
    rotateKey,
    exportKey,
    importKey,
    getEncryptionStatus,
    isDataEncrypted,
  };

  return <EncryptionContext.Provider value={value}>{children}</EncryptionContext.Provider>;
}

// ============================================================================
// Hook
// ============================================================================

export function useEncryption() {
  const context = useContext(EncryptionContext);
  if (context === undefined) {
    throw new Error('useEncryption must be used within an EncryptionProvider');
  }
  return context;
}
