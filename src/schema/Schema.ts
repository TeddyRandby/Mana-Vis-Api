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

import { scrapeCards } from "../scraper/scraper";

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
  curve: number;
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
    return await scrapeCards(url);
  }

  @Query(() => [Mana], { nullable: true })
  async manify(@Arg("urlORdeck") urlORdeck: UrlDeckUnion) {
    // If urlOrDeck.deck:
    //  Call a helper function to analyze the map the [Card] into [Mana].
    //  return [Mana]
    // Else if urlOrDeck.url:
    //  Call a helper function to scrape URL into [Card].
    //  Call a helper function to map [Card] into [Mana].
    //  return [Mana]
    // Else:
    //  return null
    //
  }
}
