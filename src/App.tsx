// import "antd/dist/antd.css";
import "antd/dist/reset.css";
import "leaflet/dist/leaflet.css";
import "leaflet-extra-markers/dist/css/leaflet.extra-markers.min.css";
import "./App.css";
import "./Theme.css";

import * as React from "react";
import { Helmet } from "react-helmet";
import { useTranslation } from "react-i18next";
import { Route, Routes } from "react-router-dom";

import { ConfigProvider, Layout, theme } from "antd";

import "components/utils/analytics";
import { PreferencesContext, Theme } from "api/contexts/Preferences";
import AppFooter from "components/AppFooter";
import AppHeader from "components/AppHeader";
// import NodeHealth from "components/NodeHealth";
import Notification from "components/Notification";
import i18next from "i18next";
import AccountPage from "pages/Account";
import BlockPage from "pages/Block";
import BookmarksPage from "pages/Bookmarks";
import DeveloperFundPage from "pages/DeveloperFund";
import DeveloperFundTransactionsPage from "pages/DeveloperFund/Transactions";
import ExchangeTrackerPage from "pages/ExchangeTracker";
import FaucetsPage from "pages/Faucets";
import HomePage from "pages/Home";
import KnownAccountsPage from "pages/KnownAccounts";
import LargeTransactionsPage from "pages/LargeTransactions";
import NanoBrowserQuestPage from "pages/NanoBrowserQuest";
import NanoQuakeJSPage from "pages/NanoQuakeJS";
import NetworkStatusPage from "pages/NetworkStatus";
import NewsPage from "pages/News";
import NodeMonitorsPage from "pages/NodeMonitors";
import NodeStatusPage from "pages/NodeStatus";
import PreferencesPage from "pages/Preferences";
import RepresentativesPage from "pages/Representatives";
import Statistics2Miners from "pages/Statistics/2Miners";
import StatisticsSocial from "pages/Statistics/Social";
import TreasureHunt from "pages/TreasureHunt";
import WhatIsNanoPage from "pages/WhatIsNano";

const { Content } = Layout;

const App: React.FC = () => {
  const { t } = useTranslation();
  const { theme: themeContext } = React.useContext(PreferencesContext);

  return (
    <ConfigProvider
      theme={{
        algorithm: themeContext === Theme.DARK ? theme.darkAlgorithm : undefined,
      }}
    >
      <Helmet>
        <html lang={i18next.language} />
        <title>Blocklattice Explorer</title>
        <meta name="description" content="Block explorer of the Nano cryptocurrency" />
        <meta name="theme-color" content={themeContext === Theme.DARK ? "#131313" : "#eff2f5"} />
      </Helmet>
      <Layout
        style={{ minHeight: "100vh" }}
        className={themeContext ? `theme-${themeContext}` : undefined}
      >
        {/* <NodeHealth /> */}
        <AppHeader />
        <Notification />
        <Content>
          <Routes>
            <Route path="/" element={<HomePage/>} />
            <Route path="/representatives" element={<RepresentativesPage/>} />
            <Route path="/developer-fund" element={<DeveloperFundPage/>} />
            <Route path="/developer-fund/transactions" element={<DeveloperFundTransactionsPage/>} />
            <Route path="/known-accounts" element={<KnownAccountsPage/>} />
            <Route path="/exchange-tracker" element={<ExchangeTrackerPage/>} />
            <Route path="/faucets" element={<FaucetsPage/>} />
            <Route path="/large-transactions/:sortBy?" element={<LargeTransactionsPage/>} />
            <Route path="/account/:account?/:section?" element={<AccountPage/>} />
            <Route path="/block/:block?" element={<BlockPage/>} />
            <Route path="/news/:feed?" element={<NewsPage/>} />
            <Route path="/node-status" element={<NodeStatusPage/>} />
            <Route path="/network-status" element={<NetworkStatusPage/>} />
            <Route path="/node-monitors" element={<NodeMonitorsPage/>} />
            <Route path="/what-is-nano" element={<WhatIsNanoPage/>} />
            <Route path="/preferences" element={<PreferencesPage/>} />
            <Route path="/bookmarks" element={<BookmarksPage/>} />
            <Route path="/nanoquakejs" element={<NanoQuakeJSPage/>} />
            <Route path="/treasure-hunt/:account?" element={<TreasureHunt/>} />
            <Route path="/statistics/social" element={<StatisticsSocial/>} />
            <Route path="/statistics/2miners" element={<Statistics2Miners/>} />
          </Routes>
        </Content>
        <AppFooter />
      </Layout>
    </ConfigProvider>
  );
};

export default App;
