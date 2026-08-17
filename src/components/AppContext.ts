import { createContext } from 'react';
import { LocaleType } from '../types';

export const AppContext = createContext<AppContextType>({
  locale: 'nl',
  portalCode: '',
  objectCode: '',
  apiUrl: 'https://api.bukazu.com/graphql'
});

type AppContextType = {
  locale: LocaleType;
  portalCode: string;
  objectCode: string;
  apiUrl: string;
};
