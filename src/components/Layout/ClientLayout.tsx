'use client';

import React from 'react';
import QueryProvider from '@/providers/QueryProvider';
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import '@mantine/dropzone/styles.css';

interface ClientLayoutProps {
  children: React.ReactNode;
}

const ClientLayout: React.FC<ClientLayoutProps> = ({ children }) => {
  return (
    <MantineProvider>
      <Notifications position="top-right" zIndex={1000} />
      <QueryProvider>
        {children}
      </QueryProvider>
    </MantineProvider>
  );
};

export default ClientLayout; 