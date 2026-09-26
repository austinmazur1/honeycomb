import { Tabs, TabList, TabTrigger, TabSlot } from 'expo-router/ui';

import { AppTabButton } from './app-tab-button';
import { AppTabList } from './app-tab-list';

export default function AppTabs() {
  return (
    <Tabs>
      <TabSlot style={{ height: '100%' }} />
      <TabList asChild>
        <AppTabList>
          <TabTrigger name="home" href="/" asChild>
            <AppTabButton>Home</AppTabButton>
          </TabTrigger>
          <TabTrigger name="collections" href="/collections" asChild>
            <AppTabButton>Collections</AppTabButton>
          </TabTrigger>
          <TabTrigger name="profile" href="/profile" asChild>
            <AppTabButton>Profile</AppTabButton>
          </TabTrigger>
        </AppTabList>
      </TabList>
    </Tabs>
  );
}
