import React from 'react';
import { WalletConnector } from './WalletConnector';

export const Header: React.FC = () => {
  return (
    <div className="neo-flex justify-end">
      <WalletConnector />
    </div>
  );
};