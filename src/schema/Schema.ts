import {
  Resolver,
  Field,
  ObjectType,
  Query,
  Arg,
  InterfaceType,
  Int,
  InputType,
} from "type-graphql";

import { scrapeDeck } from "../scraper/scraper";
import { scryfallifyDeck } from "../scryfall/scryfallify";

@ObjectType("Card")
@InputType("CardInput")
@InterfaceType("CardInterface")
export class Card {
  @Field(() => String)
  name: string;

  @Field(() => Int)
  count: number;
}

@ObjectType({ implements: Card })
export class Mana extends Card {
  @Field()
  pips: string;

  @Field()
  score: number;

  @Field()
  cmc: number;
}

@ObjectType({ implements: Card })
export class ScryfallCard extends Card {
  @Field()
  scryfall_uri: string;

  @Field({ nullable: true })
  mana_cost?: string;

  @Field()
  cmc: number;

  @Field(() => [String], { nullable: true })
  colors?: string[];

  @Field(() => [String], { nullable: true })
  color_identity?: string[];

  @Field()
  type_line: string;

  @Field({ nullable: true })
  oracle_text?: string;
}

@InputType("URLDeckInput")
class UrlDeckUnion {
  @Field(() => String, { nullable: true })
  url?: string;

  @Field(() => [Card], { nullable: true })
  deck?: Card[];
}

@Resolver()
export class RootResolver {
  @Query(() => [Card])
  async scrape(@Arg("url") url: string) {
    return await scrapeDeck(url);
  }

  @Query(() => [ScryfallCard])
  async scryfallify(@Arg("urlORdeck") urlORdeck: UrlDeckUnion) {
    if (urlORdeck.deck) return await scryfallifyDeck(urlORdeck.deck);
    if (urlORdeck.url)
      return await scryfallifyDeck(await scrapeDeck(urlORdeck.url));
    return null;
  }

  @Query(() => [Mana], { nullable: true })
  async manify(@Arg("urlORdeck") urlORdeck: UrlDeckUnion) {
    if (urlORdeck.deck) {
      //  Call a helper function to map the [Card] into [Mana].
      //  return [Mana]
    } else if (urlORdeck.url) {
      //  Call a helper function to scrape URL into [Card].
      //     const deck: Card[] = await scrapeCards(urlORdeck.url);
      //  Call a helper function to map [Card] into [Mana].
    } else {
      return null;
    }
  }
}
