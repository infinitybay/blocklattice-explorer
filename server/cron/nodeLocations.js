const cron = require("node-cron");
const fetch = require("node-fetch");
const chunk = require("lodash/chunk");
const { rpc } = require("../rpc");
const { nodeCache } = require("../client/cache");
const db = require("../client/mongo");
const { Sentry } = require("../sentry");
const { NODE_LOCATIONS, EXPIRE_48H } = require("../constants");

const NODE_IP_REGEX = /\[::ffff:([\d.]+)\]:[\d]+/;

const getNodePeers = async () => {
  let peers;
  try {
    const { peers: rawPeers } = await rpc("peers", {
      peer_details: true,
    });

    peers = Object.entries(rawPeers).map(([rawIp, { node_id: nodeId }]) => {
      const [, ip] = rawIp.match(NODE_IP_REGEX);
      return { ip, rawIp, nodeId };
    });
  } catch (err) {
    console.log("Error", err);
    Sentry.captureException(err);
  }

  return peers;
};

const getNodeLocation = async ip => {
  try {
    const res = await fetch(`https://ipapi.co/${ip}/json`);
    const {
      version,
      city,
      region,
      country,
      country_name,
      continent_code,
      in_eu,
      currency,
      latitude,
      longitude,
      timezone,
      utc_offset,
      asn,
      org,
    } = await res.json();

    return {
      version,
      city,
      region,
      country,
      country_name,
      continent_code,
      in_eu,
      currency,
      latitude,
      longitude,
      timezone,
      utc_offset,
      asn,
      org,
    };
  } catch (err) {
    console.log(`${ip} had no response`);
  }

  return {};
};

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const doNodeLocations = async () => {
  console.log("Starting doNodeLocations");
  try {
    let peers = await getNodePeers();
    let results = [];

    const peersChunks = chunk(peers, 20);

    for (let i = 0; i < peersChunks.length; i++) {
      console.log(`Processing node location ${i + 1} of ${peersChunks.length}`);

      const locationResults = [];
      for (const { ip, ...rest } of peersChunks[i]) {
        const location = await getNodeLocation(ip);

        locationResults.push({
          ip,
          ...rest,
          location,
        });

        await sleep(240000); // Throttle API requests
      }

      results = results.concat(locationResults);
    }

    const database = await db.getDatabase();

    if (!database) {
      throw new Error("Mongo unavailable for doNodeLocations");
    }

    await database.collection(NODE_LOCATIONS).deleteMany({});
    await database.collection(NODE_LOCATIONS).insertMany(results);

    nodeCache.set(NODE_LOCATIONS, results, EXPIRE_48H);

    console.log("Done node location");
  } catch (err) {
    Sentry.captureException(err);
  }
};

// https://crontab.guru/#*_*/12_*_*_*
// At every 12th hour.
cron.schedule("* */12 * * *", async () => {
  if (process.env.NODE_ENV !== "production") return;

  doNodeLocations();
});

//doNodeLocations();
