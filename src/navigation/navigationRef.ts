import { createNavigationContainerRef } from '@react-navigation/native';

export type RootStackParamList = {
  Lock: undefined;
  MainTabs: undefined;
  NewQuotation: { templateId?: string } | undefined;
  EditQuotation: { id: string };
  Customer: undefined;
  Preview: undefined;
  Scan: undefined;
  TextInput: { photoUri?: string } | undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Quotes: undefined;
  Settings: undefined;
};

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

export function navigate(name: keyof RootStackParamList, params?: any) {
  if (navigationRef.isReady()) {
    (navigationRef as any).navigate(name, params);
  }
}

export function goBack() {
  if (navigationRef.isReady() && navigationRef.canGoBack()) {
    navigationRef.goBack();
  }
}
