import * as React from "react";
import { Helmet } from "react-helmet";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

import { DownOutlined } from "@ant-design/icons";
import { Button, Dropdown, Menu, Tooltip, Typography } from "antd";
import BigNumber from "bignumber.js";
import orderBy from "lodash/orderBy";

import useLargeTransactions from "api/hooks/use-large-transactions";
import QuestionCircle from "components/QuestionCircle";
import { rawToRai } from "components/utils";
import TransactionsTable from "pages/Account/Transactions";
import { Transaction } from "types/transaction";

import type { PageParams } from "types/page";

const TRANSACTIONS_PER_PAGE = 25;
const { Text, Title } = Typography;

export enum SORT_BY {
  LATEST = "latest",
  LARGEST = "largest",
}

const LargeTransactions: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { sortBy: paramSortBy = SORT_BY.LATEST } = useParams<PageParams>();
  const { largeTransactions, isLoading } = useLargeTransactions();
  const [currentPage, setCurrentPage] = React.useState<number>(1);
  const [orderedTransactions, setOrderedTransactions] = React.useState<Transaction[]>();
  const defaultSortBy = Object.values(SORT_BY).includes(paramSortBy) ? paramSortBy : SORT_BY.LATEST;
  const [sortBy, setSortBy] = React.useState(defaultSortBy);

  const showPaginate = largeTransactions.length > TRANSACTIONS_PER_PAGE;

  React.useEffect(() => {
    const start = 0 + (currentPage - 1) * TRANSACTIONS_PER_PAGE;
    const data = largeTransactions.map(({ timestamp, block, hash, amount }) => ({
      ...block,
      amount,
      hash,
      largest: new BigNumber(rawToRai(amount)).toNumber(),
      latest: timestamp,
      local_timestamp: Math.floor(timestamp / 1000),
    }));
    const orderedData = orderBy(data, [sortBy.toLowerCase()], ["desc"]);
    const pageData = orderedData?.slice(start, start + TRANSACTIONS_PER_PAGE);

    // @ts-ignore
    setOrderedTransactions(pageData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [largeTransactions, sortBy, currentPage]);

  const handleSortBy = ({ key }: any) => {
    navigate(`/large-transactions/${key}`, { replace: true });
    setCurrentPage(1);
    setSortBy(key);
  };

  return (
    <>
      <Helmet>
        <title>Nano {t("menu.largeTransactions")}</title>
      </Helmet>
      <Title level={3}>{t("menu.largeTransactions")}</Title>

      <div style={{ marginBottom: "12px" }}>
        <Text>{t("pages.largeTransactions.description")}</Text>
        <Tooltip placement="right" title={t("tooltips.largeTransactions")}>
          <QuestionCircle />
        </Tooltip>
      </div>
      <div style={{ marginBottom: "12px" }}>
        <Dropdown
          overlay={
            <Menu onClick={handleSortBy}>
              {Object.values(SORT_BY).map(sortBy => (
                <Menu.Item key={sortBy}>{t(`pages.largeTransactions.${sortBy}`)}</Menu.Item>
              ))}
            </Menu>
          }
        >
          <Button>
            {t(`pages.largeTransactions.${sortBy}`)} <DownOutlined />
          </Button>
        </Dropdown>
      </div>

      <TransactionsTable
        data={orderedTransactions}
        isLoading={isLoading}
        isPaginated={true}
        showPaginate={showPaginate}
        pageSize={TRANSACTIONS_PER_PAGE}
        currentPage={currentPage}
        totalPages={largeTransactions.length}
        setCurrentPage={setCurrentPage}
      />
    </>
  );
};

export default LargeTransactions;
