import React, { createContext, useState, useContext, ReactNode } from 'react';

interface SetupData {
    // Personal details
    firstName?: string;
    lastName?: string;
    fullName?: string;
    gender?: string;
    email?: string;
    phone?: string;
    countryCode?: string;
    address?: string;
    
    // Business details
    businessName?: string;
    categories?: string[];
    
    // Additional fields for vendor application
    businessDescription?: string;
    productDescription?: string;
    expectedSales?: string;
    city?: string;
    state?: string;
    shopAddress?: string;
    businessRegNumber?: string;
    socialLink1?: string;
    socialLink2?: string;
    socialLink3?: string;
    
    // Files
    idDocument?: any;
    businessPhoto?: any;
}

interface SetupContextType {
    data: SetupData;
    update: (updates: Partial<SetupData>) => void;
    clearData: () => void;
}

const SetupContext = createContext<SetupContextType | undefined>(undefined);

export const useSetup = () => {
    const context = useContext(SetupContext);
    if (!context) {
        throw new Error('useSetup must be used within a SetupProvider');
    }
    return context;
};

interface SetupProviderProps {
    children: ReactNode;
}

export const SetupProvider: React.FC<SetupProviderProps> = ({ children }) => {
    const [data, setData] = useState<SetupData>({});

    const update = (updates: Partial<SetupData>) => {
        setData(prev => ({ ...prev, ...updates }));
    };

    const clearData = () => {
        setData({});
    };

    return (
        <SetupContext.Provider value={{ data, update, clearData }}>
            {children}
        </SetupContext.Provider>
    );
};