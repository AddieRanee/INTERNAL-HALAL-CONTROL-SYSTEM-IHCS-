import { createContext, useContext, useState } from "react";

// Create the context
const CompanyContext = createContext();

// Provider component
export function CompanyProvider({ children }) {
  const [companyInfoId, setCompanyInfoId] = useState(null);

  return (
    <CompanyContext.Provider value={{ companyInfoId, setCompanyInfoId }}>
      {children}
    </CompanyContext.Provider>
  );
}

// Hook to use the context
export function useCompany() {
  return useContext(CompanyContext);
}
