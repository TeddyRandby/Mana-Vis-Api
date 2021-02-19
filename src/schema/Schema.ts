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
import { manifyDeck } from "../manify/manify";

@ObjectType("Card")
@InterfaceType("CardInterface")
@InputType("CardInput")
export class Card {
  @Field(() => String)
  name: string;

  @Field(() => Int)
  count: number;
}

@ObjectType({ implements: Card })
@InterfaceType("ScryfallCardInterface")
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

@ObjectType({ implements: ScryfallCard })
export class ManaCard extends ScryfallCard {
  @Field()
  score: number;
}

@ObjectType()
export class WUBRGC {
  @Field()
  W: number;

  @Field()
  U: number;

  @Field()
  B: number;

  @Field()
  R: number;

  @Field()
  G: number;

  @Field()
  C: number;

  @Field()
  generic: number;
}

@InputType("DeckInput")
export class Deck {
  @Field(() => [Card])
  cards: Card[];
}

@Resolver()
export class RootResolver {
  @Query(() => [Card])
  async scrape(@Arg("url") url: string) {
    return await scrapeDeck(url);
  }

  @Query(() => [ScryfallCard])
  async scryfallifyURL(@Arg("url") url: string) {
    const data = await scryfallifyDeck(await scrapeDeck(url));
    return data;
  }

  @Query(() => [ManaCard])
  async manifyURL(@Arg("url") url: string) {
    return await manifyDeck(await scryfallifyDeck(await scrapeDeck(url)));
  }

  @Query(() => [ScryfallCard], { nullable: true })
  async scryfallifyDeck(@Arg("deck") deck: Deck) {
    return await scryfallifyDeck(deck.cards);
  }

  @Query(() => [ManaCard], { nullable: true })
  async manifyDeck(@Arg("deck") deck: Deck) {
    return await manifyDeck(await scryfallifyDeck(deck.cards));
  }
}
