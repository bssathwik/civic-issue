import React, { createContext, useContext, useState } from 'react';

interface Report {
  id: number;
  type: string;
  description: string;
  photo: string | null;
  location: string;
  latitude: number; // Added latitude
  longitude: number; // Added longitude
}

interface ReportsContextProps {
  reports: Report[];
  addReport: (report: Report) => void;
}

const ReportsContext = createContext<ReportsContextProps | undefined>(undefined);

export const ReportsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [reports, setReports] = useState<Report[]>([]);

  const addReport = (report: Report) => {
    setReports(prevReports => [...prevReports, report]);
  };

  console.log('ReportsProvider is rendering');

  return (
    <ReportsContext.Provider value={{ reports, addReport }}>
      {children}
    </ReportsContext.Provider>
  );
};

export const useReports = () => {
  const context = useContext(ReportsContext);
  if (!context) {
    throw new Error('useReports must be used within a ReportsProvider');
  }
  return context;
};

export { ReportsContext };

