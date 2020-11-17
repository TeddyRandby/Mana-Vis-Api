import axios from "axios";
import cheerio from "cheerio";

import { Card } from "../schema/Schema";

interface scrapeConfig {
  url: string;
  deckSelector: string;
  relativeCardCountSelector: string;
  relativeCardNameSelector: string;
}

async function scrape(config: scrapeConfig): Promise<Card[]> {
  return new Promise(async (resolve, reject) => {
    const ax = axios.create();

    const result = await ax.get(config.url);
    if (result.status !== 200)
      reject("Encountered error code: " + result.status);

    const html = result.data;
    const $ = cheerio.load(html);

    const deckSection: cheerio.Cheerio = $(config.deckSelector);

    let cards: Card[] = [];

    deckSection.each((_, elem) => {
      const count = parseInt(
        $(elem).find(config.relativeCardCountSelector).text()
      );
      const name = $(elem).find(config.relativeCardNameSelector).text();

      if (name && count) cards.push({ count, name });
    });

    resolve(cards);
  });
}

export function scrapeCards(url: string): Promise<Card[]> {
  if (url.includes("goldfish")) return goldfish(url);
  if (url.includes("tapped")) return tapped(url);
  return null;
}

// Scrapers for various deck sites begin here

async function goldfish(url: string): Promise<Card[]> {
  const config: scrapeConfig = {
    url: url,
    deckSelector: ".deck-view-deck-table > tbody > tr ",
    relativeCardNameSelector: "a",
    relativeCardCountSelector: ".text-right",
  };

  return scrape(config);
}

async function tapped(url: string): Promise<Card[]> {
  const config: scrapeConfig = {
    url: url,
    deckSelector: ".boardlist > li ",
    relativeCardNameSelector: ".card > a",
    relativeCardCountSelector: "a",
  };

  return scrape(config);
}
