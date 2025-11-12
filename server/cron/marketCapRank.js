const fetch = require("node-fetch");
const cron = require("node-cron");
const db = require("../client/mongo");
const { Sentry } = require("../sentry");
const { MARKET_CAP_RANK_COLLECTION } = require("../constants");
const { CMC_PRO_API_KEY } = process.env;

const getNextHour = () => {
  const date = new Date();
  date.setHours(date.getHours() + 1);

  return date.getHours();
};

// https://crontab.guru/#*/20_*_*_*_*
// At every 20th minute.
cron.schedule("*/20 * * * *", async () => {
  try {
    const database = await db.getDatabase();

    if (!database) {
      throw new Error("Mongo unavailable for marketCapRank");
    }

    if (!CMC_PRO_API_KEY) {
      throw new Error("CMC_PRO_API_KEY unavailable for marketCapRank");
    }

    console.log("Fetching market cap rank data from CoinMarketCap...");

    const res = await fetch(
      `https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=XNO&convert=USD&CMC_PRO_API_KEY=${CMC_PRO_API_KEY}`,
    );
    const {
      data: {
        XNO: {
          cmc_rank: marketCapRank
        }
      }
    } = await res.json();

    const hour = getNextHour();

    console.log("Updating market cap rank collection...");

    await database.collection(MARKET_CAP_RANK_COLLECTION).insertOne(
      {
        hour,
        value: marketCapRank,
        createdAt: new Date(),
      },
    );
    // Delete entries older than 48 hours
    await database.collection(MARKET_CAP_RANK_COLLECTION).deleteMany({
      createdAt: { $lt: new Date(Date.now() - 48 * 60 * 60 * 1000) },
    });

    console.log("Successfully updated market cap rank collection!");
  } catch (err) {
    console.log("Error: Could not update market cap rank collection");
    console.log(JSON.stringify(err));
    Sentry.captureException(err);
  }
});
